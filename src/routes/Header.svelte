<script lang="ts">
  import logo from "$lib/assets/logo.svg?raw";
</script>

<div id="logo" class="flex text-white justify-center mb-4">
  {@html logo}
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
