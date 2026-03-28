import { useState, useRef } from 'react';
import './Combobox.css';

/**
 * Inaccessible Combobox
 *
 * Accessibility issues:
 * 1. Input has no role="combobox"
 * 2. No aria-expanded on input
 * 3. No aria-controls linking input to listbox
 * 4. Dropdown list has no role="listbox"
 * 5. Options have no role="option"
 * 6. No aria-activedescendant for current option
 * 7. No aria-autocomplete attribute
 * 8. No arrow key navigation in dropdown
 * 9. No Escape to close dropdown
 * 10. No Enter to select option
 * 11. No aria-selected on highlighted option
 * 12. Input has no associated label
 */

const countries = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada',
  'Chile', 'China', 'Colombia', 'Czech Republic', 'Denmark', 'Egypt',
  'Finland', 'France', 'Germany', 'Greece', 'India', 'Indonesia',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Mexico', 'Netherlands',
  'New Zealand', 'Norway', 'Peru', 'Poland', 'Portugal', 'Romania',
  'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand',
  'Turkey', 'United Kingdom', 'United States', 'Vietnam',
];

export default function Combobox() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [highlighted, setHighlighted] = useState(-1);
  const inputRef = useRef(null);

  const filtered = countries.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (country) => {
    setSelected(country);
    setQuery(country);
    setIsOpen(false);
  };

  return (
    <div className="combobox-widget">
      <div className="combobox-label-text">Country</div>
      <div className="combobox-container">
        <input
          ref={inputRef}
          className="combobox-input"
          type="text"
          value={query}
          placeholder="Search countries..."
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
        <span className="combobox-arrow" onClick={() => setIsOpen(!isOpen)}>▾</span>
      </div>
      {isOpen && filtered.length > 0 && (
        <div className="combobox-listbox">
          {filtered.map((country, i) => (
            <div
              key={country}
              className={`combobox-option ${i === highlighted ? 'highlighted' : ''} ${country === selected ? 'selected' : ''}`}
              onClick={() => handleSelect(country)}
              onMouseEnter={() => setHighlighted(i)}
            >
              {country}
            </div>
          ))}
        </div>
      )}
      {selected && (
        <div className="combobox-selected">Selected: {selected}</div>
      )}
    </div>
  );
}
