import { useState } from 'react';
import './Spinbutton.css';

/**
 * Inaccessible Spinbutton
 *
 * Accessibility issues:
 * 1. No role="spinbutton" on the value container
 * 2. No aria-valuenow
 * 3. No aria-valuemin / aria-valuemax
 * 4. No aria-valuetext
 * 5. No aria-label
 * 6. Increment/decrement triggers are spans, not buttons
 * 7. Not keyboard focusable
 * 8. No arrow key support (Up/Down to change value)
 * 9. No Home/End for min/max
 * 10. No Page Up/Page Down for larger steps
 * 11. Value change not announced to screen readers
 */

function SpinControl({ label, value, onChange, min, max, step = 1 }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  return (
    <div className="spin-control">
      <div className="spin-label">{label}</div>
      <div className="spin-input">
        <span className="spin-btn" onClick={dec}>−</span>
        <div className="spin-value">{value}</div>
        <span className="spin-btn" onClick={inc}>+</span>
      </div>
    </div>
  );
}

export default function Spinbutton() {
  const [qty, setQty] = useState(1);
  const [guests, setGuests] = useState(2);

  return (
    <div className="spin-widget">
      <div className="spin-card">
        <div className="spin-product">Wireless Headphones</div>
        <div className="spin-price">$79.99</div>
        <SpinControl label="Quantity" value={qty} onChange={setQty} min={1} max={99} />
      </div>
      <div className="spin-card">
        <div className="spin-product">Restaurant Reservation</div>
        <SpinControl label="Number of Guests" value={guests} onChange={setGuests} min={1} max={20} />
      </div>
    </div>
  );
}
