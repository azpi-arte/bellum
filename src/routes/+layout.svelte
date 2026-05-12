<script>
  import '../app.css';
  let { children } = $props(); // Svelte 5 syntax
</script>

<main>
  {@render children()}
</main>

<style>
  main {
    max-width: 600px; /* Keep mobile view centered on desktop */
    margin: 0 auto;
    min-height: 100vh;
  }
</style>