import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Spinner, Alert, Button } from 'react-bootstrap';

export default function ProposalView() {
  const { token } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProposal();
  }, []);

  async function fetchProposal() {
    try {
      const res = await fetch(`http://localhost:8000/api/proposal/view/${token}`);
      if (!res.ok) throw new Error('Proposal not found');
      const data = await res.json();
      setProposal(data);

      // Mark view after loading
      await fetch('http://localhost:8000/api/proposals/viewed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.view_token }),
      });

      // If already accepted
      if (data.status === 'accepted') setAccepted(true);

    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleAccept() {
    if (!proposal) return;
    setProcessing(true);

    try {
      // Optional: send signature if captured
      const bodyData = { token: proposal.view_token };
      if (signature) bodyData.signature = signature;

      const res = await fetch('http://localhost:8000/api/proposals/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) throw new Error('Failed to accept proposal');

      setAccepted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  }

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Container>
      <h2>{proposal.title}</h2>

      <div
        dangerouslySetInnerHTML={{ __html: proposal.content.replace(/\\n/g, '') }}
        style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}
      />

      {!accepted && (
        <>
          {/* Optional signature pad */}
          <SignaturePad onChange={setSignature} />

          <Button
            variant="success"
            onClick={handleAccept}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Accept Proposal'}
          </Button>
        </>
      )}

      {accepted && <Alert variant="success">Thank you! Proposal accepted.</Alert>}
    </Container>
  );
}

// SignaturePad component
function SignaturePad({ onChange }) {
  const canvasRef = React.useRef(null);
  const [drawing, setDrawing] = useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = e => {
    setDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setDrawing(false);
    onChange(canvasRef.current.toDataURL());
  };

  const draw = e => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    onChange('');
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        style={{ border: '1px solid #000', marginBottom: 8 }}
        onMouseDown={startDrawing}
        onMouseUp={endDrawing}
        onMouseMove={draw}
        onMouseLeave={endDrawing}
      />
      <Button variant="secondary" size="sm" onClick={clear}>
        Clear Signature
      </Button>
    </div>
  );
}
