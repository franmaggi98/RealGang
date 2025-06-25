import { writable } from 'svelte/store';

export type Deck = {
  id: number;
  name: string;
};
// --- Types ---
export type Player = {
  id: number;
  name: string;
  points: number;
  opponents: number[];
  opponentDifficulty: number;
  victories: number;
  draws: number;
  tieBreaker?: boolean;
  decks: Deck[]; // ← nueva propiedad
};

export type Match = {
  player1: Player;
  player2: Player | null;
  deck1Id?: number; // ← deck seleccionado de player1
  deck2Id?: number; // ← deck seleccionado de player2
  result: 'win' | 'loss' | 'draw' | '';
};

const maxRounds = 5;

type InvalidMatch = { player1Id: number; player2Id: number };

type TournamentState = {
  players: Player[];
  roundNumber: number;
  tournamentStarted: boolean;
  tournamentFinished: boolean;
  currentMatches: Match[];
  invalidMatches: InvalidMatch[];
  retries: number;
  history: TournamentState[];
};

const initialState: TournamentState = {
  players: [],
  roundNumber: 1,
  tournamentStarted: false,
  tournamentFinished: false,
  currentMatches: [],
  invalidMatches: [],
  retries: 0,
  history: []
};

const tournamentStore = writable<TournamentState>(initialState);

const loadFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    const storedPlayers = localStorage.getItem('players');
    const storedRoundNumber = localStorage.getItem('roundNumber');
    const storedTournamentStarted = localStorage.getItem('tournamentStarted');
    const storedTournamentFinished = localStorage.getItem('tournamentFinished');
    const storedCurrentMatches = localStorage.getItem('currentMatches');
    const storedInvalidMatches = localStorage.getItem('invalidMatches');
    const storedHistory = localStorage.getItem('history');

    if (storedPlayers) {
      const players: Player[] = JSON.parse(storedPlayers);
      // Asegúrate de inicializar decks en players que no lo tuvieran
      const playersWithDecks = players.map((p) => ({ ...p, decks: p.decks || [] }));
      tournamentStore.update((s) => ({ ...s, players: playersWithDecks }));
    }
    if (storedRoundNumber) {
      tournamentStore.update((state) => ({
        ...state,
        roundNumber: parseInt(storedRoundNumber, 10)
      }));
    }
    if (storedTournamentStarted) {
      tournamentStore.update((state) => ({
        ...state,
        tournamentStarted: storedTournamentStarted === 'true'
      }));
    }
    if (storedTournamentFinished) {
      tournamentStore.update((state) => ({
        ...state,
        tournamentFinished: storedTournamentFinished === 'true'
      }));
    }
    if (storedCurrentMatches) {
      tournamentStore.update((state) => ({
        ...state,
        currentMatches: JSON.parse(storedCurrentMatches)
      }));
      if (storedInvalidMatches) {
        tournamentStore.update((state) => ({
          ...state,
          invalidMatches: JSON.parse(storedInvalidMatches)
        }));
      }
    }
    if (storedHistory) {
      tournamentStore.update((state) => ({
        ...state,
        history: JSON.parse(storedHistory)
      }));
    }
  }
};

const saveStateToLocalStorage = () => {
  tournamentStore.subscribe((state) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('players', JSON.stringify(state.players));
      localStorage.setItem('roundNumber', state.roundNumber.toString());
      localStorage.setItem('tournamentStarted', state.tournamentStarted.toString());
      localStorage.setItem('tournamentFinished', state.tournamentFinished.toString());
      localStorage.setItem('currentMatches', JSON.stringify(state.currentMatches));
      localStorage.setItem('invalidMatches', JSON.stringify(state.invalidMatches));
      localStorage.setItem('history', JSON.stringify(state.history));
    }
  });
};

const addDeckToPlayer = (playerId: number, deckName: string) => {
  tournamentStore.update((state) => {
    const players = state.players.map((p) => {
      if (p.id === playerId) {
        const newDeck: Deck = {
          id: p.decks.length > 0 ? Math.max(...p.decks.map((d) => d.id)) + 1 : 1,
          name: deckName.trim()
        };
        return { ...p, decks: [...p.decks, newDeck] };
      }
      return p;
    });
    return { ...state, players };
  });
  saveStateToLocalStorage();
};

const removeDeckFromPlayer = (playerId: number, deckId: number) => {
  tournamentStore.update((state) => {
    const players = state.players.map((p) => {
      if (p.id === playerId) {
        return { ...p, decks: p.decks.filter((d) => d.id !== deckId) };
      }
      return p;
    });
    return { ...state, players };
  });
  saveStateToLocalStorage();
};

