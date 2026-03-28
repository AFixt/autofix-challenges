import { useState, useRef } from 'react';
import './Slider.css';

/**
 * Inaccessible Slider
 *
 * Accessibility issues:
 * 1. Slider track/thumb are divs, not input[type="range"]
 * 2. No role="slider"
 * 3. No aria-valuenow
 * 4. No aria-valuemin / aria-valuemax
 * 5. No aria-valuetext
 * 6. No aria-label or aria-labelledby
 * 7. Not keyboard focusable
 * 8. No arrow key support
 * 9. No Home/End keys
 * 10. No Page Up/Page Down for larger steps
 * 11. Value display not associated with slider
 */

function SliderControl({ label, value, onChange, min, max, unit }) {
  const trackRef = useRef(null);
  const pct = ((value - min) / (max - min)) * 100;

  const handleMouseDown = (e) => {
    const update = (ev) => {
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      onChange(Math.round(min + ratio * (max - min)));
    };
    update(e);
    const onMove = (ev) => update(ev);
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <div className="slider-control">
      <div className="slider-label-row">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value}{unit}</span>
      </div>
      <div className="slider-track" ref={trackRef} onMouseDown={handleMouseDown}>
        <div className="slider-fill" style={{ width: `${pct}%` }} />
        <div className="slider-thumb" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Slider() {
  const [volume, setVolume] = useState(65);
  const [seek, setSeek] = useState(127);

  return (
    <div className="slider-widget">
      <div className="audio-player">
        <div className="player-title">Now Playing</div>
        <div className="player-track">Bohemian Rhapsody — Queen</div>
        <SliderControl label="Progress" value={seek} onChange={setSeek} min={0} max={354} unit="s" />
        <SliderControl label="Volume" value={volume} onChange={setVolume} min={0} max={100} unit="%" />
      </div>
    </div>
  );
}
