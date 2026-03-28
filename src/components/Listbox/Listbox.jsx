import { useState } from 'react';
import './Listbox.css';

/**
 * Inaccessible Listbox
 *
 * Accessibility issues:
 * 1. Container has no role="listbox"
 * 2. Options have no role="option"
 * 3. No aria-selected on selected option
 * 4. No aria-activedescendant
 * 5. Trigger button is a div, not a button
 * 6. No aria-expanded on trigger
 * 7. No aria-haspopup="listbox"
 * 8. No arrow key navigation
 * 9. No type-ahead selection
 * 10. No Home/End key support
 * 11. No Escape to close
 * 12. No label association
 */

const timezones = [
  'UTC-12:00 Baker Island', 'UTC-11:00 American Samoa', 'UTC-10:00 Hawaii',
  'UTC-09:00 Alaska', 'UTC-08:00 Pacific Time', 'UTC-07:00 Mountain Time',
  'UTC-06:00 Central Time', 'UTC-05:00 Eastern Time', 'UTC-04:00 Atlantic Time',
  'UTC-03:00 Buenos Aires', 'UTC+00:00 London (GMT)', 'UTC+01:00 Berlin (CET)',
  'UTC+02:00 Cairo', 'UTC+03:00 Moscow', 'UTC+05:30 Mumbai',
  'UTC+08:00 Singapore', 'UTC+09:00 Tokyo', 'UTC+10:00 Sydney',
  'UTC+12:00 Auckland',
];

export default function Listbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState('UTC-05:00 Eastern Time');
  const [highlighted, setHighlighted] = useState(-1);

  const handleSelect = (tz) => {
    setSelected(tz);
    setIsOpen(false);
  };

  return (
    <div className="listbox-widget">
      <div className="listbox-label-text">Timezone</div>
      <div className="listbox-wrapper">
        <div
          className="listbox-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="listbox-value">{selected}</span>
          <span className="listbox-arrow">▾</span>
        </div>
        {isOpen && (
          <div className="listbox-dropdown">
            {timezones.map((tz, i) => (
              <div
                key={tz}
                className={`listbox-option ${tz === selected ? 'selected' : ''} ${i === highlighted ? 'highlighted' : ''}`}
                onClick={() => handleSelect(tz)}
                onMouseEnter={() => setHighlighted(i)}
              >
                {tz}
                {tz === selected && <span className="listbox-check">✓</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
