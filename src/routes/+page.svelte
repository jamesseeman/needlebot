<script lang="ts">
  import Header from "./Header.svelte";

  let { data } = $props();
</script>

<Header />

{#each data.albums as album (album.id)}
  {@render albumCard(album)}
{/each}

{#snippet albumCard({ id, name, artist, year, genre, condition })}
  <h1>{id}: {name}</h1>
  <h2>{artist}</h2>
  <h3>{year}</h3>
  <h4>{condition}</h4>
  <p>{genre}</p>
{/snippet}
