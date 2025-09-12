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
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    is_public: false,
    is_premium: false
  });

  // const filteredTemplates = Array.isArray(templates)
  // ? templates.filter(t => filter === 'all' || (filter === 'public' ? t.is_public : !t.is_public))
  // : [];

  const categories = Array.from(new Set(templates.map(t => t.category))).filter(Boolean);

  const filteredTemplates = Array.isArray(templates)
  ? templates.filter(t => {
      // Type filter
      const typeMatch = filter === 'all' || (filter === 'public' ? t.is_public : !t.is_public);
      // Category filter
      const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter;
      return typeMatch && categoryMatch;
    })
  : [];


  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get('/predefined-proposals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // const res = await api.get('/proposal-templates');
      const allTemplates = [
        ...(res.data.public_templates || []),
        ...(res.data.user_templates || [])
      ];
  
      setTemplates(allTemplates);
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
  
    if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      setError('Title, category, and content are required');
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      if (editingTemplate) {
        await api.put(`/predefined-proposals/${editingTemplate.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/predefined-proposals', formData, {
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
      await api.delete(`/predefined-proposals/${template.id}`, {
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

          <Form className="mb-3 d-flex gap-2">
            <Form.Select
              onChange={(e) => setFilter(e.target.value)}
              value={filter}
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </Form.Select>

            <Form.Select
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Form.Select>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}

          {loading ? (
            <p>Loading templates...</p>
          ) : templates.length === 0 ? (
            <Alert variant="info">No templates found. Add one!</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Content Preview</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* {templates.map(template => ( */}
                {filteredTemplates.map(template => (
                  <tr key={template.id}>
                  <td width='15%'>{template.title}</td>
                  <td width='15%'>{template.category}</td>
                  <td width='45%'>
                    <div style={{ maxHeight: '100px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                      {template.content.length > 300 ? template.content.slice(0, 300) + '...' : template.content}
                    </div>
                  </td>
                  <td width='10%'>
                    {template.is_premium ? (
                      <span className="badge bg-warning">⭐ Premium</span>
                    ) : template.is_public ? (
                      <span className="badge bg-success">Public</span>
                    ) : (
                      <span className="badge bg-secondary">Private</span>
                    )}
                  </td>

                  <td width="15%">
                    <div className="d-none d-md-flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditModal(template)}
                        disabled={template.is_public || template.is_premium} // disable if public or premium
                        title={template.is_public || template.is_premium ? "Cannot edit public or premium templates" : ""}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(template)}
                        disabled={template.is_public || template.is_premium} // disable if public or premium
                        title={template.is_public || template.is_premium ? "Cannot delete public or premium templates" : ""}
                      >
                        Delete
                      </Button>
                    </div>

                    <div className="d-md-none">
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" id={`mobile-actions-${template.id}`}>
                          <i className="fas fa-ellipsis-h"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => openEditModal(template)}
                            disabled={template.is_public || template.is_premium}
                            title={template.is_public || template.is_premium ? "Cannot edit public or premium templates" : ""}
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDelete(template)}
                            disabled={template.is_public || template.is_premium}
                            title={template.is_public || template.is_premium ? "Cannot delete public or premium templates" : ""}
                            className="text-danger"
                          >
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </td>

                </tr>

                ))}
              </tbody>
            </Table>
          )}

          <Modal show={showModal} onHide={closeModal} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{editingTemplate ? 'Edit Template' : 'Add Template'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Web Design, Consulting"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Content *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Make this template public"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button type="submit" variant="primary" className="me-2">
                    {editingTemplate ? 'Save Changes' : 'Add Template'}
                  </Button>
                  <Button variant="secondary" onClick={closeModal}>
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