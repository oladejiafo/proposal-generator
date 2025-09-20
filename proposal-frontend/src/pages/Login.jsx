import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { API_BASE,SANCTUM_BASE } from "../api"; //${API_BASE}
import axios from 'axios';
import { AuthContext } from "../authContext";

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
  
    try {
      await axios.get(`${SANCTUM_BASE}/sanctum/csrf-cookie`, { withCredentials: true });
      const res = await api.post('/login', { email, password });
      
      // Check if we got a proper response
      if (!res.data || !res.data.token) {
        throw new Error('Invalid response from server');
      }
  
      const token = res.data.token;
      const user = res.data.user;
      const organization = res.data.organization;
  
      if (!user || !organization) {
        throw new Error('Missing user or organization data');
      }
  
      localStorage.setItem('authToken', token);
      setAuth({ user, organization });
      
      // Check if payment is required - handle different response structures
      const requiresPayment = res.data.requires_payment || 
                             (organization.subscription_type !== 'free' && 
                              organization.subscription_status !== 'active');
  
      console.log('requiresPayment:', requiresPayment, 'org:', organization);
      
      if (requiresPayment) {
        navigate('/payment', { 
          state: { 
            plan: organization.subscription_type,
            organization: organization
          }
        });
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // More specific error messages
      if (error.response?.status === 422) {
        setError('Invalid email or password format');
      } else if (error.response?.status === 401) {
        setError('Invalid credentials');
      } else if (error.message.includes('Invalid response')) {
        setError('Server returned invalid response');
      } else {
        setError(error.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      fluid 
      className="d-flex align-items-center justify-content-center vh-100 bg-light"
    >
      <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Welcome Back</h2>
            <p className="text-muted">Please login to your account</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="you@example.com"
                style={{ borderRadius: '10px' }}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ borderRadius: '10px' }}
                disabled={loading}
              />
            </Form.Group>

            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </Form>

          <p className="text-center mt-3">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}