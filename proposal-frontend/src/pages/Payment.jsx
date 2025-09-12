import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PayForProposalButton from '../components/PayForProposalButton';
import { Container, Card, Button } from 'react-bootstrap';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { plan } = location.state || {};
  
    console.log('Payment component rendered');
    console.log('Location state:', location.state);
    console.log('Plan:', plan);
  
    useEffect(() => {
      console.log('useEffect running, plan:', plan);
      if (!plan) {
        console.log('No plan found, navigating to /');
        navigate('/');
      }
    }, [plan, navigate]);
  
    if (!plan) {
      console.log('No plan, returning null');
      return null;
    }

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow">
            <Card.Body className="text-center p-5">
              <h2>Update Your Subscription</h2>
              <p className="text-muted mb-4">
                You're currently on the{" "}
                {plan === "free"
                    ? "Free"
                    : plan === "monthly"
                    ? "Monthly Pro"
                    : plan === "annual"
                    ? "Annual Pro"
                    : plan}{" "}
                plan
              </p>

              <div className="my-4">
                <p className="mb-2">Continue to</p>
                <PayForProposalButton subscription={true} plan={plan} />
              </div>
              
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/')}
              >
                Maybe Later
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}