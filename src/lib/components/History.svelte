<script lang="ts">
  import { derived } from 'svelte/store';
  import tournamentStore from '../../store/tournamentStore';
  import type { Match } from '../../store/tournamentStore';

  const history = derived(tournamentStore, ($s) => {
    const roundsMap = new Map<
      number,
      {
        round: number;
        matches: {
          player1Name: string;
          deck1Name: string;
          player2Name: string | null;
          deck2Name: string;
          result: string;
          winner: string | null;
        }[];
      }
    >();

    $s.history.forEach((h) => {
      if (!roundsMap.has(h.roundNumber)) {
        const matches = h.currentMatches.map((m: Match) => {
          const deck1 = m.player1.decks.find((d) => d.id === m.deck1Id);
          const deck2 = m.player2 ? m.player2.decks.find((d) => d.id === m.deck2Id) : null;

          // Determinar el ganador y el resultado
          let resultString = 'No jugado';
          let winner = null;

          if (m.result) {
            const { games1, games2 } = m.result;
            resultString = `${games1}-${games2}`;

            if (games1 > games2) {
              winner = m.player1.name;
            } else if (games2 > games1) {
              winner = m.player2?.name || null;
            } else {
              winner = 'Empate';
            }
          } else if (!m.player2) {
            resultString = '(Bye)';
            winner = m.player1.name;
          }

          return {
            player1Name: m.player1.name,
            deck1Name: deck1 ? deck1.name : '-',
            player2Name: m.player2 ? m.player2.name : null,
            deck2Name: deck2 ? deck2.name : '-',
            result: resultString,
            winner
          };
        });
        roundsMap.set(h.roundNumber, { round: h.roundNumber, matches });
      }
    });

    return Array.from(roundsMap.values()).sort((a, b) => a.round - b.round);
  });
</script>

<div class="my-4 p-4 border rounded-lg shadow bg-base-100">
  <h3 class="text-2xl font-semibold mb-4">Historial de Rondas</h3>

  {#if $history.length === 0}
    <p class="italic text-sm">Aún no hay rondas jugadas.</p>
  {:else}
    <ul class="space-y-6">
      {#each $history as entry}
        <li>
          <div class="font-bold text-lg mb-2">Ronda {entry.round}</div>
          <div class="space-y-3 pl-4">
            {#each entry.matches as m}
              <div class="flex flex-row gap-2 p-3 bg-base-200 rounded-lg">
                <div class="flex flex-wrap items-center gap-1">
                  {#if m.player2Name}
                    <span class="font-medium">{m.player1Name}</span>
                    <span class="italic">({m.deck1Name})</span>
                    <span>vs</span>
                    <span class="font-medium">{m.player2Name}</span>
                    <span class="italic">({m.deck2Name})</span>
                  {:else}
                    <span class="font-medium">{m.player1Name}</span>
                  {/if}
                </div>

                <div class="mt-1 flex items-center gap-2">
                  <span class="badge badge-outline">{m.result}</span>
                  {#if m.winner}
                    {#if m.winner === 'Empate'}
                      <span class="text-warning font-medium">Empate</span>
                    {:else}
                      <span class="text-success font-medium">Ganó: {m.winner}</span>
                    {/if}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
