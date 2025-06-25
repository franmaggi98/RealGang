<script lang="ts">
  import { onMount } from 'svelte';
  import Wheel from '$lib/components/Wheel.svelte';
  import DicePoolModal from '$lib/components/DicePool.svelte';
  import tournamentStore from '../store/tournamentStore';
  import PlayerList from '$lib/components/PlayerList.svelte';
  import MatchList from '$lib/components/MatchList.svelte';
  import TournamentResults from '$lib/components/TournamentResults.svelte';
  import History from '$lib/components/History.svelte';
  import { pageTitle } from '../store/titleStore';

  pageTitle.set('Tournament');

  let playerName = '';
  const maxNameLength = 19;
  let isModalOpen = false;
  let showWheelModal = false;
  let showDiceModal = false;
  let resultRoulette: string | null = '';
  let diceResult: number | null = null;

  $: wheelItems = $tournamentStore.players.map((player) => player.name);

  const handleWheelResult = (event: CustomEvent<string>) => {
    resultRoulette = event.detail;
    if (typeof window !== 'undefined') {
      localStorage.setItem('resultRoulette', resultRoulette);
    }
  };

  const handleDiceResult = (event: CustomEvent<number>) => {
    diceResult = event.detail;
    console.log('Dice result:', diceResult);
  };

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
    tournamentStore.startTournament();
  }

  function endTournament() {
    tournamentStore.resetTournament();
    isModalOpen = false;
  }

  function submitResults() {
    tournamentStore.submitResults();
  }

  function goToPreviousRound() {
    tournamentStore.previousRound();
  }
</script>

<div class="container mx-auto p-4">
  {#if !$tournamentStore.tournamentStarted && !$tournamentStore.tournamentFinished}
    <!-- ADD PLAYER / START TOURNAMENT -->
    <div class="flex flex-col sm:flex-row items-center gap-4 mb-4">
      <input
        type="text"
        bind:value={playerName}
        maxlength={maxNameLength}
        placeholder="Enter player name"
        class="input input-bordered flex-grow sm:flex-none"
        on:keydown={(e) => e.key === 'Enter' && addPlayer()}
      />
      <button class="btn btn-primary" on:click={addPlayer}>Add Player</button>
      <button class="btn btn-success" on:click={startTournament}>Start Tournament</button>
    </div>
    <PlayerList />
  {:else}
    <!-- HEADER CONTROLS -->
    <div class="text-center text-lg font-bold flex flex-row items-center">
      Round: {$tournamentStore.roundNumber}
    </div>
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
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M5 12l4-4m-4 4 4 4" />
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
      <!-- ROUND + RESULTS + ACTIONS -->
      <div
        class="text-center text-lg font-bold mb-4 flex flex-row sm:flex-col justify-center items-center gap-4"
      >
        {#if !$tournamentStore.tournamentFinished}
          <div class="flex flex-col sm:flex-row gap-4">
            <button class="btn btn-primary" on:click={submitResults}>Submit Results</button>
            <button class="btn btn-error" on:click={() => (isModalOpen = true)}
              >End Tournament</button
            >
          </div>
        {:else}
          <div>
            <button class="btn btn-error" on:click={() => (isModalOpen = true)}
              >End Tournament</button
            >
          </div>
        {/if}
      </div>
    </div>

    <!-- MATCHES GRID -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-8"
    >
      <MatchList />
    </div>
    <div class="flex justify-center my-8">
      <TournamentResults />
    </div>

    <div class="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
      <button class="btn btn-secondary flex-1 sm:flex-none" on:click={() => (showWheelModal = true)}
        >Spin Wheel</button
      >
      <button class="btn btn-success flex-1 sm:flex-none" on:click={() => (showDiceModal = true)}
        >Roll Dice</button
      >
    </div>

    <History />

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

    {#if showWheelModal}
      <Wheel
        items={wheelItems}
        on:result={handleWheelResult}
        on:close={() => (showWheelModal = false)}
      />
    {/if}

    {#if showDiceModal}
      <DicePoolModal on:result={handleDiceResult} on:close={() => (showDiceModal = false)} />
    {/if}
  {/if}
</div>
