import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default function NavigationBar({ user, onLogout }) {
  return (
    <Navbar bg="var(--color-primary)" variant="dark" expand="lg" sticky="top" className="mb-3">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
          <img 
            src="/logo.png" 
            alt="Proposal Generator Logo" 
            height="50"
            className="me-2"
            style={{
              filter: "drop-shadow(0 0 0.1px white) drop-shadow(0 0 0.1px white)"
              
            }}
          />
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/clients">
              <Nav.Link>Clients</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/proposals">
              <Nav.Link>Proposals</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/templates">
              <Nav.Link>Templates</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <NavDropdown title={user.name} id="user-nav-dropdown" className="custom-user-dropdown" align="end">
            <LinkContainer to="/settings">
                <NavDropdown.Item>Settings</NavDropdown.Item>
              </LinkContainer>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={onLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
