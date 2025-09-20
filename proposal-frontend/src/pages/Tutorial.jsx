import React from 'react';
import { Container, Card, Button, ListGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function Tutorial() {
    const navigate = useNavigate();
    const tutorialSteps = [
        {
            title: 'Welcome to G8 Pitch',
            description: 'Create professional proposals in minutes',
            icon: '🚀',
        },
        {
            title: 'Create Proposals',
            description: 'Use templates or start from scratch',
            icon: '📝',
        },
        {
            title: 'Manage Clients',
            description: 'Keep track of all your client information',
            icon: '👥',
        },
        {
            title: 'Track Analytics',
            description: 'Monitor proposal views and acceptances',
            icon: '📊',
        },
    ];

    const youtubeVideos = [
        {
            title: 'Getting Started with G8Pitch',
            url: 'https://www.youtube.com/watch?v=xxxxxxx1',
        },
        {
            title: 'How to Create Proposals',
            url: 'https://www.youtube.com/watch?v=xxxxxxx2',
        },
        {
            title: 'Managing Clients in G8Pitch',
            url: 'https://www.youtube.com/watch?v=xxxxxxx3',
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
                    <h2>Getting Started</h2>
                </Card.Header>
                <Card.Body>
                    <p className="text-muted">Learn how to use G8 Pitch effectively</p>

                    <ListGroup variant="flush">
                        {tutorialSteps.map((step, index) => (
                            <ListGroup.Item key={index} className="d-flex align-items-center">
                                <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{step.icon}</span>
                                <div>
                                    <h6 className="mb-1">{step.title}</h6>
                                    <p className="text-muted mb-0">{step.description}</p>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>
                    <h4>Video Tutorials</h4>
                </Card.Header>
                <Card.Body>
                    <ListGroup variant="flush">
                        {youtubeVideos.map((video, index) => (
                            <ListGroup.Item
                                key={index}
                                action
                                onClick={() => window.open(video.url, '_blank')}
                                className="d-flex justify-content-between align-items-center"
                            >
                                <span>🎥 {video.title}</span>
                                <span>↗</span>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Header>
                    <h4>Documentation</h4>
                </Card.Header>
                <Card.Body>
                    <Button
                        variant="outline-primary"
                        onClick={() => window.open('https://docs.g8pitch.com', '_blank')}
                    >
                        📚 Read comprehensive guides
                    </Button>
                </Card.Body>
            </Card>

            <Button
                variant="primary"
                onClick={() => window.open('https://wa.me/971585377802?text=Hello%20G8Pitch%20Support,%20I%20need%20assistance.', '_blank')}
                className="w-100"
            >
                Contact Support
            </Button>
        </Container>
    );
}