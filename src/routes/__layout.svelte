<script lang="ts">
  import '../styles/app.scss';
</script>

<header>😀 Smile<span>Score</span></header>
<main>
  <slot />
</main>

<style lang="scss">
  @import '../styles/variable.scss';

  header {
    margin: 0;
    padding: 0 20px;
    margin-bottom: 20px;
    height: 70px;
    font-size: 24px;
    display: flex;
    align-items: center;
    span {
      color: $red;
    }
  }
  main {
    width: 96vw;
    max-width: 1600px;
    margin: 0 auto;
  }
</style>
