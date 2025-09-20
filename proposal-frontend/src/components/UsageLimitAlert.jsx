import React, { useState, useEffect } from 'react';
import { Alert, Button, ProgressBar, Card, Spinner, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// export default function UsageLimitAlert({ organization, showDetails = false }) {
export default function UsageLimitAlert({ 
    organization, 
    showDetails = false, 
    showOnlyWhenLimitReached = false,
    limitType = 'proposals' // Default to proposals, but can be 'clients' or 'templates'
    }) {
  const navigate = useNavigate();
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization && organization.subscription_type === 'free') {
      fetchUsageStats();
    } else {
      setLoading(false);
    }
  }, [organization]);

  const fetchUsageStats = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/usage/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });

    //   const res = await api.get('/usage/stats');
      setUsageStats(res.data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!organization || organization.subscription_type !== 'free') {
    return null;
  }

  if (loading) {
    return (
      <Alert variant="info" className="mb-3">
        <Spinner animation="border" size="sm" className="me-2" />
        Loading usage statistics...
      </Alert>
    );
  }

  if (!usageStats) {
    return null;
  }

  const { proposals, templates, clients } = usageStats;
  const isNearLimit = proposals.percentage >= 80;
  const isAtLimit = proposals.percentage >= 100;

  const handleUpgrade = () => {
    navigate('/payment', {
      state: {
        plan: 'monthly',
        organization: organization
      }
    });
  };

  if (showOnlyWhenLimitReached && !isAtLimit) {
    // return null;
    console.log(showOnlyWhenLimitReached)
  }
  // Modify the compact view to show the specified limit type
  if (!showDetails && !isAtLimit) {
    const currentLimit = usageStats[limitType];

    return (
        <Alert variant="info" className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
            <span className="small">
            📊 {currentLimit.used}/{currentLimit.limit} {limitType} used for free plan
            </span>
            <ProgressBar 
            now={currentLimit.percentage} 
            variant="accent" 
            style={{width: '100px', height: '8px'}} 
            />
        </div>
        </Alert>
    );
  }

  if (isAtLimit) {
    return (
      <Container>
        <Alert variant="danger" className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
            <div>
                <h6 className="alert-heading mb-1">🚫 Proposal Limit Reached</h6>
                <p className="mb-0">You've used all {proposals.limit} free proposals this month.</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleUpgrade}>
                Upgrade Now
            </Button>
            </div>
        </Alert>
      </Container>
    );
  }

  if (showDetails) {
    return (
        <Container className="my-4">
        <Card className="mb-3">
            <Card.Header className="bg-light py-2">
            <h6 className="mb-0">📊 Free Plan Usage</h6>
            </Card.Header>
            <Card.Body className="py-3">
            {/* Proposals */}
            <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                <span className="small">Proposals: {proposals.used}/{proposals.limit}</span>
                <span className={`small ${isNearLimit ? 'text-warning' : 'text-muted'}`}>
                    {proposals.remaining} remaining
                </span>
                </div>
                <ProgressBar 
                now={proposals.percentage} 
                variant={isNearLimit ? 'warning' : 'primary'}
                className="mb-2"
                />
            </div>

            {/* Templates */}
            <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                <span className="small">Templates: {templates.used}/{templates.limit}</span>
                <span className="small text-muted">{templates.remaining} remaining</span>
                </div>
                <ProgressBar 
                now={(templates.used / templates.limit) * 100} 
                variant="accent"
                className="mb-2"
                />
            </div>

            {/* Clients */}
            <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                <span className="small">Clients: {clients.used}/{clients.limit}</span>
                <span className="small text-muted">{clients.remaining} remaining</span>
                </div>
                <ProgressBar 
                now={(clients.used / clients.limit) * 100} 
                variant="secondary"
                />
            </div>

            {isNearLimit && (
                <Button variant="outline-primary" size="sm" className="mt-2" onClick={handleUpgrade}>
                Upgrade for Unlimited
                </Button>
            )}
            </Card.Body>
        </Card>
      </Container>
    );
  }

  if (isNearLimit) {
    return (
      <Container>
        <Alert variant="warning" className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
            <div>
                <h6 className="alert-heading mb-1">⚠️ Approaching Limit</h6>
                <p className="mb-0">
                {proposals.used} of {proposals.limit} proposals used ({proposals.remaining} remaining)
                </p>
            </div>
            <Button variant="outline-primary" size="sm" onClick={handleUpgrade}>
                Upgrade
            </Button>
            </div>
            <ProgressBar now={proposals.percentage} variant="warning" className="mt-2" />
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
        <Alert variant="info" className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
            <span className="small">
            📊 {proposals.used}/{proposals.limit} proposals used this month
            </span>
            <ProgressBar now={proposals.percentage} variant="success" style={{width: '100px', height: '8px'}} />
        </div>
        </Alert>
    </Container>
  );
}