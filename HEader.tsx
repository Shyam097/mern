import React from 'react';
import { BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-secondary shadow-lg">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-cyan-flare" />
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-wide">
            Excel Analytics Platform
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
