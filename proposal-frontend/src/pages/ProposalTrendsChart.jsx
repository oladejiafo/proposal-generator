import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  CartesianGrid
} from "recharts";
import { Card } from "react-bootstrap";

export default function ProposalTrendsChart({ data, analytics }) {
  if (!data || data.length === 0) return null;

  // Navy Blue theme colors
  const colors = {
    primary: "#05445E",      // Navy Blue
    accent: "#189AB4",       // Blue Grotto
    secondary: "#75E6DA",    // Blue Green
    light: "#D4F1F4",        // Baby Blue
    success: "#16A34A",      // Green
    warning: "#F59E0B",      // Amber
    danger: "#DC2626"        // Red
  };
  
  return (
    <Card className="shadow-sm border-0 rounded-3 my-3">
      <Card.Body>
        <Card.Title className="fw-bold mb-3" style={{ color: colors.primary }}>
          Proposal Trends
        </Card.Title>

        {/* Mini Analytics Badges */}
        {analytics && (
          <div className="d-flex gap-3 mb-3">
            <div 
              className="p-2 rounded text-center flex-fill" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.secondary} 100%)`,
                color: colors.primary,
                border: `1px solid ${colors.secondary}`
              }}
            >
              <strong style={{ fontSize: "1.2rem" }}>{analytics.viewAcceptanceRatio}%</strong>
              <div className="small mt-1" style={{ opacity: 0.8 }}>View/Acceptance Ratio</div>
            </div>
            <div 
              className="p-2 rounded text-center flex-fill" 
              style={{ 
                background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.accent} 100%)`,
                color: colors.primary,
                border: `1px solid ${colors.accent}`
              }}
            >
              <strong style={{ fontSize: "1.2rem" }}>{Math.round(analytics.avgResponseTimeHours)}h</strong>
              <div className="small mt-1" style={{ opacity: 0.8 }}>Avg Response Time</div>
            </div>
          </div>
        )}

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.light} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: colors.primary }}
              axisLine={{ stroke: colors.primary }}
            />
            <YAxis 
              tick={{ fill: colors.primary }}
              axisLine={{ stroke: colors.primary }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: colors.primary, 
                border: `1px solid ${colors.accent}`,
                borderRadius: '8px',
                color: 'white'
              }}
              formatter={(value, name) => {
                if (name === "avgResponse") return [`${value}h`, "Avg Response"];
                if (name === "count") return [value, "Proposals"];
                return [value, name];
              }}
              labelStyle={{ color: colors.secondary, fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              wrapperStyle={{ color: colors.primary }}
            />
            <Line
              type="monotone"
              dataKey="count"
              name="Proposals"
              stroke={colors.accent}
              strokeWidth={3}
              dot={{ fill: colors.accent, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: colors.primary }}
            />
            {analytics?.avgResponseTimeHours && (
              <ReferenceLine
                y={analytics.avgResponseTimeHours}
                label={{
                  value: `Avg Response: ${Math.round(analytics.avgResponseTimeHours)}h`, 
                  position: 'right',
                  fill: colors.primary,
                  fontSize: 12
                }}
                stroke={colors.primary}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
}