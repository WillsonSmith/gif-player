import { GifReader } from 'omggif';
import { html } from 'lit-html';
import { component, useState, useEffect } from 'haunted';

import { processGif } from './util/processGif';

function GifPlayer(element) {
  const {src, startFrame = 0} = element;
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [gif, setGif] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(startFrame);

  function startPlaying() { setPlaying(true) }
  function stopPlaying() { setPlaying(false) }

  function setGifData(data) {
    if (currentFrame > data.frames.length - 1) {
      setCurrentFrame(0);
    }

    setGif(data);
    canvas.width = data.width;
    canvas.height = data.height;
  }

  useEffect(() => {
    element.addEventListener('mouseenter', startPlaying);
    element.addEventListener('mouseleave', stopPlaying);

    return () => {
      element.removeEventListener('mouseenter', startPlaying);
      element.removeEventListener('mouseleave', stopPlaying);
    };
  });

  useEffect(() => {
    const canvas = element.shadowRoot.querySelector('canvas');
    if (canvas) {
      setCanvas(canvas);
      setContext(canvas.getContext('2d'));
    }
  }, [canvas]);

  useEffect(() => {
    if (gif && playing) {
      const timeout = setTimeout(() => {
        const frameToPlay = currentFrame < gif.frames.length - 1 ? currentFrame + 1 : 0;
        setCurrentFrame(frameToPlay)
      }, gif.frames[currentFrame].delay)

      return () => clearTimeout(timeout)
    }
  });

  useEffect(() => {
    if (gif) {
      context.putImageData(gif.frames[currentFrame].data, 0, 0);
    }
  }, [currentFrame, gif]);

  useEffect(() => {
    if (src && canvas && context) {
      fetch(src)
        .then(res => res.arrayBuffer())
        .then(buffer => new Uint8Array(buffer))
        .then(buffer => new GifReader(buffer))
        .then(gif => processGif(gif))
        .then(data => setGifData(data))
        .catch(err => console.log(err));
      }
  }, [src, canvas, context]);

  return html`
    <style>
      canvas {
        max-width: 100%;
      }
    </style>
    <canvas></canvas>
  `;
}

GifPlayer.observedAttributes = ['src', 'start-frame'];

customElements.define('gif-player', component(GifPlayer));
