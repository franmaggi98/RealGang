<script lang="ts">
  import History from '$lib/components/History.svelte';
  import { onMount } from 'svelte';
  import tournamentStore from '../../store/tournamentStore';
  onMount(() => {
    tournamentStore.loadFromLocalStorage();
  });
</script>

<History />
