import { useState, useRef } from 'react';
import './MultiThumbSlider.css';

/**
 * Inaccessible Multi-Thumb Slider
 *
 * Accessibility issues:
 * 1. Both thumbs are divs, not input[type="range"]
 * 2. No role="slider" on either thumb
 * 3. No aria-valuenow / aria-valuemin / aria-valuemax
 * 4. No aria-valuetext
 * 5. No aria-label differentiating "minimum" from "maximum"
 * 6. Not keyboard focusable
 * 7. No arrow keys
 * 8. Thumbs can overlap/cross with no constraint announcement
 * 9. No group labeling
 * 10. Range fill area is purely decorative
 */

function RangeSlider({ label, min, max, low, high, onLowChange, onHighChange, unit, formatVal }) {
  const trackRef = useRef(null);

  const pctLow = ((low - min) / (max - min)) * 100;
  const pctHigh = ((high - min) / (max - min)) * 100;

  const makeHandler = (setter, clampFn) => (e) => {
    const update = (ev) => {
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      setter(clampFn(Math.round(min + ratio * (max - min))));
    };
    update(e);
    const onMove = (ev) => update(ev);
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const display = formatVal || ((v) => `${v}${unit || ''}`);

  return (
    <div className="mts-control">
      <div className="mts-label-row">
        <span className="mts-label">{label}</span>
        <span className="mts-values">{display(low)} — {display(high)}</span>
      </div>
      <div className="mts-track" ref={trackRef}>
        <div className="mts-range" style={{ left: `${pctLow}%`, width: `${pctHigh - pctLow}%` }} />
        <div className="mts-thumb" style={{ left: `${pctLow}%` }} onMouseDown={makeHandler(onLowChange, (v) => Math.min(v, high))} />
        <div className="mts-thumb" style={{ left: `${pctHigh}%` }} onMouseDown={makeHandler(onHighChange, (v) => Math.max(v, low))} />
      </div>
    </div>
  );
}

export default function MultiThumbSlider() {
  const [priceLow, setPriceLow] = useState(200);
  const [priceHigh, setPriceHigh] = useState(800);

  return (
    <div className="mts-widget">
      <RangeSlider
        label="Price Range"
        min={0} max={1000}
        low={priceLow} high={priceHigh}
        onLowChange={setPriceLow} onHighChange={setPriceHigh}
        formatVal={(v) => `$${v}`}
      />
    </div>
  );
}
