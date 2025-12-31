
import React from 'react';
import { History, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-teal-100 selection:text-teal-900">
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-nav fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 md:px-12"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#0d9488] rounded-[0.5rem] flex items-center justify-center shadow-sm overflow-hidden">
            <motion.div 
              animate={{ rotate: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </motion.div>
          </div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">MediScribe AI</h1>
        </div>
        
        <nav className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-slate-500 hover:text-[#0d9488] transition-all text-[13px] font-semibold">
            <LayoutGrid className="w-4 h-4" />
            Workspace
          </button>
          <button className="flex items-center gap-2 text-slate-500 hover:text-[#0d9488] transition-all text-[13px] font-semibold">
            <History className="w-4 h-4" />
            History
          </button>
        </nav>
      </motion.header>
      
      <main className="flex-1 mt-16 max-w-7xl mx-auto px-6 py-12 w-full">
        {children}
      </main>
      
      <footer className="py-8 text-center text-slate-400 text-[11px] font-medium tracking-wide">
        &copy; 2024 MEDSCRIBE AI &bull; CLINICAL INTELLIGENCE UNIT
      </footer>
    </div>
  );
};

export default Layout;
