import { useState } from 'react';
import './Accordion.css';

/**
 * Inaccessible Accordion
 *
 * Accessibility issues:
 * 1. Headers use <div> instead of headings (no heading structure)
 * 2. Trigger elements are <div>s, not <button>s (not focusable, no implicit role)
 * 3. No aria-expanded on triggers
 * 4. No aria-controls linking triggers to panels
 * 5. No role="region" or aria-labelledby on panels
 * 6. No keyboard support (Enter/Space to toggle)
 * 7. Icon rotation is purely visual, no text alternative for state
 * 8. No id associations between triggers and panels
 * 9. Panel visibility uses display:none without aria-hidden coordination
 * 10. No semantic grouping of accordion items
 */

const faqData = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, Apple Pay, and Google Pay. For enterprise customers, we also offer invoicing with NET 30 payment terms.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can cancel your subscription at any time from your account settings page. Navigate to Settings → Billing → Cancel Subscription. Your access will continue until the end of your current billing period. No refunds are issued for partial months.',
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'Yes! We offer a 14-day free trial on all plans. No credit card is required to start your trial. You\'ll have access to all features during the trial period. At the end of the trial, you can choose to subscribe or your account will be downgraded to our limited free tier.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'You can reach our support team through multiple channels: email us at support@example.com, use the live chat widget in the bottom-right corner of the dashboard, or call us at 1-800-555-0123 during business hours (9 AM – 6 PM EST, Monday – Friday).',
  },
  {
    question: 'What is your refund policy?',
    answer:
      'We offer a 30-day money-back guarantee for annual plans and a 7-day guarantee for monthly plans. If you\'re not satisfied with our service, contact our support team within the guarantee period for a full refund. Custom enterprise agreements may have different terms.',
  },
];

export default function Accordion() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion-widget">
      <div className="accordion-title">Frequently Asked Questions</div>
      <div className="accordion-list">
        {faqData.map((item, index) => (
          <div key={index} className="accordion-item">
            <div
              className={`accordion-header ${openIndex === index ? 'open' : ''}`}
              onClick={() => toggleItem(index)}
            >
              <div className="accordion-question">{item.question}</div>
              <span className={`accordion-icon ${openIndex === index ? 'rotated' : ''}`}>
                ›
              </span>
            </div>
            {openIndex === index && (
              <div className="accordion-panel">
                <div className="accordion-answer">{item.answer}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
