
import React, { useState } from 'react';

interface ManualEntryProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
}

const ManualEntry: React.FC<ManualEntryProps> = ({ onSubmit, isProcessing }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 20) {
      alert("Please provide a more detailed note or conversation for analysis.");
      return;
    }
    onSubmit(text);
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-bold text-slate-700">Written Report / Transcript</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{text.length} characters</span>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            placeholder="Type or paste the student-patient conversation here. Example: 'Student: How are you feeling today? Patient: I have a sharp pain in my chest...'"
            className="w-full h-80 p-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none outline-none"
          />
          
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-slate-500 max-w-[60%]">
              Gemini will analyze your text to generate a full SOAP report and structured Q&A.
            </p>
            <button
              type="submit"
              disabled={isProcessing || !text.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Analyzing...' : 'Generate Report'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h4 className="text-xs font-bold text-blue-800 uppercase mb-2">Pro Tip</h4>
          <p className="text-xs text-blue-700 leading-relaxed">
            Include as much dialogue as possible. The AI is trained to distinguish between student questions and patient symptoms automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ManualEntry;
