import React from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Share() {
    const navigate = useNavigate();
    const shareOptions = [
        {
            title: 'Share via Email',
            icon: '✉️',
            color: 'primary',
            action: () => {
                window.location.href = 'mailto:?subject=Check out G8 Pitch&body=I recommend G8 Pitch for creating professional proposals, it is AI-powered. Check it out: https://g8pitch.g8brooks.com';
            },
        },
        {
            title: 'Share via WhatsApp',
            icon: '💬',
            color: 'success',
            action: () => {
                const message = encodeURIComponent(
                    'Check out G8 Pitch - the AI-powered proposal software! https://g8pitch.g8brooks.com'
                );
                window.open(`https://wa.me/?text=${message}`, '_blank');
            },
        },
        {
            title: 'Copy Link',
            icon: '🔗',
            color: 'info',
            action: () => {
                navigator.clipboard.writeText('https://g8pitch.g8brooks.com');
                alert('Link copied to clipboard!');
            },
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
                    <h2>Share G8 Pitch</h2>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">
                        Share G8 Pitch with friends - help them create better proposals!
                    </p>

                    <Row>
                        {shareOptions.map((option, index) => (
                            <Col md={4} key={index} className="mb-3">
                                <Button 
                                    variant={option.color} 
                                    onClick={option.action}
                                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center py-3"
                                >
                                    <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{option.icon}</span>
                                    <span>{option.title}</span>
                                </Button>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>

            {/* <Alert variant="info">
                <Alert.Heading>Referral Program</Alert.Heading>
                <p>
                    Earn credits for every friend who signs up using your referral link!
                </p>
                <p className="mb-0">
                    <strong>Your referrals: 0 • Earned: $0.00</strong>
                </p>
            </Alert> */}
        </Container>
    );
}