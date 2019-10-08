import { GifReader } from 'omggif';
import { html } from 'lit-html';
import { component, useState, useEffect } from 'haunted';

import { processGif } from './util/processGif';

const playEvent = new Event('play');
const pauseEvent = new Event('pause');

function GifPlayer(element) {
  const {src, autoplay, startFrame = 0} = element;
  const [canvas, setCanvas] = useState(null);
  const [context, setContext] = useState(null);
  const [gif, setGif] = useState(null);
  const [playing, setPlaying] = useState(Boolean(autoplay));
  const [currentFrame, setCurrentFrame] = useState(Number(startFrame));

  this.play = () => startPlaying();
  this.pause = () => stopPlaying();

  useEffect(() => { // this should probably be optional
    element.addEventListener('mouseenter', startPlaying);
    element.addEventListener('mouseleave', stopPlaying);

    return () => {
      element.removeEventListener('mouseenter', startPlaying);
      element.removeEventListener('mouseleave', stopPlaying);
    };
  });

  useEffect(() => {
    const canvasElement = element.shadowRoot.querySelector('canvas');
    if (canvasElement) {
      setCanvas(canvasElement);
      setContext(canvasElement.getContext('2d'));
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

  function startPlaying() {
    setPlaying(true);
    element.dispatchEvent(playEvent);
  }
  function stopPlaying() {
    setPlaying(false);
    element.dispatchEvent(pauseEvent);
  }

  function setGifData(data) {
    if (currentFrame > data.frames.length - 1) {
      setCurrentFrame(0);
    }

    setGif(data);
    canvas.width = data.width;
    canvas.height = data.height;
  }
}

GifPlayer.observedAttributes = ['src', 'autoplay', 'start-frame'];

customElements.define('gif-player', component(GifPlayer));
