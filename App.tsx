
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import LiveSession from './components/LiveSession';
import AudioUploader from './components/AudioUploader';
import ManualEntry from './components/ManualEntry';
import ReportCard from './components/ReportCard';
import { SessionMode, MedicalReport } from './types';
import { geminiService } from './services/geminiService';
import { 
  Mic, 
  Upload, 
  Edit3, 
  MessageCircle, 
  BrainCircuit, 
  Zap,
  ChevronRight
} from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<SessionMode>(SessionMode.IDLE);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Initializing...');
  const [interimTranscript, setInterimTranscript] = useState<string | null>(null);

  const [quickQuery, setQuickQuery] = useState('');
  const [quickResponse, setQuickResponse] = useState<string | null>(null);
  const [isQuickLoading, setIsQuickLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const handleTranscriptionReady = async (transcript: string) => {
    if (!transcript) { return setMode(SessionMode.IDLE); }
    setInterimTranscript(transcript);
    setMode(SessionMode.ANALYZING);
    setLoadingStep('Clinical Synthesis...');
    try {
      const result = await geminiService.analyzeConversation(transcript);
      setReport(result);
      setMode(SessionMode.COMPLETED);
    } catch (err) {
      console.error(err);
      alert('Analysis failed.');
      setMode(SessionMode.IDLE);
    }
  };

  const handleQuickAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    setIsQuickLoading(true);
    try {
      const res = await geminiService.getQuickAdvice(quickQuery);
      setQuickResponse(res);
    } catch (err) {
      setQuickResponse("Analysis error.");
    } finally {
      setIsQuickLoading(false);
    }
  };

  const FeatureCard = ({ icon: Icon, color, title, desc, buttonText, onClick, isNew = false }: any) => (
    <motion.div 
      variants={itemVariants}
      className="apple-card rounded-[2rem] p-10 flex flex-col items-center text-center group cursor-pointer"
      onClick={onClick}
    >
      <div className={`w-14 h-14 ${color.bg} ${color.text} rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover:scale-110 duration-500`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-[17px] font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-[13px] text-slate-500 mb-8 leading-relaxed font-medium px-4 opacity-80">
        {desc}
      </p>
      <div className={`mt-auto flex items-center gap-1.5 text-xs font-bold ${color.text} tracking-wider uppercase`}>
        {buttonText} <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </motion.div>
  );

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {mode === SessionMode.IDLE && (
          <motion.div 
            key="idle"
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.98 }}
            variants={containerVariants}
            className="space-y-24"
          >
            {/* Hero Section */}
            <motion.div variants={itemVariants} className="text-center space-y-8 max-w-4xl mx-auto pt-10">
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#1d1d1f] tracking-tight leading-[1.1]">
                Intelligence for the <br /><span className="text-[#0d9488]">Modern Clinic.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                Seamlessly convert patient encounters into professional SOAP reports with advanced AI synthesis.
              </p>
            </motion.div>

            {/* Grid of Cards */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard 
                icon={Mic}
                title="Live Scribe"
                desc="Record consultations in real-time. Automated speaker diarization."
                buttonText="Start Session"
                color={{ bg: 'bg-[#fff1f2]', text: 'text-[#e11d48]', btn: 'bg-[#e11d48]' }}
                onClick={() => setMode(SessionMode.LIVE_RECORDING)}
              />
              <FeatureCard 
                icon={Upload}
                title="Cloud Upload"
                desc="Process existing clinical audio/video files securely."
                buttonText="Upload Media"
                color={{ bg: 'bg-[#eff6ff]', text: 'text-[#2563eb]', btn: 'bg-[#2563eb]' }}
                onClick={() => setMode(SessionMode.UPLOAD)}
              />
              <FeatureCard 
                icon={Edit3}
                title="Scribe Notes"
                desc="Manually input encounter notes for rapid structuring."
                buttonText="Compose Note"
                color={{ bg: 'bg-[#fffbeb]', text: 'text-[#f59e0b]', btn: 'bg-[#f59e0b]' }}
                onClick={() => setMode(SessionMode.MANUAL)}
              />
              <FeatureCard 
                icon={MessageCircle}
                title="Clinical Simulator"
                desc="Practice with a diverse range of AI-driven patient personas."
                buttonText="Enter Sim"
                color={{ bg: 'bg-[#f0fdfa]', text: 'text-[#0d9488]', btn: 'bg-[#0d9488]' }}
                isNew={true}
                onClick={() => setMode(SessionMode.ROLEPLAY)}
              />
            </motion.div>

            {/* Quick Analysis */}
            <motion.div variants={itemVariants} className="apple-card rounded-[2.5rem] p-10 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-slate-400" />
                </div>
                <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Rapid Insights</h4>
              </div>
              <form onSubmit={handleQuickAnalysis} className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder="Ask a quick clinical question or log an observation..."
                  className="flex-1 bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-[#0d9488]/5 focus:border-[#0d9488] outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={isQuickLoading || !quickQuery.trim()}
                  className="bg-[#1d1d1f] text-white px-8 py-4 rounded-2xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isQuickLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Scribe'}
                </button>
              </form>
              
              <AnimatePresence>
                {quickResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-teal-50/50 rounded-2xl border border-teal-100 text-[13px] text-teal-800 font-medium leading-relaxed italic"
                  >
                    {quickResponse}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* Loading / Analyzing State */}
        {mode === SessionMode.ANALYZING && (
          <motion.div 
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 space-y-12"
          >
            <div className="relative">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 className="absolute -inset-10 bg-[#0d9488]/10 rounded-full blur-3xl"
               />
               <BrainCircuit className="w-20 h-20 text-[#0d9488] relative z-10" />
            </div>
            <div className="text-center space-y-4 relative z-10">
              <h2 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">{loadingStep}</h2>
              <div className="flex gap-1.5 justify-center items-center">
                 {[0, 1, 2].map(i => (
                   <motion.div 
                     key={i}
                     animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }}
                     transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity }}
                     className="w-1.5 h-1.5 rounded-full bg-[#0d9488]"
                   />
                 ))}
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 mt-4">Processing via Gemini Flash Engine</p>
            </div>
          </motion.div>
        )}

        {mode === SessionMode.COMPLETED && report && (
          <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ReportCard report={report} onReset={() => setMode(SessionMode.IDLE)} />
          </motion.div>
        )}

        {/* Integration of other states */}
        {(mode === SessionMode.LIVE_RECORDING || mode === SessionMode.ROLEPLAY) && (
          <div className="max-w-4xl mx-auto pt-10">
             <button onClick={() => setMode(SessionMode.IDLE)} className="mb-10 text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2">
               &larr; Back to Dashboard
             </button>
             <LiveSession onComplete={handleTranscriptionReady} isRoleplay={mode === SessionMode.ROLEPLAY} />
          </div>
        )}

        {mode === SessionMode.UPLOAD && (
          <div className="max-w-4xl mx-auto pt-10">
             <button onClick={() => setMode(SessionMode.IDLE)} className="mb-10 text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2">
               &larr; Back to Dashboard
             </button>
             <AudioUploader 
               onUpload={async (b, t) => {
                 setMode(SessionMode.ANALYZING);
                 try {
                   setLoadingStep('Transcribing...');
                   const transcript = await geminiService.processAudioFile(b, t);
                   setInterimTranscript(transcript);
                   setLoadingStep('Synthesizing...');
                   const res = await geminiService.analyzeConversation(transcript);
                   setReport(res);
                   setMode(SessionMode.COMPLETED);
                 } catch (error) {
                   console.error(error);
                   setMode(SessionMode.IDLE);
                 }
               }} 
               isProcessing={mode === SessionMode.ANALYZING} 
             />
          </div>
        )}

        {mode === SessionMode.MANUAL && (
          <div className="max-w-4xl mx-auto pt-10">
             <button onClick={() => setMode(SessionMode.IDLE)} className="mb-10 text-[13px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2">
               &larr; Back to Dashboard
             </button>
             <ManualEntry 
               onSubmit={async (t) => {
                 setMode(SessionMode.ANALYZING);
                 try {
                   setLoadingStep('Analyzing Notes...');
                   const res = await geminiService.analyzeConversation(t);
                   setReport(res);
                   setMode(SessionMode.COMPLETED);
                 } catch (error) {
                   console.error(error);
                   setMode(SessionMode.IDLE);
                 }
               }}
               isProcessing={mode === SessionMode.ANALYZING}
             />
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default App;
