import React, { useEffect, useState, useContext } from 'react';
import { Container, Button,Alert } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import PayForProposalButton from '../components/PayForProposalButton';
import { AuthContext } from '../authContext';
import api from '../api';
import { Navigate, useNavigate } from 'react-router-dom';
import UsageLimitAlert from '../components/UsageLimitAlert';

export default function DashboardLayout() {
  const { auth,logout } = useContext(AuthContext); // Remove setAuth from here
  const [organization, setOrganization] = useState(auth?.organization || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [usageStats, setUsageStats] = useState(null);

  useEffect(() => {
    if (organization && organization.subscription_type === 'free') {
      fetchUsageStats();
    }
  }, [organization]);

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get('/usage/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsageStats(res.data);
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    }
  };

  useEffect(() => {
    // Only fetch if we don't already have organization data
    if (auth && auth.user && !organization) {
      async function fetchOrganization() {
        try {
          setLoading(true);
          const token = localStorage.getItem('authToken');
          const res = await api.get('/current-organization', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });

          setOrganization(res.data);
        } catch (err) {
          console.error('Failed to fetch organization:', err);
          setError('Failed to load organization data');
        } finally {
          setLoading(false);
        }
      }

      fetchOrganization();
    }
  }, [auth, organization]);

  if (!auth || !auth.user) {
    return (
      <Container className="my-5">
        <Alert variant="danger">Not authenticated. Redirecting to login...</Alert>
      </Container>
    );
  }

  if (loading) {
    return (
        <Container className="d-flex justify-content-center align-items-center vh-50">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Container>
    );
  }

  return (
    <>
      <NavigationBar user={auth.user} onLogout={logout} />
      <Container className="my-3">
        <h1>Hi, {auth.user.name}</h1>
        
        {/* Add the usage alert component */}
        {/* {organization && <UsageLimitAlert organization={organization} showDetails={true} />} */}
        {organization && organization.subscription_type === 'free' && usageStats && usageStats.proposals.percentage >= 100 && (
          <UsageLimitAlert organization={organization} showDetails={true} />
        )}
        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}
      </Container>
      
      <Container>
        <Outlet />

        <Container>
          {/* SUBSCRIPTION STATUS */}
          {organization && organization.subscription_status !== 'active' && organization.subscription_type !== 'free' && (
            <Alert variant="warning" className="d-flex flex-column align-items-start mt-4">
              <p className="mb-2">
                ⚠️ Your {organization.subscription_type} subscription is inactive. 
                Pay now to unlock full access.
              </p>
              <PayForProposalButton 
                subscription={true} 
                plan={organization.subscription_type} 
              />
            </Alert>
          )}

          {organization && organization.subscription_status === 'active' && (
            <Alert variant="success" className="mt-4">
              ✅ Your {organization.subscription_type} subscription is active
            </Alert>
          )}

          {organization && organization.subscription_type === 'free' && (
            <Alert variant="info" className="d-flex flex-column align-items-start mt-4">
              <p className="mb-2">
                ℹ️ You're on the Free plan. Upgrade for more features.
              </p>
              <Button 
                className="mt-1" 
                onClick={() => navigate('/payment', { 
                  state: { 
                    plan: organization.subscription_type,
                    organization: organization 
                  }
                })}
              >
                Upgrade Now
              </Button>
            </Alert>
          )}
        </Container>
      </Container>

      <footer className="mt-5 py-4 border-top">
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            {/* Logo and Brand Text */}
            <div className="d-flex align-items-center mb-3 mb-md-0">
              <img 
                src="/logo3.png" 
                alt="G8Pitch Proposal Generator Logo" 
                height="40"
                className="me-2"
                style={{
                  filter: "drop-shadow(0 0 0.1px white) drop-shadow(0 0 0.1px white)", 
                  borderRadius: "8px" 
                }}
              />
              <div className="text-center text-md-start">
                <small className="text-muted d-block d-md-inline">
                  <strong>G8Pitch</strong> - A Proposal Generator. Powered by{" "}
                  <span className="text-primary">
                    <a href="https://g8brooks.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                      G8 Brooks
                    </a>
                  </span>
                </small>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center text-md-end">
              <small className="text-muted">
                © {new Date().getFullYear()}{" "}
                <a href="https://g8brooks.com" target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                  G8 Brooks
                </a>
              </small>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}