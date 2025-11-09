<script lang="ts">
  import logo from "$lib/assets/logo.svg?raw";
  import { Github } from "lucide-svelte";
</script>

<div class="relative">
  <a
    href="https://github.com/jamesseeman/needlebot"
    target="_blank"
    class="absolute top-2 right-2 md:top-4 md:right-4 p-2 md:p-4 text-white hover:opacity-80 transition-opacity z-10"
  >
    <Github size={20} class="md:hidden" />
    <Github size={24} class="hidden md:block" />
  </a>
  <div id="logo" class="flex text-white justify-center mb-4 px-4">
    {@html logo}
  </div>
</div>

<style>
  :global(#logo svg) {
    height: auto;
    width: 80%;
    max-width: 600px;
  }

  @media (min-width: 768px) {
    :global(#logo svg) {
      width: 50%;
    }
  }

  @media (min-width: 1024px) {
    :global(#logo svg) {
      width: 20%;
    }
  }

  :global(#logo svg path) {
    fill: white !important;
  }
</style>
