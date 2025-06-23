<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { get } from 'svelte/store';
  import { cubicOut } from 'svelte/easing';

  export let items: string[] = [];

  const dispatch = createEventDispatcher<{ result: string; close: void }>();

  const rotation = tweened(0, { duration: 3000, easing: cubicOut });
  let spinning = false;
  let winner: string = '';

  let modalOpen = true;

  $: segmentAngle = items.length > 0 ? 360 / items.length : 0;
  const wheelRadius = 150;
  const textRadius = 100;

  function spin() {
    if (spinning) return;
    spinning = true;

    const extraSpins = Math.floor(Math.random() * 3) + 3;
    const randomExtra = Math.random() * 360;
    const delta = extraSpins * 360 + randomExtra;

    const spinDuration = (Math.floor(Math.random() * 4) + 3) * 1000;

    const currentRotation = get(rotation);
    const newRotation = currentRotation + delta;

    rotation.set(newRotation, { duration: spinDuration, easing: cubicOut }).then(() => {
      let winningIndex = 0;
      let minDistance = 360;
      for (let i = 0; i < items.length; i++) {
        let center = ((i + 0.5) * segmentAngle - 90 + newRotation) % 360;
        if (center < 0) center += 360;
        let distance = Math.min(center, 360 - center);
        if (distance < minDistance) {
          minDistance = distance;
          winningIndex = i;
        }
      }
      winner = items[winningIndex];
      dispatch('result', winner);
      spinning = false;
    });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      spin();
    }
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${cx} ${cy} Z`;
  }

  function getColor(index: number): string {
    const colors = [
      '#e6194b',
      '#3cb44b',
      '#ffe119',
      '#4363d8',
      '#f58231',
      '#911eb4',
      '#46f0f0',
      '#f032e6',
      '#bcf60c',
      '#fabebe'
    ];
    return colors[index % colors.length];
  }

  function closeModal() {
    modalOpen = false;
    dispatch('close');
  }
</script>

{#if modalOpen}
  <dialog open class="modal modal-open">
    <div class="modal-box relative bg-neutral">
      <button class="btn btn-sm btn-circle absolute right-2 top-2" on:click={closeModal}>
        ✕
      </button>
      <h3 class="font-bold text-xl mb-4 text-center text-primary">Spin the Wheel</h3>
      <div
        role="button"
        tabindex="0"
        on:click={spin}
        on:keydown={handleKeydown}
        class="relative w-[300px] h-[300px] mx-auto select-none rounded-full overflow-hidden cursor-pointer"
      >
        <svg viewBox="0 0 300 300" class="w-full h-full rounded-full">
          <g transform="rotate({$rotation}, 150, 150)">
            <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
            {#each items as _, index}
              <path
                d={describeArc(
                  150,
                  150,
                  wheelRadius,
                  index * segmentAngle - 90,
                  (index + 1) * segmentAngle - 90
                )}
                fill={getColor(index)}
              />
            {/each}
          </g>
          {#each items as item, index}
            {@const angle = (index + 0.5) * segmentAngle - 90 + $rotation}
            {@const pos = polarToCartesian(150, 150, textRadius, angle)}
            <text
              x={pos.x}
              y={pos.y}
              text-anchor="middle"
              dominant-baseline="middle"
              class="text-xs font-semibold"
            >
              {item}
            </text>
          {/each}

          <circle cx="150" cy="150" r="40" fill="white" />
        </svg>
        <div class="absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-full z-20">
          <svg
            class="w-10 h-10 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div class="mt-4 text-center text-xl font-bold text-success">
        Winner is: {winner}
      </div>
    </div>
  </dialog>
{/if}
