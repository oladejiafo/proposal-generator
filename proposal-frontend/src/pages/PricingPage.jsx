import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Badge, Navbar, Nav, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaCheck, FaStar, FaCrown, FaRocket } from "react-icons/fa";

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
    recommended: false,
    icon: FaRocket,
    buttonVariant: 'outline-primary'
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
    recommended: true,
    icon: FaStar,
    buttonVariant: 'primary'
  },
  {
    id: 'annual',
    name: 'Annual Pro',
    price: '$88.80',
    interval: 'per year',
    features: [
      'Everything in Monthly Pro',
      '20% savings compared to monthly',
      'Early access to new features',
      'Dedicated account manager'
    ],
    popular: false,
    recommended: false,
    icon: FaCrown,
    buttonVariant: 'success'
  }
];

export default function PricingPage({ onPlanSelect, loading }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('free');
  
    // purely for visual highlight
    const handleCardClick = (planId) => {
      if (loading) return;
      setSelectedPlan(planId);
    };
  
    // button click: send plan to parent & continue
    const handleContinue = (planId) => {
      if (loading) return;
      onPlanSelect(planId);  // send directly
    };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const message = e.target.message.value;

    // Encode message safely
    const body = `Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0AMessage: ${encodeURIComponent(message)}`;

    // Email link
    const mailtoLink = `mailto:support@g8brooks.com?subject=Support Request from ${encodeURIComponent(name)}&body=${body}`;
    
    // WhatsApp link (replace number with yours, include country code)
    const whatsappLink = `https://wa.me/971585377802?text=${body}`;

    // Show a choice to user
    if (window.confirm("Send via Email? Cancel for WhatsApp.")) {
      window.location.href = mailtoLink;
    } else {
      window.open(whatsappLink, "_blank");
    }

    setShowModal(false);
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Navbar */}
      <Navbar bg="var(--color-primary)" variant="dark" expand="lg" className="shadow-sm py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
            <img src="/logo.png" height="40" className="d-inline-block align-top" alt="G8Pitch Logo" />
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav className="align-items-center">
              <Nav.Link as={Link} to="/pricing" className="me-2">Pricing</Nav.Link>
              <Nav.Link as={Link} to="/login" className="me-2">Sign In</Nav.Link>
              <Button as={Link} to="/register" variant="primary" className="rounded-pill">
                Get Started Free
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {/* Header */}
        <Row className="text-center my-5">
          <Col lg={8} className="mx-auto">
            <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">💰 Transparent Pricing</Badge>
            <h1 className="fw-bold display-4 mb-3">Simple, Honest <span className="text-primary">Pricing</span></h1>
            <p className="lead text-muted">Choose the plan that works for you. Start free and upgrade anytime. No hidden fees, no surprises.</p>
          </Col>
        </Row>

        {/* Pricing Cards */}
        <Row className="g-4 justify-content-center">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <Col key={plan.id} lg={4} md={6}>
                {/* <Card className="h-100 shadow-sm border-0 position-relative d-flex flex-column"> */}
                <Card 
                key={plan.id}
                className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.recommended ? 'recommended' : ''}`}
                onClick={() => handleCardClick(plan.id)} 
                >
                  {plan.popular && (
                    <div
                      className="position-absolute top-0 start-50 translate-middle-x text-white px-3 py-1 rounded-pill"
                      style={{ backgroundColor: '#0d6efd', fontWeight: 'bold', zIndex: 1 }}
                    >
                      MOST POPULAR
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column mt-4">
                    <div className="text-center mb-4">
                      <PlanIcon className="text-primary mb-3" size={48} />
                      <h4 className="fw-bold">{plan.name}</h4>
                      <div className="price-display">
                        <span className="display-4 fw-bold text-primary">{plan.price}</span>
                        <span className="text-muted">/{plan.interval}</span>
                      </div>
                      {plan.id === 'annual' && <Badge bg="success" className="mt-2">Save 20%</Badge>}
                    </div>
                    <ul className="list-unstyled mb-4 flex-grow-1"  style={{ textAlign: 'left' }}>
                      {plan.features.map((feature, index) => (
                        <li key={index} className="mb-2">
                          <FaCheck className="text-success me-2" />
                          <small>{feature}</small>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                  as={Link}
                  to="/register"
                  variant={plan.buttonVariant}
                  onClick={() => handleContinue(plan.id)} // single click
                  disabled={loading}
                  size="lg"
                  className="w-100 mt-auto rounded-pill"
                  state={{ selectedPlan: plan.id }}
                >
                  {plan.id === 'free' ? 'Get Started Free' : 'Choose Plan'}
                </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Bottom CTA */}
        <Row className="my-4">
          <Col lg={8} className="mx-auto text-center">
            <Card className="border-0 bg-primary text-white">
              <Card.Body className="p-2">
                <h4 className="fw-bold mb-3">Still have questions?</h4>
                <p className="mb-4">Our team is here to help you choose the right plan for your business needs.</p>
                <Button variant="light" size="lg" className="rounded-pill" onClick={() => setShowModal(true)}>Contact Support</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="mt-auto py-4 border-top">
        <Container className="text-center">
        <small className="text-muted">
            © {new Date().getFullYear()} G8Pitch · Built with ❤️ by{" "}
            <a href="https://g8brooks.com" target="_blank" rel="noreferrer" className="text-decoration-none">
            G8 Brooks
            </a>
        </small>
        </Container>
      </footer>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Contact Support</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" placeholder="Your Name" name="name" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" placeholder="you@example.com" name="email" required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="Your message..." name="message" required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 rounded-pill">Send</Button>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
}
