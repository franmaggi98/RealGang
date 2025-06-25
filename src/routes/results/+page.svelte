<script lang="ts">
  import TournamentResults from '$lib/components/TournamentResults.svelte';
  import { onMount } from 'svelte';
  import tournamentStore from '../../store/tournamentStore';
  onMount(() => {
    tournamentStore.loadFromLocalStorage();
  });
</script>

<div class="flex justify-center my-8">
  <TournamentResults />
</div>
