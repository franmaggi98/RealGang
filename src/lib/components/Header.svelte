<script lang="ts">
  import SidelBar from '$lib/components/SideBar.svelte';
</script>

<main class="sticky z-10 top-0 bg-base-100 p-0 m-0">
  <div class="flex items-center justify-center">
    <div class="navbar p-0 m-0 relative">
      <div>
        <SidelBar />
      </div>
      <div class="absolute left-1/2 -translate-x-1/2">
        <p class="text-3xl font-semibold">Tournament</p>
      </div>
    </div>
  </div>
  <div class="divider m-0 p-0" />
</main>
