<script lang="ts">
  import tournamentStore from '../../store/tournamentStore';
</script>

<div class="overflow-x-auto w-full sm:w-2/3 rounded shadow">
  <table class="table table-zebra w-full border-1">
    <thead>
      <tr>
        {#if $tournamentStore.teamMode === true}
          <th>Team</th>
        {/if}
        <th>Name</th>
        <th>Points</th>
        <th>Victories</th>
        <th>Draws</th>
        <th>Difficulty</th>
      </tr>
    </thead>
    <tbody>
      {#each $tournamentStore.players as player}
        <tr>
          {#if $tournamentStore.teamMode === true}
            <td>{player.teamId}</td>
          {/if}
          <td>{player.name}</td>
          <td>{player.points}</td>
          <td>{player.victories}</td>
          <td>{player.draws}</td>
          <td>{player.opponentDifficulty.toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
