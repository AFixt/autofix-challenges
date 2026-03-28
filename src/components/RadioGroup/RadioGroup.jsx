import { useState } from 'react';
import './RadioGroup.css';

/**
 * Inaccessible Radio Group
 *
 * Accessibility issues:
 * 1. Radio buttons are styled divs, not input[type="radio"]
 * 2. No role="radiogroup" on group container
 * 3. No role="radio" on individual options
 * 4. No aria-checked on selected option
 * 5. Not keyboard focusable
 * 6. No arrow key navigation between options
 * 7. No group label (no fieldset/legend equivalent)
 * 8. Selected state conveyed only by border color
 * 9. No Space key to select
 * 10. Description text not associated with radio option
 */

const plans = [
  { id: 'free', name: 'Free', price: '$0/mo', desc: '5 projects, 1 GB storage, community support' },
  { id: 'pro', name: 'Pro', price: '$19/mo', desc: 'Unlimited projects, 50 GB storage, priority support' },
  { id: 'enterprise', name: 'Enterprise', price: '$49/mo', desc: 'Unlimited everything, SSO, dedicated support' },
];

const billing = [
  { id: 'monthly', name: 'Monthly' },
  { id: 'annually', name: 'Annually (save 20%)' },
];

export default function RadioGroup() {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  return (
    <div className="radio-widget">
      <div className="radio-section">
        <div className="radio-group-title">Subscription Plan</div>
        <div className="radio-group">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`radio-option ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className={`radio-circle ${selectedPlan === plan.id ? 'checked' : ''}`}>
                {selectedPlan === plan.id && <div className="radio-dot" />}
              </div>
              <div className="radio-content">
                <div className="radio-label-row">
                  <span className="radio-name">{plan.name}</span>
                  <span className="radio-price">{plan.price}</span>
                </div>
                <div className="radio-desc">{plan.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="radio-section">
        <div className="radio-group-title">Billing Cycle</div>
        <div className="radio-group horizontal">
          {billing.map((opt) => (
            <div
              key={opt.id}
              className={`radio-option compact ${selectedBilling === opt.id ? 'selected' : ''}`}
              onClick={() => setSelectedBilling(opt.id)}
            >
              <div className={`radio-circle ${selectedBilling === opt.id ? 'checked' : ''}`}>
                {selectedBilling === opt.id && <div className="radio-dot" />}
              </div>
              <span className="radio-name">{opt.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
