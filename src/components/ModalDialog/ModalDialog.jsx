import { useState } from 'react';
import './ModalDialog.css';

/**
 * Inaccessible Modal Dialog
 *
 * Accessibility issues:
 * 1. Uses <div> instead of <dialog> element, no role="dialog"
 * 2. No aria-modal attribute
 * 3. No aria-labelledby or aria-label
 * 4. Focus not moved to modal on open
 * 5. Focus not trapped inside modal (Tab escapes to background)
 * 6. Focus not returned to trigger button on close
 * 7. Escape key does not close modal
 * 8. Background content not marked inert
 * 9. Close button uses <span> instead of <button>
 * 10. Overlay click handler doesn't close modal (common pattern omission)
 */
export default function ModalDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="trigger-area">
        <span className="open-btn" onClick={() => setIsOpen(true)}>
          Open Settings
        </span>
      </div>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title">Settings</div>
              <span className="close-btn" onClick={() => setIsOpen(false)}>
                ×
              </span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <div className="label-text">Username</div>
                <input type="text" className="modal-input" />
              </div>
              <div className="form-group">
                <div className="label-text">Email</div>
                <input type="email" className="modal-input" />
              </div>
              <div className="form-group">
                <div className="label-text">Notifications</div>
                <div className="toggle-row">
                  <span
                    className="toggle-switch"
                    onClick={(e) => {
                      e.currentTarget.classList.toggle('active');
                    }}
                  >
                    <span className="toggle-knob"></span>
                  </span>
                  <span>Enable email notifications</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <span className="btn btn-cancel" onClick={() => setIsOpen(false)}>
                Cancel
              </span>
              <span className="btn btn-save" onClick={() => setIsOpen(false)}>
                Save Changes
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
