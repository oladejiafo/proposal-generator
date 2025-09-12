import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Alert, Container,Dropdown, Spinner, Card } from 'react-bootstrap';

import api from '../api';
import UsageLimitAlert from '../components/UsageLimitAlert';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); 
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [organization, setOrganization] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    is_public: false, 
  });

  const filteredTemplates = templates.filter(t => 
    filter === 'all' || (filter === 'public' ? t.is_public : !t.is_public)
  );
  

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get('/proposal-templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // const res = await api.get('/proposal-templates');
      setTemplates(res.data);
      setError('');
    } catch  (err) {
      console.error(err);
      setError('Failed to load templates');
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingTemplate(null);
    setFormData({ name: '', content: '' });
    setShowModal(true);
  }

  function openEditModal(template) {
    setEditingTemplate(template);
    setFormData({ 
      name: template.name, 
      content: template.content,
      is_public: template.is_public || false,
    });
    setShowModal(true);
  }
  
  function closeModal() {
    setShowModal(false);
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
  
    if (!formData.name.trim() || !formData.content.trim()) {
      setError('Name and content are required');
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      if (editingTemplate) {
        await api.put(`/proposal-templates/${editingTemplate.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/proposal-templates', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchTemplates();
      closeModal();
      setError('');
    } catch (err) {
      console.error(err);
      // ADD THIS ERROR HANDLING:
      if (err.response?.data?.error === 'free_plan_template_limit_exceeded') {
        setError('You have reached your free plan template limit. Please upgrade to add more templates.');
      } else if (err.response?.status === 422 && err.response.data.errors) {
        const messages = Object.values(err.response.data.errors)
          .flat()
          .join(', ');
        setError(`Validation error: ${messages}`);
      } else {
        setError('Failed to save template');
      }
    }
  }

  async function handleDelete(template) {
    if (!window.confirm(`Delete template "${template.name}"?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      await api.delete(`/proposal-templates/${template.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // await api.delete(`/proposal-templates/${template.id}`);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      setError('Failed to delete template');
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
            <h2 className="fw-bold">Proposal Templates</h2>
            <Button onClick={openAddModal} variant="primary">+ Add Template</Button>
          </div>
          {/* Add this line: Show usage alert only when ANY limit is reached */}
          {organization && (
            <UsageLimitAlert 
              organization={organization} 
              showDetails={false}
              showOnlyWhenLimitReached={true}
              limitType="templates"
            />
          )}
          
          <p className="text-muted">
            Manage all your templates here. Add, edit, or remove proposal templates easily.
          </p>

          <Form.Select
            onChange={(e) => setFilter(e.target.value)}
            className="mb-3"
          >
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Form.Select>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <p>Loading templates...</p>
          ) : templates.length === 0 ? (
            <Alert variant="info">No templates found. Add one!</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Content Preview</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* {templates.map(template => ( */}
                {filteredTemplates.map(template => (
                  <tr key={template.id}>
                    <td width='20%'>{template.name}</td>
                    <td  width='55%'>
                      <div style={{ maxHeight: '100px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                        {template.content.length > 300 ? template.content.slice(0, 300) + '...' : template.content}
                      </div>
                    </td>
                    <td width='10%'>
                      {template.is_public ? (
                        <span className="badge bg-success">Public</span>
                      ) : (
                        <span className="badge bg-secondary">Private</span>
                      )}
                    </td>
                    <td width="15%">
                    <div className="d-none d-md-block">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditModal(template)}
                        disabled={template.is_public} // disable if public
                        title={template.is_public ? "Public templates cannot be edited" : ""}
                      >
                        Edit
                      </Button>{' '}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(template)}
                        disabled={template.is_public} // disable if public
                        title={template.is_public ? "Public templates cannot be deleted" : ""}
                      >
                        Delete
                      </Button>
                      </div>
                      <div className="d-md-none">
                        <Dropdown>
                          <Dropdown.Toggle variant="light" size="sm" id="mobile-actions">
                            <i className="fas fa-ellipsis-h">Select</i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditModal(template)} disabled={template.is_public} title={template.is_public ? "Public templates cannot be edited" : ""}>Edit</Dropdown.Item>
                            
                            <Dropdown.Item onClick={() => handleDelete(template)} disabled={template.is_public} title={template.is_public ? "Public templates cannot be deleted" : ""} className="text-danger">Delete</Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                    </td>

                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Modal show={showModal} onHide={closeModal} size="lg" fullscreen="md-down" className="client-modal">
            <Modal.Header closeButton className="modal-header-custom">
              <Modal.Title>{editingTemplate ? 'Edit Template' : 'Add Template'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="templateName">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input-custom"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="templateContent">
                  <Form.Label>Content *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={12}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Use placeholders like {{client_name}}, {{project_details}}, {{pricing}}"
                    className="form-input-custom"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="templateIsPublic">
                  <Form.Check
                    type="checkbox"
                    label="Make this template public"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={(e) =>
                      setFormData({ ...formData, is_public: e.target.checked })
                    }
                    className="form-check-custom"
                  />
                  <Form.Text className="text-muted">
                    Public templates will be visible to all users. Once published, they cannot be deleted or edited.
                  </Form.Text>
                </Form.Group>

                <div className="d-flex justify-content-end modal-footer-custom">
                  <Button type="submit" variant="primary" className="me-2 btn-custom-primary">
                    {editingTemplate ? 'Save Changes' : 'Add Template'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={closeModal} className="btn-custom-secondary">
                    Cancel
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>

      </Card.Body>
      </Card>
    </Container>
  );
}