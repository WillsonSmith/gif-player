export function processGif(gif) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const count = gif.numFrames();
  const frames = new Array(count);

  let currentFrame = -1;
  while (currentFrame < count - 1) {
    const frameInfo = gif.frameInfo(currentFrame + 1);
    const imageData = context.createImageData(gif.width, gif.height);
    if (currentFrame >= 0 && frameInfo.disposal < 2) {
      imageData.data.set(new Uint8ClampedArray(frames[currentFrame].data.data));
    }

    currentFrame += 1;
    frames[currentFrame] = {
      data: imageData,
      delay: gif.frameInfo(currentFrame).delay * 10,
    };
    gif.decodeAndBlitFrameRGBA(currentFrame, imageData.data);
  }

  return Promise.resolve({width: gif.width, height: gif.height, frames});
}
