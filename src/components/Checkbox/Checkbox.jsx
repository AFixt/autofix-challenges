import { useState } from 'react';
import './Checkbox.css';

/**
 * Inaccessible Checkbox
 *
 * Accessibility issues:
 * 1. Checkboxes are styled divs, not input[type="checkbox"]
 * 2. No role="checkbox"
 * 3. No aria-checked (true/false/mixed)
 * 4. Not keyboard focusable
 * 5. No Space key to toggle
 * 6. No group label (no role="group" or fieldset/legend)
 * 7. Check mark is purely visual (CSS), no state communicated
 * 8. "Select all" has no aria-controls relationship
 * 9. Labels are separate divs with no programmatic association
 */

const options = [
  { id: 'email', label: 'Email notifications', desc: 'Receive updates via email' },
  { id: 'sms', label: 'SMS notifications', desc: 'Get text messages for urgent alerts' },
  { id: 'push', label: 'Push notifications', desc: 'Browser and mobile push alerts' },
  { id: 'marketing', label: 'Marketing emails', desc: 'Product news and special offers' },
  { id: 'weekly', label: 'Weekly digest', desc: 'Summary of activity each week' },
];

export default function Checkbox() {
  const [checked, setChecked] = useState({ email: true, sms: false, push: true, marketing: false, weekly: false });

  const allChecked = options.every((o) => checked[o.id]);
  const someChecked = options.some((o) => checked[o.id]) && !allChecked;

  const toggleOne = (id) => {
    setChecked({ ...checked, [id]: !checked[id] });
  };

  const toggleAll = () => {
    const newVal = !allChecked;
    const next = {};
    options.forEach((o) => { next[o.id] = newVal; });
    setChecked(next);
  };

  return (
    <div className="checkbox-widget">
      <div className="checkbox-group-title">Notification Preferences</div>

      <div className="checkbox-group">
        <div className="checkbox-item select-all" onClick={toggleAll}>
          <div className={`checkbox-box ${allChecked ? 'checked' : ''} ${someChecked ? 'mixed' : ''}`}>
            {allChecked && <span className="check-icon">✓</span>}
            {someChecked && <span className="check-icon">—</span>}
          </div>
          <div className="checkbox-label">
            <div className="checkbox-text">Select all</div>
          </div>
        </div>

        <div className="checkbox-divider" />

        {options.map((opt) => (
          <div key={opt.id} className="checkbox-item" onClick={() => toggleOne(opt.id)}>
            <div className={`checkbox-box ${checked[opt.id] ? 'checked' : ''}`}>
              {checked[opt.id] && <span className="check-icon">✓</span>}
            </div>
            <div className="checkbox-label">
              <div className="checkbox-text">{opt.label}</div>
              <div className="checkbox-desc">{opt.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
