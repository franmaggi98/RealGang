<script lang="ts">
  import TournamentResults from '$lib/components/TournamentResults.svelte';
  import { onMount } from 'svelte';
  import tournamentStore from '../../store/tournamentStore';
  onMount(() => {
    tournamentStore.loadFromLocalStorage();
  });
</script>

<div class="container mx-auto p-4 flex justify-center items-center">
  <TournamentResults />
</div>
