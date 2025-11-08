<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>needlebot</title>
</svelte:head>

<div
  class="min-h-screen text-white bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4"
>
  {@render children()}
</div>
