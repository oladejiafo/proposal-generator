import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Users, FileText, Layers, BarChart2 } from 'lucide-react';
import ProposalTrendsChart from './ProposalTrendsChart';
import api from '../api';

export default function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Polling every 60 seconds
  useEffect(() => {
    let intervalId;
    
    const fetchStats = async () => {
      try {
        // Use your api instance instead of direct fetch
        const token = localStorage.getItem('authToken');
        const res = await api.get('/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setStats(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        
        // If it's a subscription error, don't keep retrying
        if (err.response?.status === 402) {
          clearInterval(intervalId);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    intervalId = setInterval(fetchStats, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  // Colorful summary cards
  const cards = [
    { 
      title: "Clients", 
      value: stats.clientsCount, 
      icon: <Users />, 
      bg: "linear-gradient(135deg, #189AB4 0%, #05445E 70%, #75E6DA 100%)"
    },
    { 
      title: "Proposals", 
      value: stats.proposalsCount, 
      icon: <FileText />, 
      bg: "linear-gradient(135deg, #75E6DA 0%, #189AB4 70%, #05445E 100%)"
    },
    { 
      title: "Templates", 
      value: stats.templatesCount, 
      icon: <Layers />, 
      bg: "linear-gradient(135deg, #05445E 0%, #75E6DA 70%, #189AB4 100%)"
    },
  ];

  return (
    <>
      <p className="text-muted mb-4">
        Create professional proposals, send them to clients, and track their status - all in one place.
      </p>
      {/* Summary Cards */}
      <Row className="mb-4">
        {cards.map((c, i) => (
          <Col className="mb-2" md={4} key={i}>
            <Card 
              className="shadow-sm border-0 rounded-3 my-3 h-100 text-white"
              style={{ background: c.bg }}
            >
              <Card.Body className="d-flex align-items-center justify-content-between">
                <div>
                  <Card.Title className="fw-bold text-white-50">{c.title}</Card.Title>
                  <h2 className="fw-bold mb-0">{c.value}</h2>
                </div>
                <div className="fs-1 opacity-75">{c.icon}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Analytics Row */}
      <Row className="mt-4">
        <Col md={6} className="d-flex align-items-stretch mb-2">
          <Card className="shadow-sm border-0 rounded-3 w-100">
            <Card.Body>
              <Card.Title className="fw-bold">Recent Proposals</Card.Title>
              <ul className="list-unstyled mb-0">
                {stats.recentProposals.length === 0 ? (
                  <li>No proposals yet</li>
                ) : (
                  stats.recentProposals.map((p) => (
                    <li key={p.id}>
                      <strong className={`badge ${
                        p.status === 'accepted' ? 'bg-success' :
                        p.status === 'draft' ? 'bg-secondary' :
                        'bg-warning text-dark'
                      }`}>
                        {p.status}
                      </strong>{" "}
                      – {p.title || 'Untitled'}
                    </li>
                  ))
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="d-flex align-items-stretch mb-2">
          <Card className="shadow-sm border-0 rounded-3 w-100">
            <Card.Body>
              <Card.Title className="fw-bold">At a Glance</Card.Title>
              <p className="mb-1">
                New clients this month:{" "}
                <strong className="text-primary">{stats.insights.clientsThisMonth}</strong>
              </p>
              <p className="mb-1">
                Acceptance rate:{" "}
                <strong className="text-success">{stats.insights.acceptanceRate}%</strong>
              </p>
              <p className="mb-0">
                Avg. response time:{" "}
                <strong className="text-warning">{stats.insights.avgResponseTime} days</strong>
              </p>

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trends chart */}
      {stats?.proposalTrends && (
        <ProposalTrendsChart
          data={stats.proposalTrends}
          analytics={stats.analytics}
        />
      )}
    </>
  );
}
