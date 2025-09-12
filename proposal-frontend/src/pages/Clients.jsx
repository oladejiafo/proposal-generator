import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Alert, Container, Spinner, Card, Dropdown } from 'react-bootstrap';
import api from '../api';
import UsageLimitAlert from '../components/UsageLimitAlert';


export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [organization, setOrganization] = useState(null);


  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get('/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data);
    } catch (err) {
      setError('Failed to load clients');
      console.error(err);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingClient(null);
    setFormData({ name: '', email: '', company: '', phone: '', notes: '' });
    setError('');
    setShowModal(true);
  }

  function openEditModal(client) {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      company: client.company || '',
      phone: client.phone || '',
      notes: client.notes || '',
    });
    setError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleDelete(client) {
    if (!window.confirm(`Delete client "${client.name}"?`)) return;
    try {
      const token = localStorage.getItem('authToken');
      await api.delete(`/clients/${client.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(clients.filter(c => c.id !== client.id));
    } catch (err) {
      alert('Failed to delete client');
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      if (editingClient) {
        const res = await api.put(`/clients/${editingClient.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(clients.map(c => (c.id === editingClient.id ? res.data : c)));
      } else {
        const res = await api.post('/clients', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients([...clients, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      // ADD THIS ERROR HANDLING:
      if (err.response?.data?.error === 'free_plan_client_limit_exceeded') {
        setError('You have reached your free plan client limit. Please upgrade to add more clients.');
      } else if (err.response?.status === 422 && err.response.data.errors) {
        const messages = Object.values(err.response.data.errors)
          .flat()
          .join(', ');
        setError(`Validation error: ${messages}`);
      } else {
        setError('Failed to save client');
      }
      console.error(err);
    }
  }
  
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      (client.updated_at ? new Date(client.updated_at).toLocaleString().toLowerCase().includes(query) : false)
    );
  });

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      const fieldA = (a[sortField] || '').toString().toLowerCase();
      const fieldB = (b[sortField] || '').toString().toLowerCase();

      if (fieldA < fieldB) return sortOrder === 'asc' ? -1 : 1;
      if (fieldA > fieldB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredClients, sortField, sortOrder]);

  function toggleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

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
            <h2 className="fw-bold">Clients</h2>
            <Button onClick={openAddModal} variant="primary">+ Add Client</Button>
          </div>

          {/* Add this line: Show usage alert only when ANY limit is reached */}
          {organization && (
            <UsageLimitAlert 
              organization={organization} 
              showDetails={false}
              showOnlyWhenLimitReached={true}
              limitType="clients"
            />
          )}

          <p className="text-muted">
            Manage all your clients here. Add, edit, or remove client information easily.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && clients.length > 0 && (
            <Form.Control
              type="text"
              placeholder="Search clients..."
              className="mb-3"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          )}

          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <Alert variant="info">No clients found. Click "Add Client" to create your first client.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('name')}>
                    Name {sortField === 'name' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('company')}>
                    Company {sortField === 'company' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('email')}>
                    Email {sortField === 'email' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('phone')}>
                    Phone {sortField === 'phone' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('updated_at')}>
                    Last Updated {sortField === 'updated_at' ? (sortOrder === 'asc' ? '🔼' : '🔽') : ''}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sortedClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.company}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.updated_at ? new Date(client.updated_at).toLocaleString() : '-'}</td>
                    <td>
                      <div className="d-none d-md-block">
                        <Button variant="outline-secondary" size="sm" onClick={() => openEditModal(client)}>Edit</Button>{' '}
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(client)}>Delete</Button>
                      </div>
                      <div className="d-md-none">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" id="mobile-actions">
                            <i className="fas fa-ellipsis-h">Select</i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditModal(client)}>Edit</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(client)} className="text-danger">Delete</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Modal show={showModal} onHide={closeModal} centered className="client-modal">
            <Modal.Header closeButton>
              <Modal.Title>{editingClient ? 'Edit Client' : 'Add Client'}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3" controlId="clientName">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="clientCompany">
                  <Form.Label>Company</Form.Label>
                  <Form.Control type="text" name="company" value={formData.company} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="clientEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="clientPhone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="clientNotes">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange} />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="submit" variant="primary">{editingClient ? 'Save Changes' : 'Add Client'}</Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Card.Body>
      </Card>
    </Container>
  );
}
