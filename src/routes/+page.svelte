<script lang="ts">
  import { onMount } from 'svelte';
  import tournamentStore from '../store/tournamentStore';
  import PlayerList from '$lib/components/PlayerList.svelte';
  import MatchList from '$lib/components/MatchList.svelte';
  import History from '$lib/components/History.svelte';

  let playerName = '';
  const maxNameLength = 19;
  let isModalOpen = false;
  let tournamentMode: 'individual' | 'teams' = 'individual';

  onMount(() => {
    tournamentStore.loadFromLocalStorage();
  });

  function addPlayer() {
    if (!playerName.trim()) {
      alert('Player name cannot be empty.');
      return;
    }
    if (playerName.trim().length > maxNameLength) {
      alert(`Player name cannot exceed ${maxNameLength} characters.`);
      return;
    }
    tournamentStore.addPlayer(playerName.trim());
    playerName = '';
  }

  function startTournament() {
    if ($tournamentStore.players.length < 2) {
      alert('You need at least 2 players to start the tournament.');
      return;
    }
    tournamentStore.update((state) => ({
      ...state,
      teamMode: tournamentMode === 'teams'
    }));

    tournamentStore.startTournament();
  }

  function endTournament() {
    tournamentStore.resetTournament();
    isModalOpen = false;
  }

  function submitResults() {
    // Validar resultados antes de enviar
    const allValid = $tournamentStore.currentMatches.every((match) => {
      if (!match.player2) return true; // Bye siempre es válido
      if (!match.result) return false;
      const { games1, games2 } = match.result;
      return games1 !== undefined && games2 !== undefined && games1 + games2 <= 3;
    });

    if (!allValid) {
      alert('Invalid results. Please check all matches have valid scores (max 3 games).');
      return;
    }

    tournamentStore.submitResults();
  }

  function goToPreviousRound() {
    tournamentStore.previousRound();
  }
</script>

<div class="container mx-auto p-4">
  {#if !$tournamentStore.tournamentStarted && !$tournamentStore.tournamentFinished}
    <!-- Selector de modo -->
    <div class="flex flex-col items-center gap-4 mb-4">
      <div class="form-control w-full max-w-xs">
        <span class="label-text">Tournament Mode</span>
        <select bind:value={tournamentMode} class="select select-bordered w-full">
          <option value="individual">Individual</option>
          <option value="teams">Teams</option>
        </select>
      </div>
    </div>
    <div class="flex flex-col items-center gap-4 mb-4">
      <input
        type="text"
        bind:value={playerName}
        maxlength={maxNameLength}
        placeholder="Enter player name"
        class="input input-bordered flex-grow sm:flex-none w-full max-w-xs"
        on:keydown={(e) => e.key === 'Enter' && addPlayer()}
      />
      <div class="flex gap-4 w-full justify-center">
        <button class="btn btn-primary w-1/2 max-w-40" on:click={addPlayer}>Add Player</button>
        <button class="btn btn-success w-1/2 max-w-40" on:click={startTournament}
          >Start Tournament</button
        >
      </div>
    </div>

    <PlayerList />
  {:else}
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        {#if !$tournamentStore.tournamentFinished}
          <button class="btn btn-error btn-square" on:click={goToPreviousRound}>
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12l4-4m-4 4l4 4" />
            </svg>
          </button>
        {/if}
        <h3 class="text-2xl text-center">
          {#if $tournamentStore.tournamentFinished}
            Tournament Finished
          {:else}
            Tournament In Progress
          {/if}
        </h3>
      </div>
      <div class="text-center text-2xl font-bold flex flex-row items-center text-success">
        Round: {$tournamentStore.roundNumber}
      </div>
    </div>
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-8"
    >
      <MatchList />
    </div>
    <div class="text-center text-lg font-bold mb-4 flex flex-row justify-center items-center gap-4">
      {#if !$tournamentStore.tournamentFinished}
        <div class="flex flex-col sm:flex-row gap-4">
          <button class="btn btn-primary" on:click={submitResults}>Submit Results</button>
          <button class="btn btn-error" on:click={() => (isModalOpen = true)}>End Tournament</button
          >
        </div>
      {:else}
        <div>
          <button class="btn btn-error" on:click={() => (isModalOpen = true)}>End Tournament</button
          >
        </div>
      {/if}
    </div>

    {#if isModalOpen}
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="text-lg font-bold">Are you sure?</h3>
          <p class="py-4">
            Do you really want to end the tournament? This action cannot be undone.
          </p>
          <div class="modal-action">
            <button class="btn btn-error" on:click={endTournament}>Yes, End</button>
            <button class="btn btn-primary" on:click={() => (isModalOpen = false)}>Cancel</button>
          </div>
        </div>
      </dialog>
    {/if}
  {/if}
</div>
