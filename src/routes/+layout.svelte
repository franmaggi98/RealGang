<script lang="ts">
  import { themeChange } from 'theme-change';
  import { onMount } from 'svelte';
  import Header from '$lib/components/Header.svelte';
  import '../app.css';

  onMount(() => themeChange());
</script>

<Header />

<slot />
