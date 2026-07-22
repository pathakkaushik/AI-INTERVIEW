import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const defaultData = [
  { subject: 'Algorithms', A: 120, B: 110, fullMark: 150 },
  { subject: 'System Design', A: 98, B: 130, fullMark: 150 },
  { subject: 'Communication', A: 86, B: 130, fullMark: 150 },
  { subject: 'Problem Solving', A: 99, B: 100, fullMark: 150 },
  { subject: 'Coding Speed', A: 85, B: 90, fullMark: 150 },
  { subject: 'Clean Code', A: 65, B: 85, fullMark: 150 },
];

const SkillRadarChart = ({ data }) => {
  const chartData = Array.isArray(data) ? data.map(d => ({
    subject: d.subject,
    A: d.candidateScore || d.A,
    B: d.benchmarkScore || d.B,
    fullMark: d.fullMark || 150,
  })) : defaultData;

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid stroke="var(--panel-border)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
          <Radar name="Candidate" dataKey="A" stroke="var(--accent-blue)" fill="var(--accent-blue)" fillOpacity={0.5} />
          <Radar name="Benchmark" dataKey="B" stroke="var(--accent-purple)" fill="var(--accent-purple)" fillOpacity={0.2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillRadarChart;
