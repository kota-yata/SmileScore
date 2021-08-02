<script lang="ts">
  // I'm gonna separate these codes into components later

  import Loading from '$lib/loading.svelte';
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { adoptImageData, analyzeFace, saveBlobFile } from '$lib/imageProcess';
  import type { DetectFacesCommandOutput } from '@aws-sdk/client-rekognition';
  import { computeTotalScore } from '$lib/totalScore';

  const countdown = {
    num: 3,
    isCountdownVisible: false
  };

  const scores = {
    total: 0,
    smilingRate: 0,
    openMouthRate: 0,
    happiness: 0,
    faceCount: 0,
  };

  let state: 'init' | 'waiting' | 'done' = 'init';

  let canvas: HTMLCanvasElement = null;
  const camera = {
    element: null as HTMLVideoElement,
    inputDevices: null as MediaDeviceInfo[],
    selectedDevice: null as string
  };
  let image;

  $: shareText = `https://twitter.com/intent/tweet?url=https://smilescore.vercel.app/&text=My SmileScore is ${scores.total}😀 %0AHow about yours??%0A%0A&via=kota_yata&related=kota_yata&amp;hashtags=SmileScore`;

  const calculateCanvasSize = (stream: MediaStream) => {
    const aspectRatio = stream.getVideoTracks()[0].getSettings().aspectRatio;
    [canvas.width, canvas.height] = [camera.element.offsetHeight * aspectRatio, camera.element.offsetHeight];
  };

  onMount(async () => {
    camera.element = document.getElementById('camera') as HTMLVideoElement;
    canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Cannot prepare camera');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.inputDevices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput');
    camera.element.srcObject = stream;
    camera.element.play();
    calculateCanvasSize(stream);
  });

  const changeDevice = async (e) => {
    console.log(e.target.value);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: e.target.value } } });
    camera.element.srcObject = stream;
    camera.element.play();
    calculateCanvasSize(stream);
  }

  const computeResult = (faceData: DetectFacesCommandOutput) => {
    scores.smilingRate = faceData.FaceDetails[0].Smile.Value ? faceData.FaceDetails[0].Smile.Confidence : 0;
    scores.openMouthRate = faceData.FaceDetails[0].MouthOpen.Value ? faceData.FaceDetails[0].MouthOpen.Confidence : 0;
    scores.happiness = faceData.FaceDetails[0].Emotions[2].Confidence;
    scores.faceCount = faceData.FaceDetails.length;
    scores.total = computeTotalScore([scores.smilingRate, scores.openMouthRate, scores.happiness]);
  };

  const takePhoto = async () => {
    state = 'waiting';
    camera.element.pause();
    const context = canvas.getContext('2d');
    context.drawImage(camera.element, 0, 0, camera.element.offsetWidth, camera.element.offsetHeight);
    image = canvas.toDataURL('image/jpeg', 1);
    const faceData: DetectFacesCommandOutput = await analyzeFace(image);
    console.log(faceData);
    computeResult(faceData);
    state = 'done';
  };

  const takeButtonOnClick = () => {
    camera.element.play();
    countdown.isCountdownVisible = true;
    const timer = setInterval(() => {
      countdown.num--;
      if (countdown.num <= 0) {
        clearInterval(timer);
        countdown.isCountdownVisible = false;
        countdown.num = 3;
        takePhoto();
      };
    }, 1000)
  };

  const saveButtonOnClick = async () => {
    const uint = await adoptImageData(image);
    const blob: Blob = new Blob([uint.buffer], { type: 'image/jpeg' });
    const options = {
      types: [{
        description: 'Image Files',
        accept: { 'image/jpeg': ['.jpg', '.jpeg'], },
      },],
    };
    await saveBlobFile(options, blob);
  };
</script>

<svelte:head>
  <title>SmileScore</title>
</svelte:head>

