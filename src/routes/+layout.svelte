<script lang="ts">
  import { themeChange } from 'theme-change';
  import { onMount } from 'svelte';
  import '../app.css';

  onMount(() => themeChange());
</script>

<slot />
