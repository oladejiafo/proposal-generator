import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import api from '../api';

export default function TeamManagement({ organization }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [inviteData, setInviteData] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get(`/organizations/${organization.id}/team`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(res.data.members);
    } catch (err) {
      setError('Failed to load team members');
      console.error(err);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setInviteData({ ...inviteData, [e.target.name]: e.target.value });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('authToken');
      await api.post(`/organizations/${organization.id}/team`, inviteData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Member added successfully');
      setShowModal(false);
      setInviteData({ name: '', email: '', password: '', role: 'member' });
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to invite member');
    }
  };

  const handleRemove = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      await api.delete(`/organizations/${organization.id}/team/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMembers();
    } catch (err) {
        console.log(err)
      setError('Failed to remove member');
    }
  };

  if (loading) return <Spinner animation="border" size="sm" />;

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>
        Add New Member
      </Button>

      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map(member => (
            <tr key={member.id}>
              <td>{member.name}</td>
              <td>{member.email}</td>
              <td>{member.pivot.role}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleRemove(member.id)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Team Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleInvite}>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={inviteData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={inviteData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={inviteData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={inviteData.role} onChange={handleChange}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </Form.Select>
            </Form.Group>
            <Button type="submit" variant="primary">
              Add
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}
