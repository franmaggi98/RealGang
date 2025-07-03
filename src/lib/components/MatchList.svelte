<script lang="ts">
  import { get } from 'svelte/store';
  import tournamentStore, { type Player, type Match } from '../../store/tournamentStore';

  // Devuelve el ID del equipo al que pertenece un jugador (o null si no está en modo equipos)
  function getPlayerTeam(playerId: number): number | null {
    const { teamMode, teams } = get(tournamentStore);
    if (!teamMode) return null;
    for (const team of teams) {
      if (team.players.includes(playerId)) {
        return team.id;
      }
    }
    return null;
  }

  // Intercambia dos jugadores en todos los partidos actuales, historiales y matches inválidos
  const swapPlayers = (player1Id: number, player2Id: number) => {
    tournamentStore.update((state) => {
      // 1) Actualizar currentMatches
      const updatedMatches: Match[] = state.currentMatches.map((match) => {
        const m = { ...match };
        if (m.player1.id === player1Id) {
          m.player1 = state.players.find((p) => p.id === player2Id)!;
        } else if (m.player1.id === player2Id) {
          m.player1 = state.players.find((p) => p.id === player1Id)!;
        }
        if (m.player2?.id === player1Id) {
          m.player2 = state.players.find((p) => p.id === player2Id)!;
        } else if (m.player2?.id === player2Id) {
          m.player2 = state.players.find((p) => p.id === player1Id)!;
        }
        return m;
      });

      // 2) Actualizar lista de jugadores y sus oponentes
      const updatedPlayers: Player[] = state.players.map((player) => {
        if (player.id !== player1Id && player.id !== player2Id) {
          const newOpps = player.opponents.map((opp) =>
            opp === player1Id ? player2Id : opp === player2Id ? player1Id : opp
          );
          return { ...player, opponents: newOpps };
        }
        if (player.id === player1Id) {
          const other = state.players.find((p) => p.id === player2Id)!;
          return { ...player, opponents: other.opponents.slice() };
        }
        if (player.id === player2Id) {
          const other = state.players.find((p) => p.id === player1Id)!;
          return { ...player, opponents: other.opponents.slice() };
        }
        return player;
      });

      // 3) Actualizar invalidMatches
      const updatedInvalidMatches = state.invalidMatches.map((inv) => {
        let { player1Id: p1, player2Id: p2 } = inv;
        if (p1 === player1Id) p1 = player2Id;
        else if (p1 === player2Id) p1 = player1Id;
        if (p2 === player1Id) p2 = player2Id;
        else if (p2 === player2Id) p2 = player1Id;
        return { player1Id: p1, player2Id: p2 };
      });

      return {
        ...state,
        currentMatches: updatedMatches,
        players: updatedPlayers,
        invalidMatches: updatedInvalidMatches
      };
    });
  };

  // --- Cambiar jugador en un match ---
  function handlePlayerChange(
    matchIndex: number,
    playerKey: 'player1' | 'player2',
    newPlayerId: number
  ) {
    const state = get(tournamentStore);
    const match = state.currentMatches[matchIndex];
    if (!match) return;
    const currentPlayer = match[playerKey];
    if (!currentPlayer) return; // bye guard

    const currentId = currentPlayer.id;
    if (state.teamMode) {
      const t1 = getPlayerTeam(currentId);
      const t2 = getPlayerTeam(newPlayerId);
      if (t1 && t2 && t1 === t2) {
        alert('Cannot swap with a teammate');
        return;
      }
    }
    swapPlayers(currentId, newPlayerId);
  }

  // --- Validación de resultado ---
  function isValidResult(match: Match): boolean {
    if (!match.player2) return true;
    if (!match.result) return false;
    return match.result.games1 + match.result.games2 <= 3;
  }

  // --- Actualizar resultado ---
  function updateResult(matchIndex: number, games1: number, games2: number) {
    tournamentStore.update((state) => {
      const updated = [...state.currentMatches];
      updated[matchIndex] = { ...updated[matchIndex], result: { games1, games2 } };
      return { ...state, currentMatches: updated };
    });
  }

  // --- Handlers extraídos para el template ---
  function onGames1Change(matchIndex: number, e: Event) {
    const val = parseInt((e.currentTarget as HTMLSelectElement).value);
    const currentResult = get(tournamentStore).currentMatches[matchIndex].result;
    updateResult(matchIndex, val, currentResult?.games2 ?? 0);
  }
  function onGames2Change(matchIndex: number, e: Event) {
    const val = parseInt((e.currentTarget as HTMLSelectElement).value);
    const currentResult = get(tournamentStore).currentMatches[matchIndex].result;
    updateResult(matchIndex, currentResult?.games1 ?? 0, val);
  }

  // --- Nuevos handlers para decks ---
  function onDeck1Change(matchIndex: number, e: Event) {
    const val = parseInt((e.currentTarget as HTMLSelectElement).value);
    tournamentStore.update((s) => {
      const m = [...s.currentMatches];
      m[matchIndex].deck1Id = isNaN(val) ? undefined : val;
      return { ...s, currentMatches: m };
    });
  }
  function onDeck2Change(matchIndex: number, e: Event) {
    const val = parseInt((e.currentTarget as HTMLSelectElement).value);
    tournamentStore.update((s) => {
      const m = [...s.currentMatches];
      m[matchIndex].deck2Id = isNaN(val) ? undefined : val;
      return { ...s, currentMatches: m };
    });
  }
