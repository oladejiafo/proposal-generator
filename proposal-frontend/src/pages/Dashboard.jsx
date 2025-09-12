import React from 'react';
import { Container, Button } from 'react-bootstrap';

import { Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Clients from './Clients';
import Proposals from './Proposals';
import Templates from './Templates';

export default function Dashboard({ user, onLogout }) {
  return (
    <>
      <NavigationBar user={user} onLogout={onLogout} />
      <Container>
        <h1>Welcome, {user.name}</h1>
      </Container>
      <Container>
      <Routes>
        <Route path="/" element={<Navigate to="clients" replace />} />
        <Route path="clients" element={<Clients />} />
        <Route path="proposals" element={<Proposals />} />
        <Route path="templates" element={<Templates />} />
      </Routes>
      </Container>
    
    </>
    
  );
}