const addPlayer = (name: string) => {
  tournamentStore.update((state) => {
    if (state.tournamentStarted || state.tournamentFinished) {
      alert('Cannot add players after the tournament has started or finished.');
      return state;
    }

    const existingPlayer = state.players.find(
      (player) => player.name.toLowerCase() === name.toLowerCase()
    );
    if (existingPlayer) {
      alert('Player name already exists. Please choose a different name.');
      return state;
    }

    const duplicateId = state.players.some((player) => player.id === state.players.length + 1);
    if (duplicateId) {
      return state;
    }

    const newPlayer: Player = {
      id: state.players.length + 1,
      name: name.trim(),
      points: 0,
      opponents: [],
      opponentDifficulty: 0,
      victories: 0,
      draws: 0,
      decks: []
    };

    return { ...state, players: [...state.players, newPlayer] };
  });
  saveStateToLocalStorage();
};

const deletePlayer = (playerId: number) => {
  tournamentStore.update((state) => ({
    ...state,
    players: state.players.filter((player) => player.id !== playerId)
  }));
  saveStateToLocalStorage();
};

const startTournament = () => {
  tournamentStore.update((state) => {
    if (state.players.length < 2) {
      alert('You need at least 2 players to start the tournament.');
      return state;
    }

    return {
      ...state,
      tournamentStarted: true,
      tournamentFinished: false,
      roundNumber: 1,
      currentMatches: pairPlayersRandomly([...state.players], state.invalidMatches),
      invalidMatches: [],
      retries: 0,
      history: []
    };
  });
  saveStateToLocalStorage();
};

const submitResults = () => {
  tournamentStore.update((state) => {
    const { ...stateSnapshot } = state;
    const stateClone = JSON.parse(JSON.stringify(stateSnapshot));
    state.history.push(stateClone);

    const allResultsSet = state.currentMatches.every(
      (match) => match.result !== '' || match.player2 === null
    );

    if (!allResultsSet) {
      alert('Please select a result for each match before submitting.');
      return state;
    }

    const updatedPlayers = state.players.map((player) => ({ ...player }));

    state.currentMatches.forEach((match) => {
      if (match.player2 === null) {
        const player1 = updatedPlayers.find((p) => p.id === match.player1.id);
        if (player1) {
          player1.points += 2;
          player1.victories += 1;
        }
      } else {
        const player1 = updatedPlayers.find((p) => p.id === match.player1.id);
        const player2 = updatedPlayers.find((p) => p.id === match.player2!.id);

        if (player1 && player2) {
          if (match.result === 'win') {
            player1.points += 2;
            player1.victories += 1;
          } else if (match.result === 'loss') {
            player2.points += 2;
            player2.victories += 1;
          } else if (match.result === 'draw') {
            player1.points += 1;
            player2.points += 1;
            player1.draws += 1;
            player2.draws += 1;
          }

          player1.opponents.push(player2.id);
          player2.opponents.push(player1.id);

          state.invalidMatches.push({ player1Id: player1.id, player2Id: player2.id });
        }
      }
    });

    updatedPlayers.forEach((player) => {
      player.opponentDifficulty = calculateOpponentDifficulty(player, updatedPlayers);
    });

    const sortedPlayers = updatedPlayers.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.victories !== a.victories) return b.victories - a.victories;
      return b.draws - a.draws;
    });

    const playersWithTieBreakers = breakTies(sortedPlayers, state.currentMatches);

    if (state.roundNumber >= maxRounds) {
      return {
        ...state,
        players: playersWithTieBreakers,
        tournamentFinished: true,
        tournamentStarted: true
      };
    } else {
      try {
        const nextRoundMatches = pairPlayers([...playersWithTieBreakers], state.invalidMatches);
        return {
          ...state,
          players: playersWithTieBreakers,
          currentMatches: nextRoundMatches,
          roundNumber: state.roundNumber + 1
        };
      } catch (error) {
        return {
          ...state,
          players: playersWithTieBreakers,
          tournamentFinished: true,
          tournamentStarted: true
        };
      }
    }
  });

  saveStateToLocalStorage();
};

