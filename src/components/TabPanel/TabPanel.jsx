import { useState } from 'react';
import './TabPanel.css';

/**
 * Inaccessible Tab Panel
 *
 * Accessibility issues:
 * 1. No role="tablist" on tab container
 * 2. No role="tab" on individual tabs
 * 3. No role="tabpanel" on content panels
 * 4. No aria-selected on tabs
 * 5. No aria-controls linking tabs to panels
 * 6. No aria-labelledby linking panels to tabs
 * 7. Tabs are <div> elements, not focusable
 * 8. No arrow key navigation between tabs
 * 9. No Home/End key support
 * 10. No tabindex management (roving tabindex pattern missing)
 */

const tabData = [
  {
    label: 'Overview',
    content: (
      <div>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">2,847</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$48,295</div>
            <div className="stat-label">Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">94.2%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'Users',
    content: (
      <div>
        <div className="user-list">
          <div className="user-item">
            <div className="user-avatar">JD</div>
            <div className="user-info">
              <div className="user-name">Jane Doe</div>
              <div className="user-email">jane@example.com</div>
            </div>
            <div className="user-role">Admin</div>
          </div>
          <div className="user-item">
            <div className="user-avatar">AS</div>
            <div className="user-info">
              <div className="user-name">Alex Smith</div>
              <div className="user-email">alex@example.com</div>
            </div>
            <div className="user-role">Editor</div>
          </div>
          <div className="user-item">
            <div className="user-avatar">MJ</div>
            <div className="user-info">
              <div className="user-name">Maria Johnson</div>
              <div className="user-email">maria@example.com</div>
            </div>
            <div className="user-role">Viewer</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    label: 'Analytics',
    content: (
      <div>
        <div className="chart-placeholder">
          <div className="bar-chart">
            <div className="bar" style={{ height: '60%' }}><span>Mon</span></div>
            <div className="bar" style={{ height: '80%' }}><span>Tue</span></div>
            <div className="bar" style={{ height: '45%' }}><span>Wed</span></div>
            <div className="bar" style={{ height: '90%' }}><span>Thu</span></div>
            <div className="bar" style={{ height: '70%' }}><span>Fri</span></div>
          </div>
        </div>
        <div className="analytics-summary">
          <span>Peak: Thursday</span>
          <span>Average: 423 visits/day</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Settings',
    content: (
      <div>
        <div className="settings-list">
          <div className="setting-item">
            <div>
              <div className="setting-name">Dark Mode</div>
              <div className="setting-desc">Use dark theme across the dashboard</div>
            </div>
            <span className="setting-toggle"></span>
          </div>
          <div className="setting-item">
            <div>
              <div className="setting-name">Compact View</div>
              <div className="setting-desc">Reduce spacing for denser information display</div>
            </div>
            <span className="setting-toggle active"></span>
          </div>
          <div className="setting-item">
            <div>
              <div className="setting-name">Auto-refresh</div>
              <div className="setting-desc">Automatically refresh data every 30 seconds</div>
            </div>
            <span className="setting-toggle"></span>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TabPanel() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="tabs-widget">
      <div className="tab-list">
        {tabData.map((tab, index) => (
          <div
            key={index}
            className={`tab-item ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </div>
        ))}
      </div>
      <div className="tab-content">
        {tabData[activeTab].content}
      </div>
    </div>
  );
}
