<script lang="ts">
  import { derived } from 'svelte/store';
  import tournamentStore from '../../store/tournamentStore';

  // derivamos sólo el historial, adaptando cada estado a { round, matches }
  const history = derived(tournamentStore, $s =>
    $s.history.map(h => ({
      round: h.roundNumber,
      matches: h.currentMatches
    }))
  );
</script>

<div class="my-4 p-4 border rounded shadow bg-base-100">
  <h3 class="text-2xl mb-2">Historial de Rondas</h3>
  {#if $history.length === 0}
    <p class="italic text-sm">Aún no hay rondas jugadas.</p>
  {:else}
    <ul class="list-disc pl-5 space-y-2">
      {#each $history as entry}
        <li>
          <strong>Ronda {entry.round}:</strong>
          {#each entry.matches as m}
            <div class="ml-4">
              {m.player1.name}
              {#if m.player2}
                vs {m.player2.name} —
                {#if m.result === 'win'}
                  Ganó {m.player1.name}
                {:else if m.result === 'loss'}
                  Ganó {m.player2.name}
                {:else if m.result === 'draw'}
                  Empate
                {/if}
              {:else}
                Bye
              {/if}
            </div>
          {/each}
        </li>
      {/each}
    </ul>
  {/if}
</div>