<div class="container">
  <canvas style="display: none" id="canvas"></canvas>
  <div class="cams">
    <!-- svelte-ignore a11y-media-has-caption -->
    <div class="video">
      <video id="camera" height="100%"></video>
      {#if countdown.isCountdownVisible}
        <div class="countdown"><p>{countdown.num}</p></div>
      {/if}
      {#if camera.inputDevices}
        <select on:change="{changeDevice}">
          {#each camera.inputDevices as device}
          <option value={device.deviceId}>{device.label}</option>
          {/each}
        </select>
      {/if}
    </div>
    <div class="cams-message">
      <h2>Crack a smile<br />with your mouth open.</h2>
      <div>
        <p>Take a photo to see your smile score 😀</p>
        <button on:click="{takeButtonOnClick}"><img alt="take" src="/camera.svg" width="30px" height="30px" /></button>
      </div>
    </div>
  </div>
  <div class="scores">
    {#if state === 'init'}
    <span>Your smile score will be shown here 👍</span>
    {:else if state === 'waiting'}
    <Loading /><br />
    {:else if state === 'done'}
    <div class="total" transition:fade={{delay: 0}}>
      <span>Your smile score is...</span>
      <div class="total-score">{scores.total}</div>
    </div>
    <div class="details" transition:fade={{delay: 1000}}>
      <h3>Details</h3>
      <div>
        Smiling rate : <span>{scores.smilingRate}</span><br />
        Open mouth rate : <span>{scores.openMouthRate}</span><br />
        Happiness : <span>{scores.happiness}</span>
      </div>
    </div>
    <div class="share" transition:fade={{delay: 5000}}>
      <a href="{shareText}" target="blank"><img alt="twitter icon" src="/twitter.svg" width="20px" height="20px" />Tweet</a>
      <button on:click="{saveButtonOnClick}"><img alt="save icon" src="/save.svg" width="20px" height="20px" />Save smile</button>
    </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../styles/variable.scss';

  .container {
    width: 100%;
    text-align: center;
    margin: 0 auto;
    .cams {
      width: 100%;
      height: 55vh;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      .video {
        position: relative;
        width: 55%;
        height: 100%;
        background: $black;
        & > video {
          object-fit: contain;
        }
        & > select {
          appearance: none;
          position: absolute;
          bottom: 10px;
          left: 10px;
          border: none;
          border-radius: 100px;
          padding: 10px 20px;
        }
        & > div {
          position: absolute;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 144px;
          color: $white;
          opacity: 0.8;
        }
      }
      &-message {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding:0 0 30px 4vw;
        & > h2 {
          font-size: 3vw;
        }
        & > div > button {
          cursor: pointer;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          padding: 10px;
          background: $red;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          transition: 0.2s;
          &:hover {
            opacity: 0.7;
            transition: 0.2s;
          }
        }
      }
    }
    .scores {
      height: calc(100vh - 90px - 55vh - 5%);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-evenly;
      align-items: flex-start;
      padding-top: 5%;
      & > span {
        padding-top: 5%;
      }
      .total {
        &-score {
          font-size: 144px;
          color: $red;
        }
      }
      .details {
        text-align: left;
        & > h3 {
          font-size: 30px;
          margin: 0 0 10px 0;
        }
        & > div {
          margin-left: 10px;
          & > span {
            font-size: 24px;
          }
        }
      }
      .share {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        a, button {
          font-size: 18px;
          color: $white;
          display: flex;
          align-items: center;
          padding: 15px 28px;
          border-radius: 100px;
          margin-bottom: 20px;
          img {
            margin-right: 15px;
          }
        }
        & > a {
          text-decoration: none;
          background: $twitter-blue;
        }
        & > button {
          cursor: pointer;
          font-weight: 600;
          background: $red;
          transition: 0.2s;
          &:hover {
            opacity: 0.7;
            transition: 0.2s;
          }
        }
      }
    }
  }

  @media screen and (max-width: 1100px) {
    .cams-message > div > p {
      font-size: 15px;
    }
  }

  @media screen and (max-width: 500px) {
    .container {
      .cams {
        height: auto;
        .video {
          width: 100vw;
          overflow: hidden;
          display: flex;
          justify-content: center;
        }
        &-message {
          padding: 0;
          & > h2 {
            font-size: 24px;
          }
        }
      }
      .scores {
        height: auto;
        & > span {
          font-size: 15px;
        }
        .details {
          width: 80vw;
          font-size: 15px;
          & > div > span {
            font-size: 20px;
          }
        }
        .share {
          margin-top: 40px;
        }
      }
    }
  }
</style>