const resetTournament = () => {
  localStorage.clear();
  tournamentStore.set(initialState);
  saveStateToLocalStorage();
};
const pairPlayers = (
  players: Player[],
  invalidMatches: Array<{ player1Id: number; player2Id: number }>
): Match[] => {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  const backtrackPairing = (remaining: Player[], currentPairs: Match[]): Match[] | null => {
    if (remaining.length === 0) return currentPairs;

    if (remaining.length % 2 !== 0) {
      const sortedRemaining = [...remaining].sort((a, b) => a.points - b.points);

      const candidates = sortedRemaining.filter((player) => !player.opponents.includes(-1));
      if (candidates.length === 0) return null;

      const minPoints = Math.min(...candidates.map((p) => p.points));
      const tiedCandidates = candidates.filter((p) => p.points === minPoints);

      const randomIndex = Math.floor(Math.random() * tiedCandidates.length);
      const candidate = tiedCandidates[randomIndex];

      const index = remaining.findIndex((p) => p.id === candidate.id);
      if (index !== -1) {
        const newRemaining = [...remaining.slice(0, index), ...remaining.slice(index + 1)];

        candidate.opponents.push(-1);

        const byeMatch: Match = { player1: candidate, player2: null, result: '' };
        const result = backtrackPairing(newRemaining, [...currentPairs, byeMatch]);
        if (result !== null) return result;
      }
      return null;
    }

    const first = remaining[0];
    for (let i = 1; i < remaining.length; i++) {
      const candidate = remaining[i];

      const hasPlayed =
        first.opponents.includes(candidate.id) || candidate.opponents.includes(first.id);

      const isInvalid = invalidMatches.some(
        (match) =>
          (match.player1Id === first.id && match.player2Id === candidate.id) ||
          (match.player1Id === candidate.id && match.player2Id === first.id)
      );

      if (!hasPlayed && !isInvalid) {
        const newRemaining = [...remaining.slice(1, i), ...remaining.slice(i + 1)];
        const newPair: Match = { player1: first, player2: candidate, result: '' };
        const result = backtrackPairing(newRemaining, [...currentPairs, newPair]);
        if (result !== null) return result;
      }
    }
    return null;
  };

  const result = backtrackPairing(sortedPlayers, []);
  if (result === null) {
    throw new Error('No se pudo encontrar un emparejamiento válido.');
  }
  return result;
};

const pairPlayersRandomly = (
  players: Player[],
  invalidMatches: Array<{ player1Id: number; player2Id: number }>
): Match[] => {
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  return pairPlayers(shuffledPlayers, invalidMatches);
};

const breakTies = (players: Player[], matches: Match[]): Player[] => {
  return players.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    if (a.points === b.points) {
      const directMatch = findDirectMatch(a, b, matches);
      if (directMatch) {
        if (directMatch.player1.id === a.id && directMatch.result === 'win') {
          a.tieBreaker = true;
          return -1;
        } else if (directMatch.player1.id === b.id && directMatch.result === 'win') {
          b.tieBreaker = true;
          return 1;
        }
      }
      if (b.opponentDifficulty > a.opponentDifficulty) {
        b.tieBreaker = true;
        return 1;
      } else if (a.opponentDifficulty > b.opponentDifficulty) {
        a.tieBreaker = true;
        return -1;
      }
      const aWins = a.opponents.filter((opponentId) => {
        const opponent = players.find((p) => p.id === opponentId);
        return opponent && opponent.points < a.points;
      }).length;

      const bWins = b.opponents.filter((opponentId) => {
        const opponent = players.find((p) => p.id === opponentId);
        return opponent && opponent.points < b.points;
      }).length;

      if (bWins > aWins) {
        b.tieBreaker = true;
        return 1;
      } else if (aWins > bWins) {
        a.tieBreaker = true;
        return -1;
      }
      return 0;
    }
    return 0;
  });
};

const findDirectMatch = (playerA: Player, playerB: Player, matches: Match[]): Match | null => {
  const directMatch = matches.find(
    (match) =>
      (match.player1.id === playerA.id && match.player2?.id === playerB.id) ||
      (match.player1.id === playerB.id && match.player2?.id === playerA.id)
  );

  return directMatch || null;
};
const calculateOpponentDifficulty = (player: Player, allPlayers: Player[]): number => {
  let difficultySum = player.points;
  const weight = 0.5;

  player.opponents.forEach((opponentId) => {
    if (opponentId === -1) return;

    const opponent = allPlayers.find((p) => p.id === opponentId);
    if (opponent) {
      let buchholzSum = 0;
      let count = 0;
      opponent.opponents.forEach((innerOpponentId) => {
        if (innerOpponentId === -1) return;
        const innerOpponent = allPlayers.find((p) => p.id === innerOpponentId);
        if (innerOpponent) {
          buchholzSum += innerOpponent.points;
          count++;
        }
      });
      const buchholzAvg = count > 0 ? buchholzSum / count : 0;

      difficultySum += (opponent.points + weight * buchholzAvg) / 10;
    }
  });
  return difficultySum;
};

const previousRound = () => {
  tournamentStore.update((state) => {
    if (state.history.length === 0) {
      alert('No hay rondas anteriores a las que volver.');
      return state;
    }

    const previousState = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);

    return {
      ...previousState,
      history: newHistory
    };
  });
  saveStateToLocalStorage();
};

export default {
  subscribe: tournamentStore.subscribe,
  set: tournamentStore.set, // ✅ Añade esto
  loadFromLocalStorage,
  update: tournamentStore.update,
  addPlayer,
  deletePlayer,
  startTournament,
  submitResults,
  resetTournament,
  previousRound,
  addDeckToPlayer,
  removeDeckFromPlayer
};
