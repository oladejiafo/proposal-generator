// src/components/ProtectedRoute.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AuthContext } from '../authContext';
import api from '../api';

export default function ProtectedRoute({ children }) {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false); // Add this to prevent re-checks

  useEffect(() => {
    // If we've already checked, don't check again
    if (hasChecked) {
      return;
    }

    const checkAccess = async () => {
      if (!auth || !auth.user) {
        navigate('/login');
        return;
      }

      try {
        // Get fresh organization data
        const token = localStorage.getItem('authToken');
        const orgRes = await api.get('/current-organization', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          });
        const organization = orgRes.data;
        
        console.log('Organization subscription check:', organization.subscription_type, organization.subscription_status);
        
        // Mark that we've completed the check
        setHasChecked(true);
        
        if (organization.subscription_type === 'free') {
          // Free plan always has access - just continue
          setChecking(false);
        } else if (organization.subscription_status === 'active') {
          // Paid plan with active subscription - just continue
          setChecking(false);
        } else {
          // Paid plan without active subscription - redirect to payment
          navigate('/payment', {
            state: {
              plan: organization.subscription_type,
              organization: organization
            }
          }, { replace: true }); // Add replace: true to prevent history stack issues
        }
      } catch (error) {
        console.error('Access check failed:', error);
        setHasChecked(true); // Mark as checked even on error
        
        if (error.response?.status === 402) {
          navigate('/payment', { replace: true });
        } else {
          // For other errors, allow access
          setChecking(false);
        }
      }
    };

    checkAccess();
  }, [auth, navigate, hasChecked]); // Add hasChecked to dependencies

  if (!auth || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking access...</span>
        </div>
      </div>
    );
  }

  return children;
}