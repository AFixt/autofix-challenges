import './Meter.css';

/**
 * Inaccessible Meter
 *
 * Accessibility issues:
 * 1. Meters are divs, not <meter> elements
 * 2. No role="meter"
 * 3. No aria-valuenow
 * 4. No aria-valuemin / aria-valuemax
 * 5. No aria-valuetext for human-readable value
 * 6. No accessible label on each meter
 * 7. Value communicated only visually (bar width + color)
 * 8. Color transitions (green→yellow→red) have no text equivalent
 * 9. No aria-describedby for supplementary text
 */

const meters = [
  { label: 'Disk Space', value: 73, max: 100, text: '73 GB of 100 GB used', color: '#f59e0b' },
  { label: 'Password Strength', value: 4, max: 5, text: 'Strong', color: '#22c55e' },
  { label: 'Project Completion', value: 45, max: 100, text: '45% complete', color: '#4f46e5' },
  { label: 'CPU Usage', value: 89, max: 100, text: '89% utilized', color: '#ef4444' },
  { label: 'Battery Level', value: 62, max: 100, text: '62% remaining', color: '#22c55e' },
];

export default function Meter() {
  return (
    <div className="meter-widget">
      <div className="meter-grid">
        {meters.map((m, i) => (
          <div key={i} className="meter-card">
            <div className="meter-label">{m.label}</div>
            <div className="meter-bar-track">
              <div
                className="meter-bar-fill"
                style={{ width: `${(m.value / m.max) * 100}%`, background: m.color }}
              />
            </div>
            <div className="meter-text">{m.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
