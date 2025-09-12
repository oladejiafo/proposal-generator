import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Alert, Container, Spinner,Dropdown, Form,Card  } from 'react-bootstrap';
import {
  fetchProposals,
  deleteProposal,
  generatePdf,
  api
} from '../api';

import ProposalForm from '../components/ProposalForm';
import UsageLimitAlert from '../components/UsageLimitAlert';

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [organization, setOrganization] = useState(null);

  // Load proposals on mount
  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    setLoading(true);
    setError('');
    try {

      const res = await fetchProposals();
      setProposals(res.data);
    } catch (err) {
      setError('Failed to load proposals');
      console.error(err);
    }
    setLoading(false);
  }

  function openAddForm() {
    setEditingProposal(null);
    setShowForm(true);
  }

  function openEditForm(proposal) {
    setEditingProposal(proposal);
    setShowForm(true);
  }

  async function handleDelete(proposal) {
    if (!window.confirm('Delete this proposal?')) return;
    try {
      await deleteProposal(proposal.id);
      setProposals(proposals.filter(p => p.id !== proposal.id));
    } catch (err) {
      alert('Failed to delete proposal');
      console.error(err);
    }
  }

  async function handlePdfDownload(proposal) {
    try {
      // generatePdf should return response with responseType: 'blob'
      const res = await generatePdf(proposal.id);
  
      // res.data is already a Blob
      const url = window.URL.createObjectURL(res.data);
  
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${proposal.title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      // Delay revoking the URL to ensure download starts properly
      setTimeout(() => window.URL.revokeObjectURL(url), 10000); // 10 seconds
    } catch (err) {
      alert('Failed to generate PDF');
      console.error(err);
    }
  }
  
  async function handlePdfPreview(proposal) {
    try {
      const res = await generatePdf(proposal.id);
      const url = window.URL.createObjectURL(res.data);
      setPdfUrl(url);
      setShowPdfModal(true);
    } catch (err) {
      alert('Failed to generate PDF');
      console.error(err);
    }
  }

  const filteredProposals = proposals.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(query) ||
      p.client?.name?.toLowerCase().includes(query) ||
      p.status?.toLowerCase().includes(query)
    );
  });
  
  // Add this useEffect to fetch organization data
  useEffect(() => {
    async function fetchOrganization() {
      try {
        const token = localStorage.getItem('authToken');
        const res = await api.get('/current-organization', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrganization(res.data);
      } catch (err) {
        console.error('Failed to fetch organization:', err);
      }
    }
    fetchOrganization();
  }, []);

  return (
    <Container className="my-4">
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold">Proposals</h2>
            <Button onClick={openAddForm} variant="primary">+ New Proposal</Button>

          </div>

          {/* ADD THIS LINE: Show usage alert only when template limit is reached */}
          {organization && (
            <UsageLimitAlert 
              organization={organization} 
              showDetails={false}
              showOnlyWhenLimitReached={true}
              limitType="proposals"
            />
          )}

          <p className="text-muted">
            Manage all your proposals here. Add, edit, or remove proposals easily.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && proposals.length > 0 && (
            <Form.Control
              type="text"
              placeholder="Search proposals..."
              className="mb-3"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          )}

          {filteredProposals.length === 0 && searchQuery && (
            <Alert variant="info">No proposals match your search.</Alert>
          )}

          {loading ? (
            <Spinner animation="border" />
          ) : proposals.length === 0 ? (
            <Alert variant="info">No proposals found. Create one!</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
               {filteredProposals.map(proposal => (
                // {proposals.map(proposal => (
                  <tr key={proposal.id}>
                    <td>{proposal.title}</td>
                    <td>{proposal.client?.name || 'N/A'}</td>
                    <td>{proposal.status}</td>
                    <td>
                    <div className="d-none d-md-block">
                      <Button size="sm" variant="secondary" onClick={() => openEditForm(proposal)}>Edit</Button>{' '}
                      <Button size="sm" variant="danger" onClick={() => handleDelete(proposal)}>Delete</Button>{' '}
                      <Button size="sm" variant="info" onClick={() => handlePdfDownload(proposal)}>PDF</Button>{' '}
                      <Button size="sm" variant="primary" onClick={() => handlePdfPreview(proposal)}>Preview</Button>{' '}
                      <Button
                        size="sm"
                        variant="success"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('authToken'); // grab the logged-in user token
                            const orgId = localStorage.getItem('currentOrganizationId');
                            if (!token) throw new Error('No auth token found');

                            const res = await fetch(
                              `http://localhost:8000/api/proposals/${proposal.id}/send`,
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`, // important!
                                  'X-Organization-ID': orgId || '',
                                },
                              }
                            );

                            if (!res.ok) throw new Error('Failed to send proposal');

                            alert('Proposal link sent to client!');
                          } catch (err) {
                            alert(err.message);
                            console.error(err);
                          }
                        }}
                      >
                        Email to Client
                      </Button>
                      </div>
                      <div className="d-md-none">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" id="mobile-actions">
                            <i className="fas fa-ellipsis-h">Select</i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditForm(proposal)}>Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => handlePdfPreview(proposal)}>Preview</Dropdown.Item>
                            <Dropdown.Item onClick={() => handlePdfDownload(proposal)}>Download PDF</Dropdown.Item>
                            <Dropdown.Item onClick={async () => {
                              try {
                                const token = localStorage.getItem('authToken'); // grab the logged-in user token
                                const orgId = localStorage.getItem('currentOrganizationId');
                                if (!token) throw new Error('No auth token found');

                                const res = await fetch(
                                  `http://localhost:8000/api/proposals/${proposal.id}/send`,
                                  {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`, // important!
                                      'X-Organization-ID': orgId || '',
                                    },
                                  }
                                );

                                if (!res.ok) throw new Error('Failed to send proposal');

                                alert('Proposal link sent to client!');
                              } catch (err) {
                                alert(err.message);
                                console.error(err);
                              }
                            }}
                            >Email to Client
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(proposal)} className="text-danger">Delete</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Create/Edit Proposal Modal */}
          <Modal show={showForm} onHide={() => setShowForm(false)} size="lg" fullscreen="lg-down" className="client-modal">
            <Modal.Header closeButton className="modal-header-custom">
              <Modal.Title>{editingProposal ? 'Edit Proposal' : 'New Proposal'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ProposalForm
                proposal={editingProposal}
                onSave={() => {
                  setShowForm(false);   // close the modal
                  loadProposals();       // refresh the list
                }}
                onCancel={() => setShowForm(false)}
              />
            </Modal.Body>
          </Modal>

          {/* PDF Preview Modal */}
          <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)} size="xl" fullscreen="lg-down" className="client-modal">
            <Modal.Header closeButton className="modal-header-custom">
              <Modal.Title>PDF Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ height: '80vh' }}>
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                />
              ) : (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2" style={{ color: 'var(--color-primary)' }}>Loading PDF...</p>
                </div>
              )}
            </Modal.Body>
          </Modal>
          
      </Card.Body>
      </Card>
    </Container>
  );
}
