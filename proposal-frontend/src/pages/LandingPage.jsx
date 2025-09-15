// src/pages/LandingPage.jsx
import React from "react";
import { Container, Button, Row, Col, Card, Badge,  Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaRocket, FaMagic, FaCheckCircle, FaShieldAlt, FaClock, FaSignature } from "react-icons/fa";

export default function LandingPage() {
    
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">

    <Navbar bg="var(--color-primary)" variant="dark" expand="lg" className="shadow-sm py-3">
    <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-3 text-primary">
        <img
        src="/logo.png" // or your logo path
        height="40"
        className="d-inline-block align-top"
        alt="G8Pitch Logo"
    />
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

      {/* Hero Section */}
      <Container className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center py-3">
        <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">
          🚀 No Credit Card Required
        </Badge>
        <h1 className="fw-bold display-4 mb-3">
          Create <span className="text-primary">Professional Proposals</span> in Minutes
        </h1>
        <p className="lead text-muted mb-4 px-md-5">
          Stop wasting time on document formatting. G8Pitch helps freelancers, consultants, 
          and agencies create stunning proposals that win more deals – faster.
        </p>
        <div className="d-flex gap-3 flex-wrap justify-content-center">
          <Button as={Link} to="/register" variant="primary" size="lg" className="px-4">
            <FaRocket className="me-2" />
            Start Creating Free
          </Button>
          <Button as={Link} to="/login" variant="outline-primary" size="lg">
            Sign In
          </Button>
        </div>
        <small className="text-muted mt-3">Free plan includes 5 proposals per month</small>
      </Container>

      {/* Features Section */}
      <Container className="py-3">
        <h2 className="text-center mb-5 fw-bold">Why Choose G8Pitch?</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  <FaMagic />
                </div>
                <h5 className="fw-bold">Smart Templates</h5>
                <p className="text-muted">
                  Professionally designed templates that automatically adapt to your 
                  branding and client needs.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  <FaClock />
                </div>
                <h5 className="fw-bold">Save 80% Time</h5>
                <p className="text-muted">
                  Auto-filled client details, pre-built sections, and reusable 
                  content blocks cut proposal time dramatically.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  <FaSignature />
                </div>
                <h5 className="fw-bold">E-Signature Ready</h5>
                <p className="text-muted">
                  Clients can review, sign, and approve proposals digitally – 
                  no more printing or scanning needed.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Second Row of Features */}
        <Row className="g-4 mt-2">
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  <FaShieldAlt />
                </div>
                <h5 className="fw-bold">Secure & Private</h5>
                <p className="text-muted">
                  Bank-level security for your proposals and client data. 
                  Your information stays yours.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  <FaCheckCircle />
                </div>
                <h5 className="fw-bold">Higher Close Rates</h5>
                <p className="text-muted">
                  Professional proposals build trust and credibility, 
                  leading to more signed contracts.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className="text-primary mb-3" style={{ fontSize: '2.5rem' }}>
                  📊
                </div>
                <h5 className="fw-bold">Track Engagement</h5>
                <p className="text-muted">
                  See when clients view your proposals and which sections 
                  they spend the most time on.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CTA Section */}
      <Container className="py-5 mb-3 bg-white rounded-3 shadow-sm">
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <h2 className="fw-bold mb-3">Ready to Win More Business?</h2>
            <p className="text-muted mb-4">
              Join thousands of professionals who use G8Pitch to create proposals 
              that impress clients and close deals faster.
            </p>
            <Button as={Link} to="/register" variant="primary" size="lg" className="px-5">
              Create Your First Proposal
            </Button>
            <div className="mt-3">
              <small className="text-muted">
                ⚡ Set up in 2 minutes · Free forever plan available
              </small>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="mt-auto py-4 border-top bg-white">
        <Container className="text-center">
          <small className="text-muted">
            © {new Date().getFullYear()} G8Pitch · Built with ❤️ by{" "}
            <a href="https://g8brooks.com" target="_blank" rel="noreferrer" className="text-decoration-none">
              G8 Brooks
            </a>
          </small>
        </Container>
      </footer>
    </div>
  );
}