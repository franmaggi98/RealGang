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
    <div
      class="mb-4 text-3xl flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
    >
      <input
        type="text"
        bind:value={playerName}
        maxlength={maxNameLength}
        placeholder="Enter player name"
        class="input input-bordered w-full sm:w-auto"
        on:keydown={(event) => {
          if (event.key === 'Enter') addPlayer();
        }}
      />
      <button on:click={addPlayer} class="btn btn-primary w-full sm:w-auto">Add Player</button>
      <button on:click={startTournament} class="btn btn-success w-full sm:w-auto"
        >Start Tournament</button
      >
    </div>
    <PlayerList />
  {:else}
    <div
      class="flex flex-col sm:flex-row justify-between items-start space-y-8 sm:space-y-0 sm:space-x-8 m-4"
    >
      <div class="flex flex-col gap-4 w-full sm:w-1/3">
        {#if $tournamentStore.tournamentFinished}
          <h3 class="text-3xl mb-4 text-center">Tournament <br />Finished</h3>
          <button class="btn btn-error" on:click={() => (isModalOpen = true)}>End Tournament</button
          >
        {:else}
          <h3 class="text-3xl mb-4 text-center flex items-center">
            <button
              on:click={goToPreviousRound}
              class="btn btn-error btn-square w-1/5 mx-4 justify-center items-center"
            >
              <svg
                class="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h14M5 12l4-4m-4 4 4 4"
                />
              </svg>
            </button>
            Tournament <br /> In Progress
          </h3>
          <MatchList />
          <div class="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button on:click={submitResults} class="btn btn-primary w-full sm:w-auto"
              >Submit Results</button
            >
            <button class="btn btn-error" on:click={() => (isModalOpen = true)}
              >End Tournament</button
            >
          </div>
        {/if}
        {#if isModalOpen}
          <dialog class="modal modal-open">
            <div class="modal-box">
              <h3 class="text-lg font-bold">Are you sure?</h3>
              <p class="py-4">
                Do you really want to end the tournament? This action cannot be undone.
              </p>
              <div class="modal-action">
                <button class="btn btn-error" on:click={endTournament}>Yes, End</button>
                <button class="btn btn-primary" on:click={() => (isModalOpen = false)}
                  >Cancel</button
                >
              </div>
            </div>
          </dialog>
        {/if}
      </div>
      <div class="w-full flex flex-col items-center">
        <div class="text-center text-lg font-bold mb-4">
          Round: {$tournamentStore.roundNumber}
        </div>
        <TournamentResults />
        <div class="flex flex-row gap-4 mt-8 justify-center">
          <button class="btn btn-secondary w-full" on:click={() => (showWheelModal = true)}>
            Spin Wheel
          </button>
          <button class="btn btn-success w-full" on:click={() => (showDiceModal = true)}>
            Roll Dice
          </button>
        </div>
      </div>
    </div>
  {/if}
  {#if $tournamentStore.tournamentStarted}
  <History />
{/if}
</div>

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
