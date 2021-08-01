<div class="container">
  <div class="circleloader"></div>
</div>

<style lang="scss">
  @import '../styles/variable.scss';

  .container {
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    margin: 0 auto;
    margin-top: 5%;
  }

  .circleloader {
    position: absolute;
    box-sizing: border-box;
    top: 50%;
    margin-top: -10px;
    border-radius: 16px;
    width: 80px;
    height: 20px;
    padding: 4px;
    background: $red;
    
    &:before {
      content: '';
      position: absolute;
      border-radius: 16px;
      width: 20px;
      height: 12px;
      left: 0;
      background: $white;
      animation: push 1s infinite linear;    
    }
  }

  @keyframes push {
    50% {
      left: 56px;
    }
  }
</style>