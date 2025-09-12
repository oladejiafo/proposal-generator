// src/App.jsx
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProposalView from "./pages/ProposalView";
import { AuthContext } from "./authContext";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Clients from "./pages/Clients";
import Proposals from "./pages/Proposals";
import Templates from "./pages/Templates";
import Settings from './pages/Settings';
import ProposalPage from './pages/ProposalPage';
import Payment from './pages/Payment';
import { useParams } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={!auth ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!auth ? <Register /> : <Navigate to="/" replace />} />
        <Route path="/proposal/view/:token" element={<ProposalView />} />
        {/* <Route path="/payment" element={<Payment />} /> */}
        
        {/* Protected routes */}
        <Route path="/" element={
          auth ? <DashboardLayout /> : <Navigate to="/login" replace />
        }>
          <Route index element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } />
          <Route path="clients" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          <Route path="proposals" element={
            <ProtectedRoute>
              <Proposals />
            </ProtectedRoute>
          } />
          <Route path="templates" element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="proposals/:proposalId" element={
            <ProtectedRoute>
              <ProposalPageWrapper />
            </ProtectedRoute>
          } />
          <Route path="payment" element={
              <Payment />
          } />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to={auth ? "/" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

function ProposalPageWrapper() {
  const { proposalId } = useParams();
  return <ProposalPage proposalId={proposalId} />;
}

export default App;