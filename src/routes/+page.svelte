<script lang="ts">
  import Header from "./Header.svelte";
  import UploadModal from "./Upload.svelte";
  import { RefreshCcw } from "lucide-svelte";
  import discogsLogo from "$lib/assets/discogs.png";

  let { data } = $props();

  let search = $state<string>("");
  let showModal = $state<boolean>(false);
  let imageStates = $state<Record<number, boolean>>({});

  function getConditionStyle(condition: string) {
    const conditionMap: Record<string, string> = {
      Mint: "bg-green-100 text-green-800",
      "Near Mint": "bg-green-50 text-green-700",
      "Very Good": "bg-blue-100 text-blue-800",
      Good: "bg-yellow-100 text-yellow-800",
      Fair: "bg-orange-100 text-orange-800",
      Poor: "bg-red-100 text-red-800",
    };
    return conditionMap[condition] || "bg-gray-200 text-gray-800";
  }

  function uploadModal(event: Event) {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function toggleImage(albumId: number) {
    imageStates[albumId] = !imageStates[albumId];
  }

  function searchAlbums(albums: typeof data.albums, searchTerm: string) {
    if (!searchTerm.trim()) {
      return albums;
    }

    const query = searchTerm.toLowerCase();

    return albums.filter((album) => {
      return (
        album.name?.toLowerCase().includes(query) ||
        album.artist?.toLowerCase().includes(query) ||
        album.year?.toString().includes(query) ||
        album.condition?.toLowerCase().includes(query) ||
        album.genre?.toLowerCase().includes(query) ||
        album.discogs_price?.toString().includes(query)
      );
    });
  }

  let filteredAlbums = $derived(searchAlbums(data.albums, search));
</script>

<Header />

<div
  class="bg-white shadow-lg px-3 md:px-6 rounded py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 z-50 w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto"
>
  <button
    onclick={uploadModal}
    class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition-colors whitespace-nowrap"
    >Upload</button
  >

  <input
    type="text"
    placeholder="Search..."
    bind:value={search}
    class="flex-1 text-black border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div
  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 p-4 md:p-6 max-w-7xl mx-auto"
>
  {#each filteredAlbums as album (album.id)}
    {@render albumCard(album)}
  {/each}
</div>

{#snippet albumCard(album)}
  <div
    class="bg-white text-black rounded-lg shadow-2xl overflow-hidden hover:shadow-xl transition-shadow flex flex-col"
  >
    <div class="relative">
      {console.log(album)}
      <img
        src={imageStates[album.id] ? album.image : album.discogs_img}
        alt={album.name}
        class="w-full aspect-square object-cover"
      />
      <div
        class="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/70 to-transparent pb-16 p-4"
      >
        <h1 class="text-xl font-bold truncate text-white drop-shadow-lg">
          {album.name}
        </h1>
        <h2 class="text-white truncate drop-shadow-lg">{album.artist}</h2>
      </div>
      <button
        onclick={() => toggleImage(album.id)}
        class="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 md:p-2 rounded-full transition-colors backdrop-blur-sm flex items-center gap-1 md:gap-2 px-2 md:px-4 text-xs md:text-base"
        aria-label="Toggle between Discogs and uploaded image"
      >
        <span class="hidden sm:inline">{imageStates[album.id] ? "User" : "Discogs"}</span>
        <RefreshCcw size={14} class="sm:hidden" />
        <RefreshCcw size={16} class="hidden sm:block" />
      </button>
    </div>

    <div class="p-3 md:p-4 flex flex-col flex-1">
      <h3 class="text-sm text-gray-500">{album.year != 0 ? album.year : ''}</h3>
      <p class="text-xs text-gray-400 mt-1 truncate">{album.genre}</p>
      <div class="flex flex-row gap-2 md:gap-4 justify-end items-center mt-auto flex-wrap">
        <a
          class="truncate"
          href="https://discogs.com{album.discogs_uri}"
          target="_blank"><img src={discogsLogo} class="w-4 md:w-5" alt="Discogs" /></a
        >
        <span
          class="inline-block px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium rounded-full {getConditionStyle(
            album.condition
          )}">{album.condition}</span
        >
        <h1 class="text-gray-600 text-base md:text-lg truncate">
          ${Number.parseFloat(album.discogs_price).toFixed(2)}
        </h1>
      </div>
    </div>
  </div>
{/snippet}

<UploadModal bind:showModal onClose={closeModal} />
