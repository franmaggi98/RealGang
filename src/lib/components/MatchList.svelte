<script lang="ts">
  import tournamentStore from '../../store/tournamentStore';
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
        swapPlayers(currentPlayerId, newPlayerId);
      }
    }
  };
</script>

{#each $tournamentStore.currentMatches as match, index (index)}
  <div class="flex items-center justify-center my-1 space-x-2">
    <div class="flex-1">
      <div class="dropdown w-full">
        <button type="button" class="btn w-full">
          {match.player1.name}
        </button>
        <ul
          role="menu"
          class="dropdown-content menu bg-base-100 rounded-box z-10 w-full p-2 shadow-sm"
        >
          {#each $tournamentStore.players as player (player.id)}
            <li role="menuitem">
              <button on:click={() => handlePlayerChange(index, 'player1', player.id)}>
                {player.name}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <span class="mx-2 self-center">vs</span>
    <div class="flex-1">
      <div class="dropdown w-full">
        {#if match.player2}
          <button type="button" class="btn w-full">
            {match.player2.name}
          </button>
          <ul
            role="menu"
            class="dropdown-content menu bg-base-100 rounded-box z-10 w-full p-2 shadow-sm"
          >
            {#each $tournamentStore.players as player (player.id)}
              <li role="menuitem">
                <button on:click={() => handlePlayerChange(index, 'player2', player.id)}>
                  {player.name}
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <span class="text-lg">No Opponent (Bye)</span>
        {/if}
      </div>
    </div>
  </div>
  <div>
    {#if match.player2 === null}
      <div><div class="divider m-0 p-0" /></div>
    {:else}
      <select bind:value={match.result} class="select select-bordered w-full">
        <option value="" disabled>Select Result</option>
        <option value="win">Win {match.player1.name}</option>
        <option value="draw">Draw</option>
        <option value="loss">Win {match.player2.name}</option>
      </select>
    {/if}
  </div>
{/each}
