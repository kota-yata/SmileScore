import { RekognitionClient, DetectFacesCommand, DetectFacesCommandOutput } from '@aws-sdk/client-rekognition';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';

const REGION = 'ap-northeast-1';

// AWS Transcribe object
const client = new RekognitionClient({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    client: new CognitoIdentityClient({ region: REGION }),
    identityPoolId: 'ap-northeast-1:8d11425e-715d-4d17-bddc-d67cd3ae9ca0'
  })
});

export const adoptImageData = async (dataURL: string): Promise<Uint8Array> => {
  const image = atob(dataURL.split('data:image/jpeg;base64,')[1]);
  const length = image.length;
  const imageBytes = new ArrayBuffer(length);
  const ua = new Uint8Array(imageBytes);
  for (let i = 0; i < length; i++) {
    ua[i] = image.charCodeAt(i);
  }
  return ua;
};

export const analyzeFace = async (dataURL: string): Promise<DetectFacesCommandOutput> => {
  const binary = await adoptImageData(dataURL);
  const params = {
    Image: { Bytes: binary, },
    Attributes: ['ALL'],
  };
  const faceData = await client.send(new DetectFacesCommand(params)).catch((err) => { console.log(err); }) as DetectFacesCommandOutput;
  return faceData;
};

const checkIfModernBrowser = (): boolean => {
  const hasModernAPI: boolean = 'showSaveFilePicker' in window;
  return hasModernAPI;
};

export const saveBlobFile = async (opts: unknown, body: Blob): Promise<void> => {
  const isModern: boolean = checkIfModernBrowser();
  // File System Access APIに対応するブラウザーの場合
  if (isModern) {
    const tmpFileHandle = await window.showSaveFilePicker(opts);
    const writable = await tmpFileHandle.createWritable();
    await writable.write(body);
    await writable.close();
    return;
  }
  // Files System Acecss APIに対応しない古いブラウザーの場合
  console.log('このブラウザはFile System Access APIに対応していません');
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = window.URL.createObjectURL(body);
  a.download = 'mysmile';
  a.click();
};
