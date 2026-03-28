import { useState } from 'react';
import './Alert.css';

/**
 * Inaccessible Alert
 *
 * Accessibility issues:
 * 1. No role="alert" or aria-live on alert containers
 * 2. Dynamically added alerts not announced to screen readers
 * 3. No aria-atomic on alert regions
 * 4. Dismiss buttons are spans with no button role
 * 5. Dismiss buttons have no accessible label
 * 6. Alert type conveyed by color alone (no icon text alternative)
 * 7. No role="status" for non-urgent notifications
 * 8. Alert container has no accessible name
 */

const initialAlerts = [
  { id: 1, type: 'success', message: 'Your profile has been updated successfully.' },
  { id: 2, type: 'warning', message: 'Your subscription expires in 3 days.' },
  { id: 3, type: 'error', message: 'Failed to save changes. Please try again.' },
];

const newAlertMessages = [
  { type: 'info', message: 'A new version is available. Refresh to update.' },
  { type: 'success', message: 'File uploaded successfully.' },
  { type: 'error', message: 'Network connection lost.' },
  { type: 'warning', message: 'Storage is almost full (90% used).' },
];

export default function Alert() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [nextId, setNextId] = useState(4);

  const addAlert = () => {
    const template = newAlertMessages[Math.floor(Math.random() * newAlertMessages.length)];
    setAlerts([...alerts, { id: nextId, ...template }]);
    setNextId(nextId + 1);
  };

  const dismissAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="alert-widget">
      <div className="alert-header">
        <div className="alert-title">Notifications</div>
        <span className="add-alert-btn" onClick={addAlert}>+ Add Notification</span>
      </div>
      <div className="alert-list">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert-item alert-${alert.type}`}>
            <span className="alert-icon">
              {alert.type === 'success' && '●'}
              {alert.type === 'warning' && '▲'}
              {alert.type === 'error' && '✕'}
              {alert.type === 'info' && 'ℹ'}
            </span>
            <div className="alert-message">{alert.message}</div>
            <span className="alert-dismiss" onClick={() => dismissAlert(alert.id)}>×</span>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="alert-empty">No notifications</div>
        )}
      </div>
    </div>
  );
}
