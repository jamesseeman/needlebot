<script lang="ts">
  import logo from "$lib/assets/logo.svg?raw";
  import { Github } from "lucide-svelte";
</script>

<div class="relative">
  <a
    href="https://github.com/jamesseeman/needlebot"
    target="_blank"
    class="absolute top-0 right-0 p-4 text-white hover:opacity-80 transition-opacity"
  >
    <Github size={24} />
  </a>
  <div id="logo" class="flex text-white justify-center mb-4">
    {@html logo}
  </div>
</div>

<style>
  :global(#logo svg) {
    height: 10%;
    width: 20%;
  }

  :global(#logo svg path) {
    fill: white !important;
  }
</style>
