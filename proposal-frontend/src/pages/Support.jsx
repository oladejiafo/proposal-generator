import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Support() {
    const navigate = useNavigate();
    const contactMethods = [
        {
            title: 'Email Support',
            description: 'Get help via email: support@g8pitch.com',
            icon: '✉️',
            action: () => window.location.href = 'mailto:support@g8pitch.com',
        },
        {
            title: 'Live Chat',
            description: 'Chat with our support team',
            icon: '💬',
            action: () => window.open('https://wa.me/971585377802?text=Hello%20G8Pitch%20Support,%20I%20need%20assistance.', '_blank'),
        },
    ];

    return (
        <Container className="my-4">
            <Card className="mb-4">
                <Card.Header>
                    <Button
                        variant="primary"
                        className="p-1 me-3 mb-1"
                        onClick={() => navigate('/settings')}
                    >
                        &lt; Back to Settings
                    </Button>
                    <h2>Get Help & Support</h2>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">We're here to help you succeed</p>

                    <Row>
                        {contactMethods.map((method, index) => (
                            <Col md={6} key={index} className="mb-3">
                                <Card>
                                    <Card.Body className="text-center">
                                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{method.icon}</div>
                                        <h5>{method.title}</h5>
                                        <p className="text-muted">{method.description}</p>
                                        <Button variant="primary" onClick={method.action}>
                                            Contact Support
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            <Button
                variant="outline-primary"
                onClick={() => window.open('https://g8pitch.com/contact', '_blank')}
                className="w-100"
            >
                Visit Support Website
            </Button>
        </Container>
    );
}