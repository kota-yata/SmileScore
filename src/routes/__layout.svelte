<script lang="ts">
  import '../styles/app.scss';
</script>

<header>
  <p>😀 Smile<span>Score</span></p>
  <span>Only on Chromium<img alt="chromium" src="chromium.svg" width="20px" height="20px" /></span>
</header>
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    & > p {
      font-size: 24px;
      & > span {
        color: $red;
      }
    }
    & > span {
      font-size: 15px;
      font-weight: 500;
      color: $dark-gray;
      display: flex;
      align-items: center;
      & > img {
        margin-left: 5px;
      }
    }
  }
  main {
    width: 96vw;
    max-width: 1600px;
    margin: 0 auto;
  }
</style>
