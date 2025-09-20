import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { API_BASE } from "../api"; //${API_BASE}
import './PricingPlans.css'; // We'll create this CSS file

const stripePromise = loadStripe('pk_test_51S5MD4AWSxFynBRlniaMRWSYM8ubQImysnl0BDloWYJkde5ncdzIYVecKSZbIbZwASYIWi5lwF3AnpgBs7tHh3LN00nTzwfMjC');

const pricingPlans = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$8.88',
    interval: 'per month',
    stripePriceId: 'price_1S5MWhAWSxFynBRlSYce3MU3',
    popular: true,
    savings: ''
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    price: '$88.80',
    interval: 'per year',
    stripePriceId: 'price_1S5MZJAWSxFynBRlCM7lP8Qu', // Make sure this is your actual annual price ID
    popular: false,
    savings: 'Save 20%'
  }
];

export default function PayForProposalButton({ proposalId, subscription }) {
  const [showPlanSelection, setShowPlanSelection] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(pricingPlans[0].id);
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: `${API_BASE}`,
    withCredentials: true,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    },
  });

  async function handleSubscription(planId) {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const plan = pricingPlans.find(p => p.id === planId);
      
      if (!plan?.stripePriceId) {
        console.error("No Stripe price ID found for plan:", planId);
        return;
      }
  
      const res = await api.post('/organization/subscribe', {
        priceId: plan.stripePriceId  // ← This stays the same!
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const checkoutUrl = res.data.url;
      window.location.href = checkoutUrl;
      
    } catch (error) {
      console.error("Subscription error:", error.response?.data || error.message);
      alert('Error starting subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleOneTimePayment() {
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.post(`/payments/checkout/${proposalId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { id: sessionId } = res.data;

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Checkout error:", error.response?.data || error.message);
    }
  }

  async function handleClick() {
    if (!subscription) {
      await handleOneTimePayment();
      return;
    }
    setShowPlanSelection(true);
  }

  const handlePlanSelect = (planId) => {
    if (loading) return;
    setSelectedPlan(planId);
  };

  const handleSubscribe = () => {
    handleSubscription(selectedPlan);
  };

  const handleClosePlanSelection = () => {
    setShowPlanSelection(false);
  };

  if (showPlanSelection) {
    return (
      <div className="plan-selection-overlay">
        <div className="plan-selection-modal">
          <div className="modal-header">
            <h2>Choose Your Plan</h2>
            <p>Select the subscription that works best for you</p>
            <button onClick={handleClosePlanSelection} className="close-btn">×</button>
          </div>
          
          <div className="plans-grid">
            {pricingPlans.map(plan => (
              <div 
                key={plan.id} 
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                {plan.savings && <div className="savings-badge">{plan.savings}</div>}
                
                <h3>{plan.name}</h3>
                <div className="price-container">
                  <span className="price">{plan.price}</span>
                  <span className="interval">{plan.interval}</span>
                </div>
                
                <ul className="features">
                  <li>✓ Unlimited proposals</li>
                  <li>✓ Unlimited clients</li>
                  <li>✓ Unlimited templates</li>
                  <li>✓ Access to premium templates</li>
                  <li>✓ Team collaboration</li>
                  <li>✓ Custom branding (colors, styles)</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced analytics</li>
                </ul>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button 
              onClick={handleSubscribe} 
              disabled={loading}
              className="subscribe-btn"
            >
              {loading ? 'Processing...' : `Subscribe to ${pricingPlans.find(p => p.id === selectedPlan)?.name}`}
            </button>
            
            <button 
              onClick={handleClosePlanSelection}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button className="btn btn-warning" onClick={handleClick} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}