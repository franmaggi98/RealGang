<script lang="ts">
  import tournamentStore, { type Player } from '../../store/tournamentStore';
  
  function getPlayerTeam(playerId: number) {
    if (!$tournamentStore.teamMode) return null;
    
    for (const team of $tournamentStore.teams) {
      if (team.players.includes(playerId)) {
        return team.id;
      }
    }
    return null;
  }
  
  const swapPlayers = (player1Id: number, player2Id: number) => {
    tournamentStore.update((state) => {
      const updatedMatches = state.currentMatches.map((match) => {
        const updatedMatch = { ...match };

        if (updatedMatch.player1.id === player1Id) {
          updatedMatch.player1 = state.players.find((p) => p.id === player2Id)!;
        } else if (updatedMatch.player1.id === player2Id) {
          updatedMatch.player1 = state.players.find((p) => p.id === player1Id)!;
        }
        if (updatedMatch.player2?.id === player1Id) {
          updatedMatch.player2 = state.players.find((p) => p.id === player2Id)!;
        } else if (updatedMatch.player2?.id === player2Id) {
          updatedMatch.player2 = state.players.find((p) => p.id === player1Id)!;
        }
        return updatedMatch;
      });

      const updatedPlayers = state.players.map((player) => {
        if (player.id !== player1Id && player.id !== player2Id) {
          const updatedOpponents = player.opponents.map((oppId) => {
            if (oppId === player1Id) return player2Id;
            if (oppId === player2Id) return player1Id;
            return oppId;
          });
          return { ...player, opponents: updatedOpponents };
        }
        if (player.id === player1Id) {
          const otherPlayer = state.players.find((p) => p.id === player2Id);
          return { ...player, opponents: otherPlayer ? otherPlayer.opponents : player.opponents };
        }
        if (player.id === player2Id) {
          const otherPlayer = state.players.find((p) => p.id === player1Id);
          return { ...player, opponents: otherPlayer ? otherPlayer.opponents : player.opponents };
        }
        return player;
      });

      const updatedInvalidMatches = state.invalidMatches.map((match) => {
        let { player1Id: p1, player2Id: p2 } = match;
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

  const handlePlayerChange = (
    matchIndex: number,
    playerKey: 'player1' | 'player2',
    newPlayerId: number
  ) => {
    const match = $tournamentStore.currentMatches[matchIndex];
    if (match) {
      const currentPlayer = match[playerKey];
      if (currentPlayer) {
        const currentPlayerId = currentPlayer.id;
        // Comprobar si el nuevo jugador es compañero de equipo
        if ($tournamentStore.teamMode) {
          const team1 = getPlayerTeam(currentPlayerId);
          const team2 = getPlayerTeam(newPlayerId);
          if (team1 && team2 && team1 === team2) {
            alert("Cannot swap with a teammate");
            return;
          }
        }
        swapPlayers(currentPlayerId, newPlayerId);
      }
    }
  };
</script>

{#each $tournamentStore.currentMatches as match, index (index)}
  <div class="flex flex-col mb-4 p-4 border rounded-lg w-full justify-center">
    {#if match.player2}
      <div class="mb-4 flex justify-center">
        <select bind:value={match.result} class="select select-bordered w-full">
          <option value="" disabled>Select result</option>
          <option value="win">Win for {match.player1.name}</option>
          <option value="draw">Draw</option>
          <option value="loss">Win for {match.player2.name}</option>
        </select>
      </div>
    {:else}
      <div class="mb-4 text-center font-bold text-success">Bye</div>
    {/if}
    <div class="flex flex-col items-center space-y-4 lg:space-y-0 lg:space-x-4">
      <div class="flex-1 w-full">
        <div class="dropdown w-full">
          <button class="btn btn-block w-full">
            {match.player1.name}
            {#if $tournamentStore.teamMode}
              <span class="text-sm text-gray-500 ml-2">
                (Team {getPlayerTeam(match.player1.id)})
              </span>
            {/if}
          </button>
          <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full z-10">
            {#each $tournamentStore.players as p}
              <li>
                <button on:click={() => handlePlayerChange(index, 'player1', p.id)}>
                  {p.name}
                  {#if $tournamentStore.teamMode}
                    <span class="text-xs">(Team {getPlayerTeam(p.id)})</span>
                  {/if}
                </button>
              </li>
            {/each}
          </ul>
        </div>
        {#if match.player2}
          <select class="select select-bordered w-full mt-2" bind:value={match.deck1Id}>
            <option value={null} selected={match.deck1Id == null}>–</option>
            {#each match.player1.decks as deck}
              <option value={deck.id}>{deck.name}</option>
            {/each}
          </select>
        {/if}
      </div>
      <span class="text-lg">vs</span>
      <div class="flex-1 w-full">
        {#if match.player2}
          <div class="dropdown w-full">
            <button class="btn btn-block w-full">
              {match.player2.name}
              {#if $tournamentStore.teamMode}
                <span class="text-sm text-gray-500 ml-2">
                  (Team {getPlayerTeam(match.player2.id)})
                </span>
              {/if}
            </button>
            <ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-full z-10">
              {#each $tournamentStore.players as p}
                <li>
                  <button on:click={() => handlePlayerChange(index, 'player2', p.id)}>
                    {p.name}
                    {#if $tournamentStore.teamMode}
                      <span class="text-xs">(Team {getPlayerTeam(p.id)})</span>
                    {/if}
                  </button>
                </li>
              {/each}
            </ul>
          </div>
          <select class="select select-bordered w-full mt-2" bind:value={match.deck2Id}>
            <option value={null} selected={match.deck2Id == null}>–</option>
            {#each match.player2.decks as deck}
              <option value={deck.id}>{deck.name}</option>
            {/each}
          </select>
        {:else}
          <div class="text-center italic py-4">Bye</div>
        {/if}
      </div>
    </div>
  </div>
{/each}