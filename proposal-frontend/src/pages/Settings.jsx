import React, { useState, useEffect, useContext } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Spinner, Image } from 'react-bootstrap';
import api from '../api';
import { AuthContext } from '../authContext';
import { Navigate, useNavigate } from 'react-router-dom';
import UsageLimitAlert from '../components/UsageLimitAlert';
import TeamManagement from '../components/TeamManagement';

export default function Settings() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    position: '',
    phone: '',
    contact_info: '',
    logo: null
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // const [subscription, setSubscription] = useState(null);
  const { auth } = useContext(AuthContext);
  const [organization, setSubscription] = useState(auth?.organization || null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
    //   const res = await api.get('/user');
      const res = await api.get('/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      setUserData({
        name: res.data.name || '',
        email: res.data.email || '',
        position: res.data.position || '',
        phone: res.data.phone || '',
        contact_info: res.data.contact_info || '',
        logo: res.data.logo_url || null
      });

      if (res.data.logo_url) {
        setLogoPreview(res.data.logo_url);
      }
    } catch (err) {
      setError('Failed to load user data');
      console.log(err)
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserData();
    fetchSubscription();
  }, []);
  
  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.get('/current-organization', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setSubscription(res.data);
    } catch (err) {
      console.error("Failed to fetch subscription:", err);
    }
  };

  const handleUserDataChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('authToken');
      const res = await api.post('/user/logo', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setLogoPreview(res.data.logo_url);
      setUserData(prev => ({ ...prev, logo: res.data.logo_url }));
      setSuccess('Logo uploaded successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload logo');
    }
    setUploadingLogo(false);
  };

  const handleRemoveLogo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await api.delete('/user/logo', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      setLogoPreview('');
      setUserData(prev => ({ ...prev, logo: null }));
      setSuccess('Logo removed successfully');
    } catch (err) {
        console.log(err)
      setError('Failed to remove logo');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      await api.put('/user/profile', userData, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            }
       });

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {

      const token = localStorage.getItem('authToken');
      await api.put('/user/password', passwordData,{
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            }
        });
      setSuccess('Password updated successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Container className="my-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading settings...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4">User Settings</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5>Profile Information</h5>
            </Card.Header>
            <Card.Body>

             {/* Logo Upload Section */}
              <div className="text-center mb-4">
                {logoPreview ? (
                  <>
                    <Image 
                    //   src={logoPreview} 
                      src={`http://local.test:8000${logoPreview}`} 
                      alt="Company Logo" 
                      height="120" 
                      className="rounded mb-3"
                      style={{ objectFit: 'cover' }}
                    />
                    <div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="me-2"
                      >
                        Remove Logo
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="border rounded p-4 text-center">
                    <i className="fas fa-image fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No logo uploaded</p>
                  </div>
                )}
                
                <Form.Group className="mt-3">
                  <Form.Label className="btn btn-outline-primary cursor-pointer">
                    <i className="fas fa-upload me-2"></i>
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingLogo}
                    />
                  </Form.Label>
                  <Form.Text className="d-block text-muted">
                    JPG, PNG, SVG or GIF • Max 5MB
                  </Form.Text>
                </Form.Group>
              </div>
              <Form onSubmit={handleProfileUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleUserDataChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleUserDataChange}
                    disabled // Email shouldn't be changed for security
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed for security reasons.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Position/Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={userData.position}
                    onChange={handleUserDataChange}
                    placeholder="e.g., CEO, Sales Manager, Freelancer"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleUserDataChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Contact Information</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="contact_info"
                    value={userData.contact_info}
                    onChange={handleUserDataChange}
                    placeholder="Additional contact details (address, social media, etc.)"
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Update Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {organization.subscription_type !== 'free' && (
            <Card className="mt-4">
              <Card.Header>
                <h5>Team Members</h5>
              </Card.Header>
              <Card.Body>
                <TeamManagement organization={organization} />
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Change Password</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handlePasswordUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Change Password'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          {/* Future: Subscription Management Card */}
          <Card className="mt-4">
            <Card.Header>
              <h5>Subscription</h5>
            </Card.Header>
            <Card.Body>
              {!organization ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <p>
                    <strong>Status:</strong>{" "}
                    {organization.subscription_status ? (
                      <span className="text-success">Active ✅</span>
                    ) : (
                      <span className="text-danger">Inactive ❌</span>
                    )}
                  </p>

                  {organization.subscription_status !== "active" &&
                    organization.subscription_type === "free" && (
                      <Alert variant="warning">
                        Your {organization.subscription_type} subscription is inactive. 
                        <br />
                        <Button 
                          variant="primary" 
                          className="mt-2"
                          onClick={() => navigate('/payment', { 
                            state: { 
                              plan: organization.subscription_type,
                              organization: organization 
                            }
                          })}
                        >
                          Renew Subscription
                        </Button>
                      </Alert>
                  )}

                  {organization.subscription_type === "free" && (
                    <Alert variant="info">
                      You're on the Free plan. 
                      <br />
                      <Button className='mt-2' variant='primary' onClick={() => navigate('/payment', { 
                          state: { 
                            plan: organization.subscription_type,
                            organization: organization 
                          }
                        })}
                      >
                        Upgrade Plan
                      </Button>

                    </Alert>
                  )}

                  {organization && <UsageLimitAlert organization={organization} showDetails={true} />}
                </>
              )}
            </Card.Body>
          </Card>

        </Col>
      </Row>
    </Container>
  );
}