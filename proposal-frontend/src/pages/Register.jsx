import React, { useState, useContext } from 'react';
import { Form, Button, Container, Alert, Card, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from "../authContext";
import RegistrationPlans from "../components/RegistrationPlans";

export default function Register() {
  const { setAuth } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    organization_name: '',
    plan: 'free' // Default to free plan
  });
  const [error, setError] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(true); // Show plan selection first
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (planId) => {
    setForm({ ...form, plan: planId });
    setShowPlanModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await axios.get('http://local.test:8000/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      const res = await axios.post('http://local.test:8000/api/register', form, {
        withCredentials: true,
      });

      localStorage.setItem('authToken', res.data.token);
      setAuth({ user: res.data.user, organization: res.data.organization });
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      // If paid plan was selected, redirect to payment
      if (form.plan !== 'free') {
        navigate('/payment', { state: { plan: form.plan } });
      } else {
        navigate('/');
      }

    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPlans = () => {
    setShowPlanModal(true);
  };

  if (showPlanModal) {
    return (
      <Container className="d-flex align-items-center justify-content-center min-vh-100">
        <RegistrationPlans onPlanSelect={handlePlanSelect} loading={loading} />
      </Container>
    );
  }

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Card className="shadow-lg p-4" style={{ width: '100%', maxWidth: '450px', borderRadius: '12px' }}>
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <Button variant="outline-secondary" size="sm" onClick={handleBackToPlans} className="me-2">
              ← Back
            </Button>
            <h3 className="mb-0 fw-bold">Complete Registration</h3>
          </div>
          
          <div className="plan-badge mb-3">
            <span className="badge bg-primary">
              {form.plan === 'free' ? 'Free Plan' : 
               form.plan === 'monthly' ? 'Monthly Pro' : 'Annual Pro'}
            </span>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formOrganization">
              <Form.Label>Organization Name</Form.Label>
              <Form.Control
                type="text"
                name="organization_name"
                value={form.organization_name}
                onChange={handleChange}
                placeholder="e.g., Smith Consulting, My Freelance Business"
              />
              <Form.Text className="text-muted">
                If left blank, we'll use "{form.name || 'Your Name'}'s Organization"
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPasswordConfirmation">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>
          </Form>

          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}