<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  type DiceType = 'D6' | 'D20' | 'D100';

  interface Dice {
    id: number;
    type: DiceType;
    result: number | null;
    rolling: boolean;
  }

  let nextId = 1;
  let dicePool: Dice[] = [{ id: nextId++, type: 'D6', result: null, rolling: false }];
  const dispatch = createEventDispatcher<{ roll: Dice[]; close: void }>();

  function addDice(type: DiceType = 'D6') {
    if (dicePool.length >= 6) return;
    dicePool = [...dicePool, { id: nextId++, type, result: null, rolling: false }];
  }

  function removeDice(id: number) {
    dicePool = dicePool.filter((d) => d.id !== id);
  }

  function rollDice() {
    if (dicePool.length === 0 || dicePool.some((d) => d.rolling)) return;
    dicePool = dicePool.map((d) => ({ ...d, rolling: true }));
    setTimeout(() => {
      dicePool = dicePool.map((d) => {
        let max = 6;
        if (d.type === 'D20') max = 20;
        else if (d.type === 'D100') max = 100;
        return { ...d, result: Math.floor(Math.random() * max) + 1, rolling: false };
      });
      dispatch('roll', dicePool);
    }, 800);
  }

  function rollIndividual(diceId: number) {
    const dice = dicePool.find((d) => d.id === diceId);
    if (!dice || dice.rolling) return;

    dicePool = dicePool.map((d) => (d.id === diceId ? { ...d, rolling: true } : d));
    setTimeout(() => {
      dicePool = dicePool.map((d) => {
        if (d.id === diceId) {
          let max = 6;
          if (d.type === 'D20') max = 20;
          else if (d.type === 'D100') max = 100;
          return { ...d, result: Math.floor(Math.random() * max) + 1, rolling: false };
        }
        return d;
      });
      dispatch('roll', dicePool);
    }, 800);
  }

  function closeModal() {
    dispatch('close');
  }
</script>

<dialog open class="modal modal-open">
  <div class="modal-box bg-neutral">
    <button class="btn btn-sm btn-circle absolute right-2 top-2 m-2" on:click={closeModal}>✕</button
    >
    <h2 class="text-2xl font-bold mb-4 text-center text-white">Dice Roller</h2>
    <div class="flex flex-wrap gap-4 mb-4 justify-center">
      {#each dicePool as dice (dice.id)}
        <button
          type="button"
          class="card bg-base-300 w-28 shadow-xl border-4 flex flex-col items-center p-2
                 {dice.type === 'D6' ? 'border-green-500' : ''}
                 {dice.type === 'D20' ? 'border-yellow-500' : ''}
                 {dice.type === 'D100' ? 'border-red-500' : ''}
                 {dice.rolling ? 'animate-dice-roll' : ''}"
          on:click={() => rollIndividual(dice.id)}
        >
          <div class="w-full flex justify-between items-center">
            <span class="font-bold text-sm">{dice.type}</span>
            <button
              on:click|stopPropagation={() => removeDice(dice.id)}
              class="btn btn-xs btn-error"
            >
              ✕
            </button>
          </div>
          <div class="text-center text-4xl my-4">
            {dice.result !== null ? dice.result : '-'}
          </div>
        </button>
      {/each}
    </div>
    <div class="flex flex-wrap gap-2 justify-center mb-4">
      <button
        class="btn btn-success"
        on:click={() => addDice('D6')}
        disabled={dicePool.length >= 6}
      >
        Add D6
      </button>
      <button
        class="btn btn-warning"
        on:click={() => addDice('D20')}
        disabled={dicePool.length >= 6}
      >
        Add D20
      </button>
      <button
        class="btn btn-error"
        on:click={() => addDice('D100')}
        disabled={dicePool.length >= 6}
      >
        Add D100
      </button>
    </div>
    <div class="flex flex-wrap gap-2 justify-center">
      <button
        class="btn btn-primary w-1/2"
        on:click={rollDice}
        disabled={dicePool.length === 0 || dicePool.some((d) => d.rolling)}
      >
        Roll All Dice
      </button>
    </div>
  </div>
</dialog>

<style>
  @keyframes dice-roll {
    0% {
      transform: rotate(0deg);
    }
    20% {
      transform: rotate(15deg);
    }
    40% {
      transform: rotate(-15deg);
    }
    60% {
      transform: rotate(15deg);
    }
    80% {
      transform: rotate(-15deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
  .animate-dice-roll {
    animation: dice-roll 0.8s ease-in-out;
  }
</style>
