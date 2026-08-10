import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Card from '../components/Card';
import SkillRadarChart from '../components/SkillRadarChart';
import { Share2, Download, Shield, ThumbsUp, AlertCircle, ChevronRight, ChevronDown, Clock, BookOpen, MessageSquare, HelpCircle } from 'lucide-react';
import { api } from '../utils/api';
import { exportResultsPDF } from '../utils/pdfExport';
import Navbar from '../components/Navbar';

// Sub-Component 1: Performance Timeline (Custom SVG Chart)
const PerformanceTimeline = ({ answers }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  if (!answers || answers.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center min-h-[200px]">
        <HelpCircle className="text-secondary mb-2" size={32} />
        <p className="text-secondary text-sm">No performance data available.</p>
      </Card>
    );
  }

  const width = 600;
  const height = 220;
  const paddingX = 50;
  const paddingY = 35;
  const chartWidth = width - 2 * paddingX;
  const chartHeight = height - 2 * paddingY;

  // Calculate coordinates
  const points = answers.map((ans, index) => {
    const score = ans.score ?? 0;
    const x = paddingX + (index * chartWidth) / Math.max(answers.length - 1, 1);
    const y = height - paddingY - (score * chartHeight) / 100;
    return { x, y, score, index, questionText: ans.questionId?.text || `Question ${index + 1}` };
  });

  // Create path line
  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }

  // Create closed path for filled gradient area
  let areaPath = "";
  if (points.length > 0) {
    areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Performance Timeline
          </h3>
          <p className="text-xs text-secondary">Question-by-question scoring breakdown</p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Excellent (&ge;80)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-500"></span> Medium (50-79)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Needs Work (&lt;50)</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0.00" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = height - paddingY - (level * chartHeight) / 100;
            return (
              <g key={level} className="opacity-20">
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="var(--text-secondary)" 
                  strokeDasharray="4 4" 
                  strokeWidth="1"
                />
                <text 
                  x={paddingX - 10} 
                  y={y + 4} 
                  fill="var(--text-secondary)" 
                  fontSize="10" 
                  textAnchor="end"
                  fontFamily="var(--font-body)"
                >
                  {level}%
                </text>
              </g>
            );
          })}

          {/* X Axis labels */}
          {points.map((p, i) => (
            <text 
              key={i}
              x={p.x} 
              y={height - paddingY + 18} 
              fill="var(--text-secondary)" 
              fontSize="10" 
              textAnchor="middle"
              fontFamily="var(--font-body)"
            >
              Q{i + 1}
            </text>
          ))}

          {/* Shaded Area under line */}
          {areaPath && (
            <path d={areaPath} fill="url(#chartGrad)" />
          )}

          {/* Connection Line */}
          {linePath && (
            <path 
              d={linePath} 
              fill="none" 
              stroke="var(--accent-blue)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Points */}
          {points.map((p, i) => {
            const scoreColor = p.score >= 80 ? 'var(--accent-green)' : p.score >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)';
            const isHovered = hoveredPoint?.index === i;
            return (
              <g key={i} className="cursor-pointer">
                {/* Larger invisible hover area circle */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="14" 
                  fill="transparent" 
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                {/* Glowing ring when hovered */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={isHovered ? "8" : "5"} 
                  fill="var(--bg-color)" 
                  stroke={scoreColor} 
                  strokeWidth={isHovered ? "3" : "2"}
                  style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-30 glass-panel p-3 text-xs pointer-events-none flex flex-col gap-1"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -115%)',
              background: 'rgba(10, 10, 20, 0.95)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 10px rgba(99, 102, 241, 0.2)',
              borderRadius: '8px',
              minWidth: '180px',
              color: 'var(--text-primary)'
            }}
          >
            <div className="font-semibold text-blue-400 flex justify-between items-center">
              <span>Question {hoveredPoint.index + 1}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                hoveredPoint.score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                hoveredPoint.score >= 50 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
              }`}>
                {hoveredPoint.score}/100
              </span>
            </div>
            <div className="text-secondary truncate mt-1">{hoveredPoint.questionText}</div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Sub-Component 2: Speech Pace & Clarity (WPM)
const SpeechPaceCard = ({ wpm }) => {
  let status = "Optimal Pace";
  let rating = "Excellent";
  let statusColor = "var(--accent-green)";
  let feedback = "Your pacing is spot on! 110-150 WPM is the ideal rate for professional presentations and interviews.";

  if (wpm < 110) {
    status = "Slow Pace";
    rating = "Needs Practice";
    statusColor = "var(--accent-yellow)";
    feedback = "Speaking at a slower pace can help clarity, but try to maintain a natural flow to keep the listener engaged.";
  } else if (wpm > 150) {
    status = "Fast Pace";
    rating = "Needs Practice";
    statusColor = "var(--accent-red)";
    feedback = "You are speaking a bit fast. Try introducing pauses between your points to give your thoughts time to sink in.";
  }

  // Calculate percentage along the gauge (cap between 40 and 220 WPM)
  const percent = Math.min(Math.max(((wpm - 40) / 180) * 100, 0), 100);

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <Clock size={16} className="text-blue-400" />
              Speech Pace & Clarity
            </h4>
            <p className="text-xs text-secondary mt-0.5">Average Words Per Minute</p>
          </div>
          <span 
            className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
            style={{ color: statusColor, background: `${statusColor}1A`, border: `1px solid ${statusColor}33` }}
          >
            {rating}
          </span>
        </div>

        <div className="my-4 text-center">
          <div className="text-4xl font-extrabold tracking-tight">{wpm}</div>
          <div className="text-xs font-semibold mt-1" style={{ color: statusColor }}>{status}</div>
        </div>

        {/* Linear Segmented Gauge */}
        <div className="relative mt-2 mb-6">
          <div className="h-2 w-full rounded-full bg-white/5 flex overflow-hidden border border-white/10">
            {/* Slow Segment */}
            <div className="h-full bg-yellow-500/30 border-r border-black/40" style={{ width: '38.8%' }}></div>
            {/* Optimal Segment */}
            <div className="h-full bg-emerald-500/40 border-r border-black/40" style={{ width: '22.2%' }}></div>
            {/* Fast Segment */}
            <div className="h-full bg-red-500/30" style={{ width: '39%' }}></div>
          </div>
          
          {/* Indicator Dot */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white bg-indigo-500 shadow-md transition-all duration-500 ease-out"
            style={{ left: `calc(${percent}% - 8px)`, boxShadow: '0 0 8px rgba(99, 102, 241, 0.8)' }}
            title={`Your WPM: ${wpm}`}
          />
          
          <div className="flex justify-between text-[9px] text-secondary mt-1 px-1">
            <span>Slow (40)</span>
            <span className="text-emerald-400">Optimal (110-150)</span>
            <span>Fast (220)</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-secondary leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
        {feedback}
      </p>
    </Card>
  );
};

// Sub-Component 3: Study Recommendations
const StudyRecommendationsCard = ({ missingConcepts }) => {
  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-1.5 mb-2">
          <BookOpen size={16} className="text-blue-400" />
          Study Recommendations
        </h4>
        <p className="text-xs text-secondary mt-0.5 mb-4">Focus areas derived from unanswered or incorrect terms</p>

        {missingConcepts.length > 0 ? (
          <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
            {missingConcepts.slice(0, 3).map((concept, idx) => (
              <div key={idx} className="flex gap-2.5 items-start p-2 rounded bg-white/5 border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2 animate-pulse"></span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-white truncate">{concept}</div>
                  <div className="text-[10px] text-secondary leading-tight mt-0.5">Review documentation guidelines and perform hands-on coding practice.</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="text-emerald-400 font-semibold text-xs mb-1">Excellent Coverage!</span>
            <span className="text-[10px] text-secondary leading-normal">No key topics were missing in your answers. Keep it up!</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-white/10 text-center">
        <a 
          href="https://developer.mozilla.org" 
          target="_blank" 
          rel="noreferrer" 
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-smooth inline-flex items-center gap-1"
        >
          Explore Learning Resources <ChevronRight size={12} />
        </a>
      </div>
    </Card>
  );
};

// Sub-Component 4: Q&A Accordion
const QAAccordionList = ({ answers }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!answers || answers.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-400" />
          Q&A Detailed Breakdown
        </h3>
        <p className="text-xs text-secondary mt-0.5">Explore feedback for each question in detail</p>
      </div>

      <div className="space-y-3">
        {answers.map((ans, idx) => {
          const isExpanded = expandedIndex === idx;
          const score = ans.score ?? 0;
          const scoreColorClass = score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                  score >= 50 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 
                                                'text-red-400 bg-red-500/10 border-red-500/20';
          const qText = ans.questionId?.text || `Question ${idx + 1}`;
          const keywords = ans.analysis?.keywordsDetected || [];
          const missing = ans.analysis?.missingConcepts || [];
          const suggestion = ans.analysis?.suggestedImprovement || "No direct improvements suggested.";

          return (
            <div 
              key={idx} 
              className={`rounded-lg border transition-smooth ${isExpanded ? 'bg-white/[0.04] border-white/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
            >
              {/* Header */}
              <div 
                className="flex items-center justify-between p-4 cursor-pointer select-none"
                onClick={() => toggleExpand(idx)}
              >
                <div className="flex-1 pr-4 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Question {idx + 1}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${scoreColorClass}`}>
                      Score: {score}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{qText}</p>
                </div>
                <div className="shrink-0 text-secondary transition-smooth" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <ChevronDown size={18} />
                </div>
              </div>

              {/* Expandable Body */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-white/5 flex flex-col gap-4">
                  {/* Question (Full Text) */}
                  <div className="mt-4">
                    <div className="text-[10px] font-bold text-secondary uppercase mb-1">Full Question Prompt</div>
                    <p className="text-sm text-secondary bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed italic">{qText}</p>
                  </div>

                  {/* Candidate Answer */}
                  <div>
                    <div className="text-[10px] font-bold text-secondary uppercase mb-1">Your Answer</div>
                    <p className="text-sm text-white bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
                      {ans.answerText || <span className="italic text-secondary">No answer recorded.</span>}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Keywords */}
                    <div>
                      <div className="text-[10px] font-bold text-secondary uppercase mb-1">Keywords Detected</div>
                      <div className="flex flex-wrap gap-1.5">
                        {keywords.length > 0 ? (
                          keywords.map((kw, kIdx) => (
                            <span key={kIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-secondary italic">None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Concepts */}
                    <div>
                      <div className="text-[10px] font-bold text-secondary uppercase mb-1">Missing Concepts</div>
                      <div className="flex flex-wrap gap-1.5">
                        {missing.length > 0 ? (
                          missing.map((mc, mIdx) => (
                            <span key={mIdx} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                              {mc}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-secondary italic">All key concepts mentioned!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                      <span>💡</span> AI Suggested Improvement
                    </div>
                    <p className="text-xs text-secondary leading-relaxed mt-1">{suggestion}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

const SalaryIcon = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ color: 'var(--accent-purple)' }}
  >
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

// Sub-Component: AI Salary Estimator
const AISalaryEstimatorCard = ({ score, role, difficulty }) => {
  // Real-world ranges for India (LPA) and US (USD) based on difficulty
  const ranges = {
    Easy: { 
      minLPA: 4, maxLPA: 10, avgLPA: 7, 
      minUSD: 50000, maxUSD: 85000, avgUSD: 65000, 
      entryLabel: '3 LPA', midLabel: '7 LPA', highLabel: '12 LPA' 
    },
    Medium: { 
      minLPA: 8, maxLPA: 20, avgLPA: 13, 
      minUSD: 80000, maxUSD: 140000, avgUSD: 110000, 
      entryLabel: '6 LPA', midLabel: '14 LPA', highLabel: '24 LPA' 
    },
    Hard: { 
      minLPA: 18, maxLPA: 45, avgLPA: 28, 
      minUSD: 130000, maxUSD: 230000, avgUSD: 175000, 
      entryLabel: '12 LPA', midLabel: '28 LPA', highLabel: '50 LPA' 
    }
  };

  const difficultyKey = ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium';
  const { minLPA, maxLPA, avgLPA, minUSD, maxUSD, avgUSD, entryLabel, midLabel, highLabel } = ranges[difficultyKey];

  const passingScore = 50;
  const isQualified = score >= passingScore;

  let lpa, usdVal;
  if (isQualified) {
    // Scale between min and max for scores 50-100
    const factor = (score - passingScore) / (100 - passingScore);
    lpa = minLPA + factor * (maxLPA - minLPA);
    usdVal = minUSD + factor * (maxUSD - minUSD);
  } else {
    // Scale down towards 0 for scores below 50
    const factor = score / passingScore;
    lpa = factor * minLPA;
    usdVal = factor * minUSD;
  }

  const roundedLPA = Math.round(lpa * 10) / 10;
  const roundedUSD = Math.round(usdVal / 1000) * 1000;

  const formattedLPA = `${roundedLPA} LPA`;
  const formattedUSD = `$${roundedUSD.toLocaleString()}`;

  // Market comparison percentage (compared with localized average)
  const avgDiff = Math.round(((roundedLPA - avgLPA) / avgLPA) * 100);
  const isAboveAvg = avgDiff >= 0;

  return (
    <Card className="p-5 flex flex-col justify-between">
      <div>
        <h4 className="font-semibold text-sm flex items-center gap-1.5 mb-2">
          <SalaryIcon size={16} />
          AI Salary Estimator
        </h4>
        <p className="text-xs text-secondary mt-0.5 mb-4">Estimated starting package based on your performance and role profile</p>

        <div className="my-4 text-center">
          <div className={`text-4xl font-extrabold tracking-tight ${isQualified ? 'text-emerald-400' : 'text-red-400'}`}>
            {isQualified ? formattedLPA : 'No Offer'}
          </div>
          <div className="text-sm font-semibold text-secondary mt-1">
            {isQualified ? `${formattedUSD} / year` : `Est. Value: ${formattedLPA} (${formattedUSD})`}
          </div>
          
          <div className="mt-4 flex items-center justify-center text-xs font-semibold" style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
            {isQualified ? (
              <>
                {isAboveAvg ? (
                  <span className="text-emerald-400">▲ {avgDiff}% above average</span>
                ) : (
                  <span className="text-yellow-400">▼ {Math.abs(avgDiff)}% below average</span>
                )}
                <span className="text-secondary">for {role || 'this role'}</span>
              </>
            ) : (
              <span className="text-red-400/90 flex items-center gap-1">
                <span>⚠️</span> Below 50% Passing Bar for {difficultyKey} tier
              </span>
            )}
          </div>
        </div>

        {/* Benchmarking Visualization */}
        <div className="space-y-3 mt-4 bg-white/5 p-3 rounded-lg border border-white/5">
          <div className="text-xs font-bold text-secondary mb-1">Market Salary Benchmark</div>
          
          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span>{isQualified ? 'Your Estimated Offer' : 'Your Performance Value'}</span>
              <span className={`font-semibold ${isQualified ? 'text-emerald-400' : 'text-red-400'}`}>{formattedLPA}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${Math.min(Math.max((roundedLPA / maxLPA) * 100, 5), 100)}%`,
                  background: isQualified 
                    ? 'linear-gradient(90deg, #10b981, #2dd4bf)' 
                    : 'linear-gradient(90deg, #f87171, #f59e0b)'
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] mb-1">
              <span>Market Average ({difficultyKey} Level)</span>
              <span className="font-semibold text-secondary">{avgLPA} LPA</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${Math.min(Math.max((avgLPA / maxLPA) * 100, 5), 100)}%`,
                  background: 'rgba(255, 255, 255, 0.2)'
                }}
              />
            </div>
          </div>
          
          <div className="flex justify-between text-[8px] text-secondary mt-1 px-1">
            <span>Entry ({entryLabel})</span>
            <span>Mid ({midLabel})</span>
            <span>High ({highLabel})</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Results = () => {
  const navigate = useNavigate();
  const { id: interviewId } = useParams();
  const [result, setResult] = useState(null);
  const [skills, setSkills] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionPlan, setActionPlan] = useState(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const timelineRef = useRef(null);
  const radarRef = useRef(null);

  const handlePDFExport = async () => {
    const chartImages = {};
    try {
      if (timelineRef.current) {
        const canvas = await html2canvas(timelineRef.current, { backgroundColor: '#1a1a2e', scale: 2 });
        chartImages.timeline = canvas.toDataURL('image/png');
      }
      if (radarRef.current) {
        const canvas = await html2canvas(radarRef.current, { backgroundColor: '#1a1a2e', scale: 2 });
        chartImages.radar = canvas.toDataURL('image/png');
      }
    } catch (e) { console.warn('Chart capture failed:', e); }
    exportResultsPDF(result, skills, chartImages);
  };

  useEffect(() => {
    if (!interviewId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [resultRes, skillsRes] = await Promise.all([
          api.getResults(interviewId),
          api.getSkills(interviewId),
        ]);
        setResult(resultRes.data || resultRes);
        setSkills(skillsRes.data || skillsRes);
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [interviewId]);

  const handleGenerateActionPlan = async () => {
    setActionPlanLoading(true);
    try {
      const res = await api.generateActionPlan(interviewId);
      setActionPlan(res.data || res);
    } catch (err) {
      console.error('Failed to generate action plan:', err);
    } finally {
      setActionPlanLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AI Interview Results - ${roleName}`,
          text: `Check out my AI Interview results for the ${roleName} position!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share API error:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  if (!interviewId) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-secondary text-lg">No interview selected.</p>
        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-spinner" />
          <p className="text-secondary text-sm">Loading results...</p>
        </div>
      </div>
    );
  }

  const answersList = result?.interviewId?.answers || [];
  const answersScores = answersList.map(a => a.score ?? 0);
  const overallScore = answersScores.length > 0
    ? Math.round(answersScores.reduce((sum, s) => sum + s, 0) / answersScores.length)
    : (result?.overallScore ?? 84);
  const percentile = result?.percentile || 'Top 15% of Candidates';

  const strengths = result?.strengths
    ? result.strengths.map(s => ({
        title: s.title || s.category || 'Strength:',
        detail: s.detail || ''
      }))
    : [
        { title: 'System Design:', detail: 'Structured answers perfectly using the STAR method.' },
        { title: 'Confidence:', detail: 'Maintained strong eye contact and stable posture.' },
      ];

  const improvements = result?.improvements
    ? result.improvements.map(imp => ({
        title: imp.title || imp.category || 'Improvement:',
        detail: imp.detail || '',
        severity: imp.severity || 'yellow'
      }))
    : [
        { title: 'Algorithm Depth:', detail: 'Missed space complexity analysis in Question 2.', severity: 'red' },
        { title: 'Pacing:', detail: 'Speech rate increased significantly during difficult questions.', severity: 'yellow' },
      ];

  const rawTrans = result?.evaluationTransparency;
  const dataAnalyzed = rawTrans?.dataAnalyzed || [
    `${rawTrans?.wordsAnalyzed || rawTrans?.wordsSpoken || 2450} words analyzed`,
    `${rawTrans?.facialExpressions || 32} macro facial expressions`,
    `${rawTrans?.keywordClusters || 4} technical keyword clusters`
  ];

  const weighting = Array.isArray(rawTrans?.weighting)
    ? rawTrans.weighting
    : rawTrans?.weighting
      ? [
          { label: 'Technical Accuracy', value: `${rawTrans.weighting.technicalAccuracy || 50}%` },
          { label: 'Communication Clarity', value: `${rawTrans.weighting.communicationClarity || 30}%` },
          { label: 'Confidence & Delivery', value: `${rawTrans.weighting.confidenceDelivery || 20}%` }
        ]
      : [
          { label: 'Technical Accuracy', value: '50%' },
          { label: 'Communication Clarity', value: '30%' },
          { label: 'Confidence & Delivery', value: '20%' },
        ];

  const evaluationTransparency = {
    dataAnalyzed,
    weighting
  };

  const roleName = result?.interview?.role || result?.role || 'Frontend Engineer Role';
  const interviewDate = result?.interview?.date || result?.date || 'Recent';

  // Compute speech metrics and recommendations
  const totalWords = answersList.reduce((acc, ans) => {
    const text = ans.answerText || "";
    return acc + text.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const durationMin = Math.max((result?.interviewId?.duration || result?.duration || 60) / 60, 0.2);
  const wpm = Math.round(totalWords / durationMin) || 125;

  const missingConceptsList = [];
  answersList.forEach(ans => {
    if (ans.analysis?.missingConcepts) {
      ans.analysis.missingConcepts.forEach(c => {
        if (c && !missingConceptsList.includes(c)) {
          missingConceptsList.push(c);
        }
      });
    }
  });

  return (
    <>
    <Navbar />
    <div className="min-h-screen p-8 max-w-6xl mx-auto flex flex-col gap-6" style={{ paddingTop: '80px' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">Interview Results</h1>
          <p className="text-secondary flex items-center gap-2">{roleName} <ChevronRight size={14}/> {interviewDate}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleShare}>
            <Share2 size={16}/> {copied ? 'Copied!' : 'Share'}
          </Button>
          <Button variant="outline" onClick={handlePDFExport}><Download size={16}/> Export PDF</Button>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Analytics & Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div ref={timelineRef}>
            <PerformanceTimeline answers={answersList} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpeechPaceCard wpm={wpm} />
            <StudyRecommendationsCard missingConcepts={missingConceptsList} />
          </div>

          <QAAccordionList answers={answersList} />

          {/* AI Explanation & Transparency */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-blue-400" />
              <h2 className="text-lg font-semibold">AI Evaluation Transparency</h2>
            </div>
            <p className="text-sm text-secondary mb-4">How our engine arrived at your final score of {overallScore}/100.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-semibold mb-2">Data Analyzed</p>
                <ul className="text-xs text-secondary list-disc pl-4 space-y-1">
                  {evaluationTransparency.dataAnalyzed.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-semibold mb-2">Weighting</p>
                <ul className="text-xs text-secondary space-y-1">
                  {evaluationTransparency.weighting.map((item, i) => (
                    <li key={i} className="flex justify-between"><span>{item.label}</span><span>{item.value}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Details & Feedback */}
        <div className="flex flex-col gap-6">
          <Card>
            <div className="text-center mb-6 border-b border-white/10 pb-6">
              <p className="text-6xl font-bold text-emerald-400 mb-2">{overallScore}</p>
              <p className="text-sm font-semibold">Overall Score</p>
              <div className="inline-flex mt-2 items-center gap-1 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                {percentile}
              </div>
            </div>

            <h3 className="text-sm font-semibold mb-3">Key Strengths</h3>
            <ul className="space-y-2 mb-6">
              {strengths.map((s, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <ThumbsUp size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.title}</span> {s.detail}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-semibold mb-3">Areas for Improvement</h3>
            <ul className="space-y-2 mb-6">
              {improvements.map((imp, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <AlertCircle size={16} className={`${imp.severity === 'red' ? 'text-red-400' : 'text-yellow-400'} shrink-0 mt-0.5`} />
                  <span><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{imp.title}</span> {imp.detail}</span>
                </li>
              ))}
            </ul>
          </Card>

          <AISalaryEstimatorCard 
            score={overallScore} 
            role={roleName} 
            difficulty={result?.interviewId?.difficulty || 'Medium'} 
          />

          <Card className="flex-1">
            <h3 className="text-sm font-semibold mb-4">Skill Gap Analysis</h3>
            <div className="-mt-6 -ml-4" ref={radarRef}>
               <SkillRadarChart data={skills} />
            </div>
            <div className="text-center mt-2">
              <Button className="w-full" onClick={handleGenerateActionPlan} disabled={actionPlanLoading}>
                {actionPlanLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading-spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }} />
                    Generating...
                  </span>
                ) : 'Generate Action Plan'}
              </Button>
            </div>

            {actionPlan && (() => {
              // Extract the array of steps
              let stepsArray = null;
              if (Array.isArray(actionPlan)) {
                stepsArray = actionPlan;
              } else if (actionPlan.actionPlan && Array.isArray(actionPlan.actionPlan.plan)) {
                stepsArray = actionPlan.actionPlan.plan;
              } else if (actionPlan.actionPlan && Array.isArray(actionPlan.actionPlan.steps)) {
                stepsArray = actionPlan.actionPlan.steps;
              } else if (Array.isArray(actionPlan.plan)) {
                stepsArray = actionPlan.plan;
              } else if (Array.isArray(actionPlan.steps)) {
                stepsArray = actionPlan.steps;
              }

              if (!stepsArray) {
                const fallbackText = actionPlan.message || actionPlan.plan || JSON.stringify(actionPlan);
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-left">
                    <p className="text-xs font-semibold text-emerald-400 mb-2">Your Personalized Action Plan</p>
                    <p className="text-xs text-secondary leading-relaxed">{fallbackText}</p>
                  </motion.div>
                );
              }

              return (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-3">
                  <p className="text-sm font-bold text-indigo-400 border-b border-white/10 pb-2 mb-1 flex items-center gap-1.5 justify-start">
                    <span>🎯</span> Your Personalized Action Plan
                  </p>
                  <div className="flex flex-col gap-2">
                    {stepsArray.map((step, i) => {
                      // Separate Step title (e.g. "Step 1: ...") from content if possible
                      const parts = step.split(/:\s*(.*)/s);
                      const stepTitle = parts[0] || `Step ${i + 1}`;
                      const stepText = parts[1] || "";
                      
                      return (
                        <div key={i} className="p-3 rounded-lg border text-xs text-left" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                          <span className="font-bold text-indigo-300 block mb-1">{stepTitle}</span>
                          <span className="text-secondary leading-relaxed block">{stepText || step}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })()}
          </Card>
        </div>

      </div>
    </div>
    </>
  );
};

export default Results;
