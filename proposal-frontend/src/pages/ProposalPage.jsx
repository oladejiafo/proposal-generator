import React, { useEffect, useState } from 'react';
import PayForProposalButton from '../components/PayForProposalButton';

export default function ProposalPage({ proposalId }) {
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    async function fetchProposal() {
      const res = await fetch(`/api/proposals/${proposalId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProposal(data);
      }
    }
    fetchProposal();
  }, [proposalId]);

  if (!proposal) return <div>Loading...</div>;

  return (
    <div>
      <h1>Proposal #{proposal.id}</h1>
      <p>Amount: ${proposal.amount}</p>
      {proposal.status !== 'paid' && (
        <PayForProposalButton proposalId={proposal.id} />
      )}
      {proposal.status === 'paid' && <p>✅ Paid</p>}
    </div>
  );
}
