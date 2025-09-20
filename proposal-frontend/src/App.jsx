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
import LandingPage from "./pages/LandingPage";
import PricingPage from './pages/PricingPage';
// import useIdleLogout from "./hooks/useIdleLogout";

// Import the legal pages
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';
import Tutorial from './pages/Tutorial';
import Share from './pages/Share';

function App() {
  const { auth, loading } = useContext(AuthContext);
  // useIdleLogout(30 * 60 * 1000);

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
        <Route
          path="/"
          element={auth ? <DashboardLayout /> : <LandingPage />}
        >
          {/* Dashboard only shows if authenticated */}
          {auth && (
            <>
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
              <Route path="payment" element={<Payment />} />

              <Route path="/terms" element={<Terms />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/support" element={<Support />} />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/share" element={<Share />} />

            </>
          )}
        </Route>

        <Route
          path="/login"
          element={!auth ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!auth ? <Register /> : <Navigate to="/" replace />}
        />
        <Route path="/pricing" element={<PricingPage />} />

        {/* <Route path="/terms" element={<Terms />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/share" element={<Share />} />
         */}
        <Route path="/proposal/view/:token" element={<ProposalView />} />

        {/* Catch all */}
        <Route
          path="*"
          element={<Navigate to={auth ? "/" : "/login"} replace />}
        />
      </Routes>
    </Router>

  );
}

function ProposalPageWrapper() {
  const { proposalId } = useParams();
  return <ProposalPage proposalId={proposalId} />;
}

export default App;