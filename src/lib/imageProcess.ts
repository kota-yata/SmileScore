export const adoptImageData = async (dataURL: string): Promise<void> => {
  const image = atob(dataURL.split('data:image/png;base64,')[1]);
  const length = image.length;
  const imageBytes = new ArrayBuffer(length);
  const ua = new Uint8Array(imageBytes);
  for (let i = 0; i < length; i++) {
    ua[i] = image.charCodeAt(i);
  }
};
