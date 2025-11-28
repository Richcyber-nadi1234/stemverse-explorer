
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" className="fill-slate-900" />
    
    {/* Network Nodes */}
    <g stroke="#fbbf24" strokeWidth="3">
      <line x1="30" y1="60" x2="50" y2="50" />
      <line x1="50" y1="50" x2="70" y2="30" />
      <line x1="50" y1="50" x2="30" y2="40" />
      <line x1="50" y1="50" x2="50" y2="25" />
      <line x1="50" y1="50" x2="70" y2="60" />
    </g>

    <circle cx="30" cy="60" r="5" fill="#fbbf24" />
    <circle cx="30" cy="40" r="5" fill="#fbbf24" />
    <circle cx="50" cy="25" r="5" fill="#fbbf24" />
    <circle cx="70" cy="60" r="5" fill="#fbbf24" />
    
    {/* Central Hub */}
    <circle cx="50" cy="50" r="8" stroke="#fbbf24" strokeWidth="3" fill="none" />

    {/* Growth Arrow */}
    <path 
      d="M25 75 L45 60 L60 60 L80 30" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M80 30 L65 30 M80 30 L80 45" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);
