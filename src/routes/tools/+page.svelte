<script lang="ts">
  import Wheel from '$lib/components/Wheel.svelte';
  import tournamentStore from '../../store/tournamentStore';
  import DicePoolModal from '$lib/components/DicePool.svelte';
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
</script>

<div class="mt-4 flex flex-row gap-4 justify-start mx-4">
  <button class="btn btn-secondary flex-1 sm:flex-none" on:click={() => (showWheelModal = true)}
    >Spin Wheel</button
  >
  <button class="btn btn-success flex-1 sm:flex-none" on:click={() => (showDiceModal = true)}
    >Roll Dice</button
  >
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
