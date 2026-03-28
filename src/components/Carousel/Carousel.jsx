import { useState, useEffect, useRef } from 'react';
import './Carousel.css';

/**
 * Inaccessible Carousel
 *
 * Accessibility issues:
 * 1. No role="region" or aria-roledescription="carousel"
 * 2. No aria-label on the carousel
 * 3. Slides not marked as role="group" with aria-roledescription="slide"
 * 4. No aria-label like "N of M" on slides
 * 5. Previous/Next controls are divs, not buttons
 * 6. No keyboard support for prev/next
 * 7. Dot indicators have no accessible names
 * 8. Auto-rotation with no pause control
 * 9. No aria-live for slide changes
 * 10. Images missing alt text
 */

const slides = [
  { title: 'Wireless Headphones', price: '$79.99', desc: 'Premium noise-cancelling bluetooth headphones', color: '#4f46e5' },
  { title: 'Smart Watch', price: '$199.99', desc: 'Health tracking and notifications on your wrist', color: '#0891b2' },
  { title: 'Laptop Stand', price: '$49.99', desc: 'Ergonomic aluminum stand for any laptop', color: '#059669' },
  { title: 'Mechanical Keyboard', price: '$129.99', desc: 'RGB backlit with hot-swappable switches', color: '#dc2626' },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const prev = () => setCurrent((current - 1 + slides.length) % slides.length);
  const next = () => setCurrent((current + 1) % slides.length);

  return (
    <div className="carousel-widget">
      <div className="carousel-viewport">
        <div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
          {slides.map((slide, i) => (
            <div key={i} className="carousel-slide">
              <div className="slide-image" style={{ background: slide.color }}>
                <img src="" className="slide-img" />
              </div>
              <div className="slide-content">
                <div className="slide-title">{slide.title}</div>
                <div className="slide-desc">{slide.desc}</div>
                <div className="slide-price">{slide.price}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="carousel-prev" onClick={prev}>‹</div>
        <div className="carousel-next" onClick={next}>›</div>
      </div>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`carousel-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
          />
        ))}
      </div>
    </div>
  );
}
