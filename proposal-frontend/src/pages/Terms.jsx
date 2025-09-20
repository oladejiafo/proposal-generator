import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
    const navigate = useNavigate();
    return (
        <Container className="my-4">
            <Card>
                <Card.Header>
                    <Button
                        variant="primary"
                        className="p-1 me-3 mb-1"
                        onClick={() => navigate('/settings')}
                    >
                        &lt; Back to Settings
                    </Button>
                    <h2>Terms of Service</h2>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">Last Updated: {new Date().toLocaleDateString()}</p>

                    <h4>1. Acceptance of Terms</h4>
                    <p>
                        By accessing or using our application, you agree to be bound by these Terms of Service.
                    </p>

                    <h4>2. User Accounts</h4>
                    <p>
                        You are responsible for maintaining the confidentiality of your account and password.
                    </p>

                    <h4>3. Prohibited Activities</h4>
                    <p>
                        You may not use our service for any illegal purpose or to violate any laws in your jurisdiction.
                    </p>

                    <h4>4. Intellectual Property</h4>
                    <p>
                        The application and its original content, features, and functionality are owned by us.
                    </p>

                    <h4>5. Termination</h4>
                    <p>
                        We may terminate or suspend your account immediately for any reason.
                    </p>

                    <p className="mt-4 text-muted">
                        For questions about these Terms, please contact us at support@g8pitch.com
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
}