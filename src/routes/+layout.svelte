<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import '../app.css';
  export const ssr = false; // Desactiva Server-Side Rendering
  export const csr = true; // Activa Client-Side Rendering (SPA)
</script>

<Header />

<slot />
