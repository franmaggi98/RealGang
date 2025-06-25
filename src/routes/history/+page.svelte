<script lang="ts">
  import History from '$lib/components/History.svelte';
  import { onMount } from 'svelte';
  import tournamentStore from '../../store/tournamentStore';
  onMount(() => {
    tournamentStore.loadFromLocalStorage();
  });
</script>

<div class="container mx-auto p-4">
  <History />
</div>
