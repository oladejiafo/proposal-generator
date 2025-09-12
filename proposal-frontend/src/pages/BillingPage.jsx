// src/pages/BillingPage.jsx
import React, { useEffect, useState } from 'react';

export default function BillingPage() {
    const [organization, setOrganization] = useState(null);
  
    useEffect(() => {
      fetch('/api/organization', { credentials: 'include' })
        .then(res => res.json())
        .then(data => setOrganization(data));
    }, []);
  
    return (
      <div>
        <h1>Billing & Subscription</h1>
        {!organization?.subscription_active ? (
          <SubscribeButton orgId={organization.id} />
        ) : (
          <p>✅ Active subscription</p>
        )}
      </div>
    );
  }
  