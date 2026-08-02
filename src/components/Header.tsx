'use client';

import React from 'react';

interface HeaderProps {
  title: string;
  description: string;
}

export const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800 transition-colors">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-outfit">
          {title}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">{description}</p>
      </div>
    </header>
  );
};
