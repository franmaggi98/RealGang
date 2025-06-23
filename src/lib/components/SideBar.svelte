<script lang="ts">
  import { onMount } from 'svelte';

  let drawerChecked = false;

  onMount(() => {
    const drawerCheckbox = document.getElementById('my-drawer-4') as HTMLInputElement;

    const cerrarMenu = () => {
      drawerCheckbox.checked = false;
    };

    const closeButton = document.getElementById('close-button');
    if (closeButton) {
      closeButton.addEventListener('click', cerrarMenu);
    }
    const links = document.querySelectorAll('.menu a');
    links.forEach((link) => {
      link.addEventListener('click', cerrarMenu);
    });
  });
</script>

<div class="dropdown mt-2 z-10">
  <input bind:checked={drawerChecked} id="my-drawer-4" type="checkbox" class="drawer-toggle" />
  <div>
    <label
      for="my-drawer-4"
      class="drawer-button btn p-4 rounded-box border-neutral bg-base-300 glass cursor-pointer ml-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        class="inline-block w-5 h-5 stroke-current"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        ></path>
      </svg>
    </label>
  </div>
  <div class="drawer-side">
    <label for="my-drawer-4" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu p-2 w-80 h-full bg-base-200 text-base-content font-semibold">
      <button
        id="close-button"
        class="btn p-4 rounded-box border-neutral bg-base-300 glass cursor-pointer h-14 w-14"
      >
        <svg
          class="fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 512 512"
        >
          <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
        </svg>
      </button>
      <div class="divider m-0 p-0" />
      <li><a href="/">Homepage</a></li>
      <div><div class="divider m-0 p-0" /></div>
      <li><a href="/profile">Profile</a></li>
      <div><div class="divider m-0 p-0" /></div>
      <li><a href="/dinoJump">Dino Jump</a></li>
      <div><div class="divider m-0 p-0" /></div>
      <li><a href="/calculator">Calculator</a></li>
      <div><div class="divider m-0 p-0" /></div>
      <li><a href="/weather">Weather App</a></li>
      <div><div class="divider m-0 p-0" /></div>
      <li><a href="/Tournament">Tournament</a></li>
      <div><div class="divider m-0 p-0" /></div>
      <li><a href="/ecommerce">Ecommerce</a></li>
    </ul>
  </div>
</div>