</script>

{#each $tournamentStore.currentMatches as match, index (index)}
  <div class="flex flex-col mb-6 p-4 border rounded-lg w-full">
    {#if match.player2}
      <div class="mb-3 flex justify-center items-center w-full flex-col">
        <div class="flex flex-row gap-4 w-full justify-center">
          <!-- Games1 -->
          <select
            class="select select-bordered w-full"
            on:change={(e) => onGames1Change(index, e)}
            value={match.result?.games1 ?? ''}
          >
            <option value="" disabled>select result</option>
            {#each [0, 1, 2] as num}
              <option value={num}>{num}</option>
            {/each}
          </select>

          <span class="text-xl font-bold self-center">–</span>

          <!-- Games2 -->
          <select
            class="select select-bordered w-full"
            on:change={(e) => onGames2Change(index, e)}
            value={match.result?.games2 ?? ''}
          >
            <option value="" disabled>select result</option>
            {#each [0, 1, 2] as num}
              <option value={num}>{num}</option>
            {/each}
          </select>
        </div>
        <div class="flex-1">
          {#if !isValidResult(match) && match.result}
            <div class="text-error text-xs text-center mt-2">Invalid result (max 3 games)</div>
          {/if}
        </div>
      </div>
    {:else}
      <div class="text-success font-bold text-center mb-4">Bye</div>
    {/if}

    <div class="flex flex-col lg:flex-row items-stretch gap-4">
      <!-- Jugador 1 -->
      <div class="flex-1">
        <div class="dropdown w-full mb-2">
          <button class="btn btn-block w-full text-left">
            {match.player1.name}
            {#if $tournamentStore.teamMode}
              <span class="text-sm text-gray-500 ml-2"
                >(Team {getPlayerTeam(match.player1.id)})</span
              >
            {/if}
          </button>
          <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full z-10">
            {#each $tournamentStore.players as p}
              <li>
                <button on:click={() => handlePlayerChange(index, 'player1', p.id)}>
                  {p.name}
                  {#if $tournamentStore.teamMode}
                    <span class="text-xs ml-1">(Team {getPlayerTeam(p.id)})</span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
        {#if match.player2}
          <select
            class="select select-bordered w-full"
            on:change={(e) => onDeck1Change(index, e)}
            value={match.deck1Id ?? ''}
          >
            <option value="" disabled>–</option>
            {#each match.player1.decks as deck}
              <option value={deck.id}>{deck.name}</option>
            {/each}
          </select>
        {/if}
      </div>

      <!-- VS -->
      <div class="flex items-center justify-center text-lg font-semibold">vs</div>

      <!-- Jugador 2 -->
      <div class="flex-1">
        {#if match.player2}
          <div class="dropdown w-full mb-2">
            <button class="btn btn-block w-full text-left">
              {match.player2.name}
              {#if $tournamentStore.teamMode}
                <span class="text-sm text-gray-500 ml-2"
                  >(Team {getPlayerTeam(match.player2.id)})</span
                >
              {/if}
            </button>
            <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full z-10">
              {#each $tournamentStore.players as p}
                <li>
                  <button on:click={() => handlePlayerChange(index, 'player2', p.id)}>
                    {p.name}
                    {#if $tournamentStore.teamMode}
                      <span class="text-xs ml-1">(Team {getPlayerTeam(p.id)})</span>
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          </div>
          <select
            class="select select-bordered w-full"
            on:change={(e) => onDeck2Change(index, e)}
            value={match.deck2Id ?? ''}
          >
            <option value="" disabled>–</option>
            {#each match.player2.decks as deck}
              <option value={deck.id}>{deck.name}</option>
            {/each}
          </select>
        {:else}
          <div class="italic text-center py-4">Bye</div>
        {/if}
      </div>
    </div>
  </div>
{/each}
