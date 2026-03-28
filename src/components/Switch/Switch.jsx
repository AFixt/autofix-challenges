import { useState } from 'react';
import './Switch.css';

/**
 * Inaccessible Switch
 *
 * Accessibility issues:
 * 1. Switches are divs, not input[type="checkbox"] or button
 * 2. No role="switch"
 * 3. No aria-checked
 * 4. Not keyboard focusable
 * 5. No Space/Enter to toggle
 * 6. On/Off state conveyed only by color and position
 * 7. No label association
 * 8. No group label for the settings section
 * 9. Status text ("On"/"Off") not programmatically linked
 * 10. No focus indicator
 */

const settings = [
  { id: 'dark', label: 'Dark Mode', desc: 'Use dark theme across the application', initial: false },
  { id: 'notif', label: 'Notifications', desc: 'Receive push notifications', initial: true },
  { id: 'autosave', label: 'Auto-save', desc: 'Automatically save drafts every 30 seconds', initial: true },
  { id: '2fa', label: 'Two-Factor Authentication', desc: 'Require 2FA for sign-in', initial: false },
  { id: 'marketing', label: 'Marketing Emails', desc: 'Receive product updates and promotions', initial: false },
];

export default function Switch() {
  const [values, setValues] = useState(() => {
    const v = {};
    settings.forEach((s) => { v[s.id] = s.initial; });
    return v;
  });

  const toggle = (id) => {
    setValues({ ...values, [id]: !values[id] });
  };

  return (
    <div className="switch-widget">
      <div className="switch-group-title">Settings</div>
      <div className="switch-list">
        {settings.map((s) => (
          <div key={s.id} className="switch-item">
            <div className="switch-info">
              <div className="switch-name">{s.label}</div>
              <div className="switch-desc">{s.desc}</div>
            </div>
            <div className="switch-control" onClick={() => toggle(s.id)}>
              <div className={`switch-track ${values[s.id] ? 'on' : ''}`}>
                <div className="switch-knob" />
              </div>
              <span className="switch-status">{values[s.id] ? 'On' : 'Off'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
