import { useState } from 'react';
import './Disclosure.css';

/**
 * Inaccessible Disclosure (Show/Hide)
 *
 * Accessibility issues:
 * 1. Toggle trigger is a span, not a button
 * 2. No aria-expanded on trigger
 * 3. No aria-controls linking trigger to content
 * 4. Content visibility toggled via CSS only (no aria-hidden coordination)
 * 5. Not keyboard accessible (no Enter/Space)
 * 6. No focus management when content appears
 * 7. State change not communicated to screen readers
 */

export default function Disclosure() {
  const [showMore, setShowMore] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  return (
    <div className="disclosure-widget">
      <div className="product-card">
        <div className="product-name">Ultra HD Smart TV — 65"</div>
        <div className="product-price">$899.99</div>
        <div className="product-short">
          Experience stunning 4K resolution with vibrant colors and deep contrast.
          Smart TV features let you stream your favorite shows and movies.
        </div>

        {showMore && (
          <div className="product-full">
            <p>
              This 65-inch Ultra HD Smart TV delivers an exceptional viewing experience
              with HDR10+ support, Dolby Vision, and a 120Hz refresh rate for smooth motion.
              The built-in voice assistant lets you control your TV hands-free, while the
              slim bezel design creates an immersive viewing experience.
            </p>
            <p>
              Connect your favorite streaming services including Netflix, Disney+, and
              Amazon Prime Video. With 4 HDMI ports and built-in WiFi 6, you can connect
              all your devices seamlessly.
            </p>
          </div>
        )}

        <span className="disclosure-toggle" onClick={() => setShowMore(!showMore)}>
          {showMore ? 'Show Less ▲' : 'Read More ▼'}
        </span>
      </div>

      <div className="specs-section">
        <span className="disclosure-toggle specs-toggle" onClick={() => setShowSpecs(!showSpecs)}>
          <span className={`specs-chevron ${showSpecs ? 'open' : ''}`}>›</span>
          Technical Specifications
        </span>
        {showSpecs && (
          <div className="specs-content">
            <div className="spec-row"><span className="spec-key">Display</span><span className="spec-val">65" LED, 3840×2160</span></div>
            <div className="spec-row"><span className="spec-key">HDR</span><span className="spec-val">HDR10+, Dolby Vision</span></div>
            <div className="spec-row"><span className="spec-key">Refresh Rate</span><span className="spec-val">120Hz</span></div>
            <div className="spec-row"><span className="spec-key">Speakers</span><span className="spec-val">20W, Dolby Atmos</span></div>
            <div className="spec-row"><span className="spec-key">Connectivity</span><span className="spec-val">WiFi 6, Bluetooth 5.2</span></div>
            <div className="spec-row"><span className="spec-key">Ports</span><span className="spec-val">4× HDMI 2.1, 2× USB</span></div>
            <div className="spec-row"><span className="spec-key">Weight</span><span className="spec-val">18.5 kg</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
