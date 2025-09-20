// src/pages/LandingPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Row, Col, Card, Badge, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaRocket, FaMagic, FaCheckCircle, FaShieldAlt, FaClock, FaSignature } from "react-icons/fa";

import slide1 from '../assets/slide_1.png';
import slide2 from '../assets/slide_2.png';
import slide3 from '../assets/slide_3.png';
import slide4 from '../assets/slide_4.png';
import slide5 from '../assets/slide_5.png';
import slide6 from '../assets/slide_6.png';

export default function LandingPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);

    // Feature data with image references
    const features = [
        { id: '1', image: slide1 },
        { id: '2', image: slide2 },
        { id: '3', image: slide3 },
        { id: '4', image: slide4 },
        { id: '5', image: slide5 },
        { id: '6', image: slide6 },
    ];

    // Auto-scroll functionality
    useEffect(() => {
        startAutoScroll();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const startAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            const nextIndex = (currentIndex + 1) % features.length;
            setCurrentIndex(nextIndex);
        }, 4000); // Change slide every 4 seconds
    };

    const handleDotClick = (index) => {
        setCurrentIndex(index);
        startAutoScroll(); // Restart timer on manual interaction
    };

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
            <Container className="py-4">
                {/* <h2 className="text-center mb-4 fw-bold">Why Choose G8Pitch?</h2> */}

                <div className="position-relative">
                    {/* Slider */}
                    <div
                        className="d-flex overflow-hidden rounded-3 shadow-sm mb-4"
                        style={{ height: '400px' }}
                    >
                        {features.map((feature, index) => (
                            <div
                                key={feature.id}
                                className="flex-shrink-0 w-100 h-100 transition-all"
                                style={{
                                    transform: `translateX(-${currentIndex * 100}%)`,
                                    transition: 'transform 0.5s ease-in-out'
                                }}
                            >
                                <img
                                    src={feature.image}
                                    alt={`Feature ${index + 1}`}
                                    className="w-100 h-100 object-fit-contain"
                                    
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dots indicator */}
                    <div className="d-flex justify-content-center gap-2">
                        {features.map((_, index) => (
                            <button
                                key={index}
                                className={`btn p-0 rounded-circle ${index === currentIndex ? 'bg-primary' : 'bg-secondary'
                                    }`}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    border: 'none'
                                }}
                                onClick={() => handleDotClick(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Navigation arrows */}
                    <button
                        className="position-absolute top-50 start-0 translate-middle-y btn rounded-circle shadow-sm"
                        style={{ width: '40px', height: '40px', borderColor: 'transparent' }}
                        onClick={() => {
                            const prevIndex = (currentIndex - 1 + features.length) % features.length;
                            setCurrentIndex(prevIndex);
                            startAutoScroll();
                        }}
                    >
                        ‹
                    </button>
                    <button
                        className="position-absolute top-50 end-0 translate-middle-y btn  rounded-circle shadow-sm"
                        style={{ width: '40px', height: '40px', borderColor: 'transparent' }}
                        onClick={() => {
                            const nextIndex = (currentIndex + 1) % features.length;
                            setCurrentIndex(nextIndex);
                            startAutoScroll();
                        }}
                    >
                        ›
                    </button>
                </div>
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
            <footer className="mt-auto py-4 border-top ">
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