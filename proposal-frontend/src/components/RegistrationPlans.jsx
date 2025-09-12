import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
// import axios from 'axios';
import './RegistrationPlans.css';

const plans = [
  {
    id: 'free',
    name: 'Free Forever',
    price: '$0',
    interval: 'forever',
    features: [
      'Create up to 5 proposals per month',
      'Add up to 5 clients per month',
      'Use up to 3 templates (lifetime limit)',
      'Basic features access',
      'Community support'
    ],
    popular: false,
    recommended: false
  },
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$8.88',
    interval: 'per month',
    features: [
      'Unlimited proposals',
      'Unlimited clients',
      'Unlimited templates',
      'Access to premium templates',
      'Team collaboration',
      'Custom branding (colors, styles)',
      'Priority support',
      'Advanced analytics'
    ],
    popular: true,
    recommended: true
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    price: '$88.80',
    interval: 'per year',
    features: [
      'Unlimited proposals',
      'Unlimited clients',
      'Unlimited templates',
      'Access to premium templates',
      'Team collaboration',
      'Custom branding (colors, styles)',
      'Priority support',
      'Advanced analytics',
      '20% savings compared to monthly'
    ],
    popular: false,
    recommended: false
  }
];

export default function RegistrationPlans({ onPlanSelect, loading }) {
  const [selectedPlan, setSelectedPlan] = useState('free');

  const handlePlanSelect = (planId) => {
    if (loading) return;
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    onPlanSelect(selectedPlan);
  };

  return (
    <div className="registration-plans-container">
      <div className="plans-header text-center mb-5">
        <h2>Choose Your Plan</h2>
        <p className="text-muted">Start with a free plan and upgrade anytime</p>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <Card 
            key={plan.id}
            className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.recommended ? 'recommended' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.recommended && (
              <div className="recommended-badge">Recommended</div>
            )}
            
            <Card.Body>
              <h4 className="plan-name">{plan.name}</h4>
              <div className="price-section">
                <span className="price">{plan.price}</span>
                <span className="interval">/{plan.interval}</span>
              </div>
              
              <ul className="features-list">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="text-center mt-4">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleContinue}
          disabled={loading}
          className="continue-btn"
        >
          {loading ? 'Creating Account...' : 'Continue to Registration'}
        </Button>
        <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
      </div>
    </div>
  );
}