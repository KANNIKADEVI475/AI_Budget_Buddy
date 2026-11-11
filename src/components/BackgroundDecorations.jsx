import React from 'react';

export default function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10" aria-hidden="true">
      {/* Soft ambient gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(0, 156, 222, 0.08) 0%, rgba(244, 248, 252, 0) 65%), radial-gradient(circle at 100% 100%, rgba(0, 121, 193, 0.05) 0%, rgba(244, 248, 252, 0) 50%)'
        }}
      />

      {/* Abstract circular shapes */}
      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 121, 193, 0.07) 0%, rgba(0, 48, 138, 0) 70%)',
          filter: 'blur(32px)',
        }}
      />

      <div 
        className="absolute -bottom-40 -right-24 w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0, 156, 222, 0.08) 0%, rgba(0, 121, 193, 0) 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Subtle fine concentric decorative rings */}
      <svg 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] opacity-[0.035]" 
        viewBox="0 0 900 900" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="450" cy="450" r="280" stroke="#00308A" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="450" cy="450" r="380" stroke="#0079C1" strokeWidth="1" />
        <circle cx="450" cy="450" r="440" stroke="#009CDE" strokeWidth="1" strokeDasharray="8 8" />
      </svg>
    </div>
  );
}
