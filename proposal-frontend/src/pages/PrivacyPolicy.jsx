import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
                    <h2>Privacy Policy</h2>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">Last Updated: {new Date().toLocaleDateString()}</p>

                    <h4>1. Information We Collect</h4>
                    <p>
                        We collect information you provide directly to us, such as when you create an account or update your profile.
                    </p>

                    <h4>2. How We Use Your Information</h4>
                    <p>
                        We use the information we collect to provide, maintain, and improve our services.
                    </p>

                    <h4>3. Information Sharing</h4>
                    <p>
                        We do not sell your personal information to third parties.
                    </p>

                    <h4>4. Data Security</h4>
                    <p>
                        We implement appropriate security measures to protect your personal information.
                    </p>

                    <h4>5. Your Rights</h4>
                    <p>
                        You may access, update, or delete your personal information through your account settings.
                    </p>

                    <p className="mt-4 text-muted">
                        For privacy-related questions, contact us at support@g8pitch.com
                    </p>
                </Card.Body>
            </Card>
        </Container>
    );
}