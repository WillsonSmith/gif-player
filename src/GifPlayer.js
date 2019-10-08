import { GifReader } from 'omggif';
import { html } from 'lit-html';
import { component, useState, useEffect } from 'haunted';

import { processGif } from './util/processGif';

function GifPlayer(element) {
  const {src, startFrame = 0} = element;
  console.log(typeof startFrame)
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [gif, setGif] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  function startPlaying() { setPlaying(true) }
  function stopPlaying() { setPlaying(false) }

  useEffect(() => {
    element.addEventListener('mouseenter', startPlaying);
    element.addEventListener('mouseleave', stopPlaying);

    return () => {
      element.removeEventListener('mouseenter', startPlaying);
      element.removeEventListener('mouseleave', stopPlaying);
    };
  });

  useEffect(() => {
    if (gif) {
      const timeout = setTimeout(() => {
        const frameToPlay = currentFrame < gif.frames.length - 1 ? currentFrame + 1 : 0;
        setCurrentFrame(frameToPlay)
      }, gif.frames[currentFrame].delay)

      return () => clearTimeout(timeout)
    }
  });

  useEffect(() => {
    if (canvas && context && gif) {
      canvas.width = gif.width;
      canvas.height = gif.height;
    }
  }, [canvas, context, gif]);

  useEffect(() => {
    if (context && gif && currentFrame) {
      context.putImageData(gif.frames[currentFrame].data, 0, 0);
    }
  }, [currentFrame]);

  useEffect(() => {
    const canvas = element.shadowRoot.querySelector('canvas');

    if (canvas) {
      setCanvas(canvas);
      setContext(canvas.getContext('2d'));
    }

    if (src) {
      fetch(src)
        .then(res => res.arrayBuffer())
        .then(buffer => new Uint8Array(buffer))
        .then(buffer => new GifReader(buffer))
        .then(gif => processGif(gif))
        .then(data => setGif(data))
        .catch(err => console.log(err));
      }
  }, [src]);

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
