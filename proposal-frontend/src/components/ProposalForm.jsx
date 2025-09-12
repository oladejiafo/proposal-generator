import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import api from '../api';
import SignaturePad from './SignaturePad';
import { useRef, useCallback } from 'react';
// import axios from 'axios';
import LineItemsEditor from './LineItemsEditor';
import UsageLimitAlert from '../components/UsageLimitAlert';

import ReactMarkdown from 'react-markdown';
// import rehypeRaw from 'rehype-raw';
// import { marked } from 'marked';
import { convertMarkdownWithHtml } from '../utils/markdownConverter';

export default function ProposalForm({ proposal, onSave, onCancel }) {
  const [clients, setClients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [userData, setUserData] = useState(null);
  const [organizationData, setOrganizationData] = useState(null);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateData, setSaveTemplateData] = useState({ 
    title: '', 
    category: '' 
  });

  const [formData, setFormData] = useState({
    client_id: proposal?.client_id || '',
    proposal_template_id: proposal?.proposal_template_id || '',
    title: proposal?.title || '',
    project_details: proposal?.project_details || '',
    // pricing: proposal?.pricing || '',
    contentPreview: proposal?.content || '',
  
    your_name: proposal?.your_name || '',
    your_company: proposal?.your_company || '',
    your_position: proposal?.your_position || '',
    your_contact_info: proposal?.your_contact_info || '',
    client_address: proposal?.client_address || '',
    client_city_state_zip: proposal?.client_city_state_zip || '',

    accept_terms: false,
    signature_image: proposal?.signature_image || '',
  });
  
  // Fetch user and organization data on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem('authToken');
        
        // Fetch current user data
        const userRes = await api.get('/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(userRes.data);
        
        // Fetch organization data
        const orgRes = await api.get('/current-organization', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrganizationData(orgRes.data);
        
      } catch (err) {
        console.error('Failed to fetch user/organization data', err);
      }
    }
    
    fetchUserData();
  }, []);
  
  // Auto-populate form when user/organization data is loaded
  useEffect(() => {
    if (userData && organizationData) {

      setFormData(prev => ({
        ...prev,
        // Only populate if field is empty (not editing existing proposal)
        your_name: prev.your_name || userData.name || '',
        your_position: prev.your_position || userData.position || 'Business Owner',
        your_company: prev.your_company || organizationData.name || '',
        your_contact_info: prev.your_contact_info || 
          (userData.contact_info || `${userData.email}\n${userData.phone || ''}`.trim())
      }));
    }
  }, [userData, organizationData]);

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');
  const signaturePadRef = useRef(null);

  // Fetch clients and templates on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem('authToken'); // get fresh token each time
        const [clientsRes, templatesRes] = await Promise.all([
          api.get('/clients', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/proposal-templates', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setClients(clientsRes.data);
        setTemplates(templatesRes.data);
      } catch {
        setError('Failed to load clients or templates');
      }
    }
    fetchData();
  }, []);

  const [lineItems, setLineItems] = useState(
    proposal?.line_items || [{ description: '', quantity: 1, price: 0 }]
  );
  const [lineItemsEnabled, setLineItemsEnabled] = useState(true);
  
  // const generateContentPreview = useCallback(async () => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     if (!formData.client_id || !formData.proposal_template_id) {
  //       setFormData(f => ({ ...f, contentPreview: '' }));
  //       setLoading(false);
  //       return;
  //     }
  
  //     const template = templates.find(t => t.id === Number(formData.proposal_template_id));
  //     const client = clients.find(c => c.id === Number(formData.client_id));
  
  //     if (!template || !client) {
  //       setFormData(f => ({ ...f, contentPreview: '' }));
  //       setLoading(false);
  //       return;
  //     }
  
  //     // Calculate total from line items
  //     // const total = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  //     const total = lineItemsEnabled
  //       ? lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  //       : 0;

  //     // Generate line items HTML for the template
  //     let lineItemsHtml = '';
  //     if (lineItemsEnabled && lineItems.length > 0) {
  //     // if (lineItems.length > 0) {
  //       lineItemsHtml = `
  //         <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  //           <thead>
  //             <tr style="background-color: #f8f9fa;">
  //               <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Description</th>
  //               <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6;">Qty</th>
  //               <th style="text-align: right; padding: 10px; border-bottom: 2px solid #dee2e6;">Price</th>
  //               <th style="text-align: right; padding: 10px; border-bottom: 2px solid #dee2e6;">Total</th>
  //             </tr>
  //           </thead>
  //           <tbody>
  //       `;
        
  //       lineItems.forEach(item => {
  //         const itemTotal = item.quantity * item.price;
  //         lineItemsHtml += `
  //           <tr>
  //             <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description || 'Item'}</td>
  //             <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
  //             <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)}</td>
  //             <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${itemTotal.toFixed(2)}</td>
  //           </tr>
  //         `;
  //       });
        
  //       lineItemsHtml += `
  //           </tbody>
  //           <tfoot>
  //             <tr>
  //               <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
  //               <td style="text-align: right; padding: 10px; font-weight: bold;">${total.toFixed(2)}</td>
  //             </tr>
  //           </tfoot>
  //         </table>
  //       `;
  //     }
  
  //     const companyLine = formData.your_company
  //       ? ', ' + formData.your_company
  //       : ', Independent Consultant';

  //     let content = template.content;
  //     content = content.replace(/{{\s*client_name\s*}}/gi, client.name);
  //     content = content.replace(/{{\s*client_company\s*}}/gi, client.company || '');
  //     content = content.replace(/{{\s*project_details\s*}}/gi, formData.project_details || '');
      
  //     // Replace pricing placeholder with line items table
  //     content = content.replace(/{{\s*pricing\s*}}/gi, lineItemsHtml || `$${total.toFixed(2)}`);
      
  //     // Add line_items placeholder support if template uses it
  //     content = content.replace(/{{\s*line_items\s*}}/gi, lineItemsHtml || `$${total.toFixed(2)}`);
      
  //     content = content.replace(/\[Your Name\]/g, formData.your_name || '');
  //     content = content.replace(/\[Your Position\]/g, formData.your_position || '');
  //     content = content.replace(/{{\s*your_company_line\s*}}/gi, companyLine)
  //     content = content.replace(/\[Your Contact Information\]/g, formData.your_contact_info || '');
  //     content = content.replace(/\[Client's Address\]/g, formData.client_address || '');
  //     content = content.replace(/\[Client's City, State, Zip\]/g, formData.client_city_state_zip || '');
  
  //     setFormData(f => ({ ...f, contentPreview: content }));
  //   } catch {
  //     setError('Failed to generate preview');
  //   }
  //   setLoading(false);
  // }, [
  //   formData.client_id, 
  //   formData.proposal_template_id, 
  //   formData.project_details, 
  //   formData.your_name,
  //   formData.your_position,
  //   formData.your_contact_info,
  //   formData.client_address,
  //   formData.client_city_state_zip,
  //   formData.your_company,
  //   clients,
  //   templates,
  //   lineItemsEnabled,
  //   lineItems // Add lineItems to dependencies
  // ]);
  
  const generateContentPreview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!formData.client_id || !formData.proposal_template_id) {
        setFormData(f => ({ ...f, contentPreview: '' }));
        setLoading(false);
        return;
      }
  
      const template = templates.find(t => t.id === Number(formData.proposal_template_id));
      const client = clients.find(c => c.id === Number(formData.client_id));
  
      if (!template || !client) {
        setFormData(f => ({ ...f, contentPreview: '' }));
        setLoading(false);
        return;
      }
  
      // Calculate total from line items
      const total = lineItemsEnabled
        ? lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
        : 0;
  
      // Generate line items HTML for the template
      let lineItemsHtml = '';
      if (lineItemsEnabled && lineItems.length > 0) {
        lineItemsHtml = `
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #dee2e6;">Description</th>
                <th style="text-align: center; padding: 10px; border-bottom: 2px solid #dee2e6;">Qty</th>
                <th style="text-align: right; padding: 10px; border-bottom: 2px solid #dee2e6;">Price</th>
                <th style="text-align: right; padding: 10px; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        lineItems.forEach(item => {
          const itemTotal = item.quantity * item.price;
          lineItemsHtml += `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description || 'Item'}</td>
              <td style="text-align: center; padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
              <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${item.price.toFixed(2)}</td>
              <td style="text-align: right; padding: 10px; border-bottom: 1px solid #eee;">${itemTotal.toFixed(2)}</td>
            </tr>
          `;
        });
        
        lineItemsHtml += `
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; padding: 10px; font-weight: bold;">Total:</td>
                <td style="text-align: right; padding: 10px; font-weight: bold;">${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        `;
      }
  
      const companyLine = formData.your_company
        ? ', ' + formData.your_company
        : ', Independent Consultant';
  
      let content = template.content;
      
      // Convert Markdown to HTML FIRST
      content = convertMarkdownWithHtml(content);
  
      // Then do your replacements
      content = content.replace(/{{\s*client_name\s*}}/gi, `<strong>${client.name}</strong>`);
      content = content.replace(/{{\s*client_company\s*}}/gi, client.company || '');
      
      // Handle project details - convert any markdown in project details too
      const projectDetailsHtml = convertMarkdownWithHtml(formData.project_details || '');
      content = content.replace(/{{\s*project_details\s*}}/gi, projectDetailsHtml);
      
      // Replace pricing placeholder with line items table
      content = content.replace(/{{\s*pricing\s*}}/gi, lineItemsHtml || `<strong>$${total.toFixed(2)}</strong>`);
      
      // Add line_items placeholder support if template uses it
      content = content.replace(/{{\s*line_items\s*}}/gi, lineItemsHtml || `<strong>$${total.toFixed(2)}</strong>`);
      
      content = content.replace(/\[Your Name\]/g, `<strong>${formData.your_name || ''}</strong>`);
      content = content.replace(/\[Your Position\]/g, formData.your_position || '');
      content = content.replace(/{{\s*your_company_line\s*}}/gi, companyLine);
      content = content.replace(/\[Your Contact Information\]/g, formData.your_contact_info || '');
      content = content.replace(/\[Client's Address\]/g, formData.client_address || '');
      content = content.replace(/\[Client's City, State, Zip\]/g, formData.client_city_state_zip || '');
  
      setFormData(f => ({ ...f, contentPreview: content }));
    } catch {
      setError('Failed to generate preview');
    }
    setLoading(false);
  },[
      formData.client_id, 
      formData.proposal_template_id, 
      formData.project_details, 
      formData.your_name,
      formData.your_position,
      formData.your_contact_info,
      formData.client_address,
      formData.client_city_state_zip,
      formData.your_company,
      clients,
      templates,
      lineItemsEnabled,
      lineItems // Add lineItems to dependencies
    ]);

  useEffect(() => {
    generateContentPreview();
  }, [generateContentPreview]);
  
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }
  
  async function generateAiText() {
    if (!formData.client_id) {
      setError('Please select a client first to generate AI content');
      return;
    }
  
    setAiLoading(true);
    setError('');
  
    try {
      const client = clients.find(c => c.id === Number(formData.client_id));
      const template = templates.find(t => t.id === Number(formData.proposal_template_id));

      // Build the AI prompt
      let prompt = `
        Write the main body of a professional project proposal for my client named ${client.name} 
        with company ${client.company || client.name || 'N/A'}.
        
        Template Subject: ${template?.name || 'Standard/Generic Proposal'}
        Proposal Title: ${formData.title || 'N/A'}
        
        The proposal should include (only where relevant to the poropsal type):
        - Executive summary / project overview
        - Scope of services
        - Deliverables
        - Methodology
        - Project timeline
        - Pricing approach
        - Payment terms
        - Compliance and assurances
        
        DO NOT include greetings, salutations, "Dear ${client.name}", 
        "Thank you for considering us", or any closing remarks. 
        
        Make it clear, persuasive, and suitable for a business proposal.
      `;
      
  
      const token = localStorage.getItem('authToken');
      const res = await api.post('/ai/generate-proposal-text', { prompt }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      setFormData(f => ({ ...f, project_details: res.data.text }));
    } catch {
      setError('Failed to generate AI proposal text');
    }
  
    setAiLoading(false);
  }
  
  async function submitProposalWithSignature(proposalId, formData) {
    const token = localStorage.getItem('authToken');
    
    const payload = {
      signature_image: formData.signature_image, // Base64 string
      accept_terms: formData.accept_terms, // boolean
      signed_ip: window.navigator?.connection?.downlink || '',
      signed_user_agent: navigator.userAgent,
      
    };
  
    await api.post(`/proposals/${proposalId}/sign`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('User data:', userData);
    console.log('Organization data:', organizationData);
    
    try {
      // Basic required field validation
      if (!formData.client_id || !formData.proposal_template_id || !formData.title) {
        setError('Please fill all required fields');
        setLoading(false);
        return;
      }
  
      // Calculate total from line items
      // const total = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const total = lineItemsEnabled
      ? lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
      : 0;
    
      const token = localStorage.getItem('authToken');
  
      const payload = {
        client_id: formData.client_id,
        // proposal_template_id: formData.proposal_template_id,
        proposal_template_id: formData.proposal_template_id || null,
        title: formData.title,
        project_details: formData.project_details,
        pricing: parseFloat(total.toFixed(2)), // Use calculated total instead of formData.pricing
        content: formData.contentPreview,
        your_name: formData.your_name,
        your_position: formData.your_position,
        your_contact_info: formData.your_contact_info,
        client_address: formData.client_address,
        client_city_state_zip: formData.client_city_state_zip,
        your_company: formData.your_company || null,
        organization_id: organizationData?.id,
        // line_items: lineItems
        // .filter(i => i.description && i.quantity != null && i.price != null) // remove incomplete items
        // .map(i => ({
        //   description: i.description,
        //   quantity: Number(i.quantity),
        //   price: Number(i.price)
        // })),

        line_items: lineItemsEnabled
        ? lineItems
            .filter(i => i.description && i.quantity != null && i.price != null)
            .map(i => ({
              active: true,          // required
              description: i.description,
              quantity: Number(i.quantity),
              price: Number(i.price)
            }))
        : []
      };
  
      // Save proposal (create or update)
      let savedProposal;
      if (proposal?.id) {
        savedProposal = await api.put(`/proposals/${proposal.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        savedProposal = await api.post('/proposals', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
  
      const proposalId = savedProposal.data.id;
      
      // Get signature from canvas directly
      let signatureBase64 = '';
      if (signaturePadRef.current) {
        signatureBase64 = signaturePadRef.current.getDataURL();
      }
  
      // Validate that signature exists
      if (!signatureBase64) {
        alert('Please draw your signature before submitting');
        setLoading(false);
        return;
      }
  
      // Submit signature along with form data
      await submitProposalWithSignature(proposalId, {
        ...formData,
        signature_image: signatureBase64
      });
  
      alert('Proposal and signature saved successfully');
      onSave();
  
     } catch (err) {
        console.error('Proposal save error:', err.response?.data || err);
      
        // If Laravel returns validation errors
        if (err.response?.status === 422 && err.response.data.errors) {
          const messages = Object.values(err.response.data.errors)
            .flat()
            .join(', ');
          setError(`Validation error: ${messages}`);
          alert(`Validation error: ${messages}`);
        } else if (err.response?.data?.error === 'free_plan_limit_exceeded') {
          setError('You have reached your free plan limit. Please upgrade to create more proposals.');
        } else {
            setError(err.response?.data?.message || 'Failed to create proposal');
        }
      }
      
    setLoading(false);
  }

  const [predefinedProposals, setPredefinedProposals] = useState([]);

  // Replace the predefined proposals useEffect in ProposalForm.jsx
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    api.get('/predefined-proposals', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Combine public and user templates from the response
      const allTemplates = [...res.data.public_templates, ...res.data.user_templates];
      setPredefinedProposals(allTemplates);
    })
    .catch(err => {
      console.error(err);
      setPredefinedProposals([]);
    });
  }, []);

  // Add the save template function
  const handleSaveAsTemplate = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await api.post('/predefined-proposals', {
        title: saveTemplateData.title,
        content: formData.project_details,
        category: saveTemplateData.category
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh predefined proposals
      const templatesRes = await api.get('/predefined-proposals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allTemplates = [...templatesRes.data.public_templates, ...templatesRes.data.user_templates];
      setPredefinedProposals(allTemplates);
      
      setShowSaveTemplateModal(false);
      setSaveTemplateData({ title: '', category: '' });
      alert('Template saved successfully!');
    } catch (err) {
      if (err.response?.data?.error === 'free_plan_template_limit_exceeded') {
        setError('Free plan limited to 5 saved templates. Upgrade to save more.');
      } else {
        setError('Failed to save template');
      }
    }
  };

  // preload saved signature when editing
  useEffect(() => {
    if (proposal?.signature_image && signaturePadRef.current) {
      // Small delay to ensure canvas is fully mounted
      setTimeout(() => {
        if (!proposal?.signature_image || !signaturePadRef) return;
        try {
          signaturePadRef.current.fromDataURL(proposal.signature_image);
        } catch (error) {
          console.error('Error loading signature:', error);
        }
      }, 100);
    }
  }, [proposal, signaturePadRef.current]);

  const selectedCategory = templates.find(
    t => t.id === Number(formData.proposal_template_id)
  )?.name || '';

  
  return (
    <>
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {clients.length === 0 && (
        <Alert variant="warning" className="d-flex justify-content-between align-items-center">
          <span>You don’t have any clients yet. Please create one first before creating a proposal.</span>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => window.location.href = '/clients'} // or use react-router navigate
          >
            Create Client
          </Button>
        </Alert>
      )}
      
      {clients.length > 0 && (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Client <span className="text-danger">*</span></Form.Label>
          <Form.Select name="client_id" value={formData.client_id} onChange={handleChange} required>
            <option value="">Select Client...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.company || 'No Company'})</option>
            ))}
          </Form.Select>
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>Proposal Category <span className="text-danger">*</span></Form.Label>
          <Form.Select name="proposal_template_id" value={formData.proposal_template_id} onChange={handleChange} required>
            <option value="">Select Proposal Category...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Title <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Proposal Details <span className="text-danger">*</span></Form.Label>
          <Form.Select
            className="mb-2"
            onChange={(e) => {
              const selected = predefinedProposals.find(p => p.id === parseInt(e.target.value));
              if (selected) {
                setFormData({
                  ...formData,
                  project_details: selected.content,
                  project_details_preview: selected.id
                });
              }
            }}
            value={formData.project_details_preview || ''}
          >
            <option value="">Select Predefined Proposal Template...</option>

            {/* Premium Templates (only for paid users) */}
            {organizationData?.subscription_type !== 'free' && (
              <optgroup label="⭐ Premium Templates">
                {predefinedProposals
                  .filter(p => p.category === selectedCategory && p.is_premium && p.is_public)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.category} - {p.title}
                    </option>
                  ))
                }
              </optgroup>
            )}

            {/* Free Public Templates */}
            <optgroup label="Free Templates">
              {predefinedProposals
                .filter(p => p.category === selectedCategory && !p.is_premium && p.is_public)
                .map(p => (
                  <option key={p.id} value={p.id}>
                    {p.category} - {p.title}
                  </option>
                ))
              }
            </optgroup>

            {/* User's Private Templates */}
            {predefinedProposals
              .filter(p => p.category === selectedCategory && !p.is_public && p.user_id === userData?.id)
              .length > 0 && (
              <optgroup label="💾 My Templates">
                {predefinedProposals
                  .filter(p => p.category === selectedCategory && !p.is_public && p.user_id === userData?.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.category} - {p.title}
                    </option>
                  ))
                }
              </optgroup>
            )}
          </Form.Select>

          {formData.project_details && (
          <Button
              variant="outline-success"
              size="sm"
              onClick={() => setShowSaveTemplateModal(true)}
              className="mt-2 me-2"
            >
              💾 Save as Template
            </Button>
          )}

          <Form.Text className="text-muted d-block mb-2 px-2">
            You can select from the predefined proposals, or use the AI-generated text or paste your own proposal content here. You can also edit the proposal text as you want here.
          </Form.Text>

          <Form.Control
            as="textarea"
            rows={6}
            name="project_details"
            value={formData.project_details}
            onChange={handleChange}
          />

          <Button
            variant="outline-primary"
            style={{ color: '#05445E' }}
            size="sm"
            onClick={generateAiText}
            disabled={aiLoading}
            className="mt-2 d-flex align-items-center"
          >
            {aiLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                ✨ Generating...
              </>
            ) : (
              '✨ Generate with AI'
            )}
          </Button>

        </Form.Group>

        <LineItemsEditor
          lineItems={lineItems}
          onLineItemsChange={setLineItems}
          lineItemsEnabled={lineItemsEnabled}
          setLineItemsEnabled={setLineItemsEnabled}
        />

        <Form.Group className="mb-3" controlId="yourName">
          <Form.Label>Your Name</Form.Label>
          <Form.Control
              type="text"
              name="your_name"
              value={formData.your_name}
              onChange={handleChange}
              placeholder="Enter your full name"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="yourPosition">
          <Form.Label>Your Position</Form.Label>
          <Form.Control
              type="text"
              name="your_position"
              value={formData.your_position}
              onChange={handleChange}
              placeholder="Enter your position or title"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="yourCompany">
          <Form.Label>Your Company Name</Form.Label>
          <Form.Control
              type="text"
              name="your_company"
              value={formData.your_company}
              onChange={handleChange}
              placeholder="Enter your company name"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="yourContactInfo">
          <Form.Label>Your Contact Information</Form.Label>
          <Form.Control
              as="textarea"
              rows={2}
              name="your_contact_info"
              value={formData.your_contact_info}
              onChange={handleChange}
              placeholder="Enter your phone, email, or address"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="clientAddress">
          <Form.Label>Client Address</Form.Label>
          <Form.Control
              as="textarea"
              rows={2}
              name="client_address"
              value={formData.client_address}
              onChange={handleChange}
              placeholder="Enter client address"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="clientCityStateZip">
          <Form.Label>Client City, State, Zip</Form.Label>
          <Form.Control
              type="text"
              name="client_city_state_zip"
              value={formData.client_city_state_zip}
              onChange={handleChange}
              placeholder="Enter client city, state, and zip code"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label={
              <span className="fw-bold">
                I agree to the terms and conditions <span className="text-danger">*</span>
              </span>
            }
            name="accept_terms"
            checked={formData.accept_terms || false}
            onChange={(e) => setFormData(prev => ({ ...prev, accept_terms: e.target.checked }))}
            required
          />
        </Form.Group>
        
        <h5>Sign Proposal</h5>
        <div className="d-flex flex-column flex-md-row align-items-start gap-2 mb-3">
          <SignaturePad
            ref={signaturePadRef}
            // initialImage={proposal?.signature_image || ''}
            onSave={(base64) =>
              setFormData(prev => ({ ...prev, signature_image: base64 }))
            }
          />
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => signaturePadRef.current.clear()}
            className="mt-2 mt-md-0"
          >
            Clear Signature
          </Button>
        </div>
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        <hr />
        <h5>Preview</h5>
        {loading ? (
          <p>Loading preview...</p>
        ) : (
          <div
            style={{ border: '1px solid #ccc', padding: '1rem' }}
            dangerouslySetInnerHTML={{ __html: formData.contentPreview }}
          />
        )}

        <div className="mt-3 d-flex justify-content-end modal-footer-custom">
          <Button type="submit" variant="primary" className="btn-custom-primary me-2" disabled={loading}>
            {loading ? 'Saving...' : (proposal?.id ? 'Save Changes' : 'Create Proposal')}
          </Button>{' '}
          <Button variant="secondary" className="btn-custom-secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </>
      )}
    </Form>
    
    {/* Save Template Modal */}
    <Modal show={showSaveTemplateModal} onHide={() => setShowSaveTemplateModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Save as Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Template Name</Form.Label>
          <Form.Control
            type="text"
            value={saveTemplateData.title}
            onChange={(e) => setSaveTemplateData({...saveTemplateData, title: e.target.value})}
            placeholder="Enter template name"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            value={saveTemplateData.category}
            onChange={(e) => setSaveTemplateData({...saveTemplateData, category: e.target.value})}
            placeholder="e.g., Web Design, Consulting"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowSaveTemplateModal(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSaveAsTemplate}>
          Save Template
        </Button>
      </Modal.Footer>
    </Modal>
  </>
  );

  
}
