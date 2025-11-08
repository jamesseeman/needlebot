<script lang="ts">
  import Header from "./Header.svelte";

  let { data } = $props();

  let search = $state();
  let showModal = $state(false);

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 0) {
      const file = files[0];
      console.log("File uploaded:", file.name);
    }
  }

  function uploadModal(event: Event) {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }
</script>

<Header />

<div
  class="bg-white shadow-lg rounded-full px-6 py-3 flex items-center gap-4 z-50 w-1/2 mx-auto"
>
  <button
    onclick={uploadModal}
    class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-full transition-colors"
    >Upload</button
  >

  <input
    type="text"
    placeholder="Search..."
    bind:value={search}
    class="flex-1 text-black border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div
  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6 max-w-7xl mx-auto"
>
  {#each data.albums as album (album.id)}
    {@render albumCard(album)}
  {/each}
</div>

{#snippet albumCard({ id, name, artist, year, genre, condition })}
  <div
    class="bg-white text-black rounded-lg shadow-2xl overflow-hidden hover:shadow-xl transition-shadow"
  >
    <img src="/uploads/1.jpg" class="w-full aspect-square object-cover" />
    <div class="p-4">
      <h1 class="text-xl font-bold truncate">{name}</h1>
      <h2 class="text-gray-600 truncate">{artist}</h2>
      <h3 class="text-sm text-gray-500">{year}</h3>
      <h4 class="text-sm text-gray-500">{condition}</h4>
      <p class="text-xs text-gray-400 mt-1">{genre}</p>
    </div>
  </div>
{/snippet}

{#if showModal}
  <div
    class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    onclick={closeModal}
  >
    <div
      class="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-black">Upload Album</h2>
        <button
          onclick={closeModal}
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
      </div>
      <div class="space-y-4">
        <label class="block">
          <span class="text-gray-700">Album Cover</span>
          <input
            type="file"
            onchange={handleFileUpload}
            accept="image/*"
            class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>
        <button
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
{/if}
