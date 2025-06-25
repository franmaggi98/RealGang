<script lang="ts">
  import tournamentStore, { type Player } from '../../store/tournamentStore';
  import { onMount } from 'svelte';

  let activePlayer: Player | null = null;
  let newDeckName = '';
  let addDeckModal: HTMLDialogElement;

  onMount(() => {
    addDeckModal = document.getElementById('add-deck-modal') as HTMLDialogElement;
  });

  function openAddDeckModal(player: Player) {
    activePlayer = player;
    newDeckName = '';
    addDeckModal.showModal();
  }

  function closeAddDeckModal() {
    addDeckModal.close();
    activePlayer = null;
    newDeckName = '';
  }

  function addDeck() {
    if (!activePlayer) return;

    const deckName = newDeckName.trim();

    if (!deckName) return;

    if (deckName.length > 30) {
      alert('Deck name cannot exceed 30 characters');
      return;
    }

    tournamentStore.addDeckToPlayer(activePlayer.id, deckName);
    closeAddDeckModal();
  }

  function removeDeck(playerId: number, deckId: number) {
    tournamentStore.removeDeckFromPlayer(playerId, deckId);
  }

  function deletePlayer(playerId: number) {
    if (confirm('Delete player and all their data?')) {
      tournamentStore.deletePlayer(playerId);
    }
  }

  function getPlayerTeam(playerId: number) {
    if (!$tournamentStore.teamMode) return null;

    for (const team of $tournamentStore.teams) {
      if (team.players.includes(playerId)) {
        return team.id;
      }
    }
    return null;
  }
</script>

<div class="space-y-4">
  {#each $tournamentStore.players as player}
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-base-200 rounded-lg"
    >
      <div class="flex-1">
        <p class="text-lg font-semibold">
          {player.name}
          {#if $tournamentStore.teamMode}
            <span class="text-sm text-gray-500 ml-2">
              (Team {getPlayerTeam(player.id)})
            </span>
          {/if}
        </p>
        <div class="flex flex-wrap gap-2 mt-2">
          {#each player.decks as deck}
            <span class="badge badge-secondary flex items-center gap-1">
              {deck.name}
              <button
                class="btn btn-xs btn-circle btn-ghost"
                on:click={() => removeDeck(player.id, deck.id)}
                aria-label="Delete deck"
              >
                ✕
              </button>
            </span>
          {/each}
        </div>
      </div>

      <div class="flex gap-2 mt-4 sm:mt-0">
        <button class="btn btn-sm btn-outline" on:click={() => openAddDeckModal(player)}>
          + Add Deck
        </button>
        <button class="btn btn-sm btn-error" on:click={() => deletePlayer(player.id)}>
          Delete Player
        </button>
      </div>
    </div>
  {/each}
</div>

<dialog id="add-deck-modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">Add Deck to {activePlayer?.name || 'player'}</h3>

    <div class="form-control">
      <span class="label-text">Deck name</span>
      <input
        type="text"
        placeholder="Enter deck name..."
        bind:value={newDeckName}
        class="input input-bordered w-full"
        on:keydown={(e) => e.key === 'Enter' && addDeck()}
        maxlength="30"
      />
      <span class="text-xs text-gray-500 mt-1">
        Max 30 characters ({newDeckName.length}/30)
      </span>
    </div>

    <div class="modal-action">
      <form method="dialog">
        <button class="btn btn-ghost">Cancel</button>
      </form>
      <button class="btn btn-primary" on:click={addDeck} disabled={!newDeckName.trim()}>
        Add
      </button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
