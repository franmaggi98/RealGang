<script lang="ts">
  import { onMount } from 'svelte';
  let currentTheme = 'night';

  const toggleTheme = () => {
    currentTheme = currentTheme === 'cupcake' ? 'night' : 'cupcake';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
  };

  onMount(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: night)').matches;

    if (storedTheme) {
      currentTheme = storedTheme;
    } else {
      currentTheme = prefersDark ? 'night' : 'cupcake';
      localStorage.setItem('theme', currentTheme);
    }

    document.documentElement.setAttribute('data-theme', currentTheme);
  });
</script>

<ul>
  <label class="flex cursor-pointer gap-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      />
    </svg>
    <input
      type="checkbox"
      checked={currentTheme === 'night'}
      on:change={toggleTheme}
      class="toggle theme-controller"
    />
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </label>
</ul>
