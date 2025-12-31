
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MedicalReport } from '../types';
import { 
  FileDown, 
  ArrowLeft, 
  Info, 
  MessageSquare, 
  Stethoscope,
  Sparkles
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import FileSaver from 'file-saver';

interface ReportCardProps {
  report: MedicalReport;
  onReset: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ report, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadWordDoc = async () => {
    setIsDownloading(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "CONSULTATION REPORT",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              text: report.summaryHeading || "Clinical Encounter",
              heading: HeadingLevel.HEADING_2,
              spacing: { after: 200 },
            }),
            new Paragraph({ text: report.detailedSummary || "", spacing: { after: 400 } }),
            
            new Paragraph({ text: "SOAP NOTE", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: "SUBJECTIVE: ", bold: true }), new TextRun({ text: report.soap?.subjective || "" })] }),
            new Paragraph({ children: [new TextRun({ text: "OBJECTIVE: ", bold: true }), new TextRun({ text: report.soap?.objective || "" })] }),
            new Paragraph({ children: [new TextRun({ text: "ASSESSMENT: ", bold: true }), new TextRun({ text: report.soap?.assessment || "" })] }),
            new Paragraph({ children: [new TextRun({ text: "PLAN: ", bold: true }), new TextRun({ text: report.soap?.plan || "" })] }),

            new Paragraph({ text: "KEY INSIGHTS", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }),
            ...(report.keyInsights?.map(insight => new Paragraph({
              text: `• ${insight}`,
              spacing: { after: 100 }
            })) || []),

            new Paragraph({ text: "CONSULTATION Q&A LOG", heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 100 } }),
            ...(report.questionAnswers?.map(qa => new Paragraph({
              children: [
                new TextRun({ text: `Q: ${qa.question}`, bold: true }),
                new TextRun({ text: `\nA: ${qa.answer}`, italic: true }),
              ],
              spacing: { after: 200 }
            })) || [])
          ],
        }],
      });
      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, `MediScribe_Report_${new Date().toISOString().split('T')[0]}.docx`);
    } catch (e) {
      console.error(e);
      alert("Failed to export Word document.");
    } finally {
      setIsDownloading(false);
    }
  };

  const parseTranscript = (text: string) => {
    if (!text) return [];
    return text.split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const [speaker, ...rest] = line.split(':');
        return { speaker: speaker.trim().toUpperCase(), content: rest.join(':').trim() };
      });
  };

  const messages = parseTranscript(report.fullTranscript || "");

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#0d9488]">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Enhanced Documentation
          </div>
          <h2 className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight">Consultation Report</h2>
          <p className="text-[13px] font-medium text-slate-400">Clinical ID: {new Date().getTime().toString().slice(-6)} &bull; Ready for review</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onReset}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={downloadWordDoc}
            disabled={isDownloading}
            className="bg-[#0d9488] text-white px-8 py-3.5 rounded-2xl flex items-center gap-2.5 font-bold text-sm shadow-lg shadow-teal-900/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {isDownloading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileDown className="w-4 h-4" />}
            Export .DOCX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Summary */}
          <section className="apple-card rounded-[2.5rem] p-10">
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-5 h-5 text-[#0d9488]" />
              <h3 className="text-[15px] font-bold text-[#1d1d1f] uppercase tracking-wider">Executive Summary</h3>
            </div>
            <p className="text-[15px] text-slate-600 leading-relaxed font-medium">
              {report.detailedSummary}
            </p>
          </section>

          {/* SOAP Note */}
          <section className="apple-card rounded-[2.5rem] overflow-hidden">
            <div className="p-10 pb-6 border-b border-slate-100 flex items-center gap-3">
              <Stethoscope className="w-5 h-5 text-[#0d9488]" />
              <h3 className="text-[15px] font-bold text-[#1d1d1f] uppercase tracking-wider">Structured SOAP Note</h3>
            </div>
            <div className="p-10 space-y-12">
              {[
                { label: 'Subjective', val: report.soap?.subjective },
                { label: 'Objective', val: report.soap?.objective },
                { label: 'Assessment', val: report.soap?.assessment },
                { label: 'Plan', val: report.soap?.plan },
              ].map((item, idx) => (
                <div key={idx} className="group">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4 group-hover:text-[#0d9488] transition-colors">{item.label}</h4>
                  <p className="text-[15px] text-slate-700 font-medium leading-relaxed">{item.val || "Data pending..."}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Q&A Section */}
          <section className="apple-card rounded-[2.5rem] p-10">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="w-5 h-5 text-[#0d9488]" />
              <h3 className="text-[15px] font-bold text-[#1d1d1f] uppercase tracking-wider">Encounter Highlights</h3>
            </div>
            <div className="space-y-4 max-h-[420px] overflow-hidden relative">
              {report.questionAnswers?.map((qa, i) => (
                <div key={i} className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:border-teal-100 transition-colors">
                  <p className="text-[13px] font-bold text-slate-800 leading-snug mb-2 flex gap-2">
                    <span className="text-[#0d9488]">Q</span> {qa.question}
                  </p>
                  <p className="text-[13px] font-medium text-slate-500 leading-snug italic flex gap-2">
                    <span className="text-indigo-400">A</span> {qa.answer}
                  </p>
                </div>
              ))}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />
              <div className="text-[9px] text-slate-300 text-center font-black uppercase tracking-[0.3em] pt-4">Visual Constraint: 15 Lines Applied</div>
            </div>
          </section>
        </div>

        {/* Sidebar Area */}
        <div className="lg:col-span-4 space-y-8">
          {/* Key Insights */}
          <section className="bg-teal-50/30 rounded-[2.5rem] border border-teal-100/50 p-10">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-[#0d9488] mb-8">Key Insights</h3>
            <ul className="space-y-6">
              {report.keyInsights?.map((insight, i) => (
                <li key={i} className="flex gap-4 text-[13px] text-[#0d9488] leading-relaxed font-bold group">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#0d9488] shrink-0 group-hover:scale-150 transition-transform" />
                  {insight}
                </li>
              ))}
            </ul>
          </section>

          {/* Transcript Box */}
          <section className="apple-card rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30">
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Transcription Feed</h3>
            </div>
            <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-2 ${msg.speaker === 'STUDENT' ? 'items-end text-right' : 'items-start text-left'}`}>
                  <span className={`text-[9px] font-black tracking-widest uppercase ${msg.speaker === 'STUDENT' ? 'text-[#0d9488]' : 'text-indigo-500'}`}>
                    {msg.speaker}
                  </span>
                  <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed max-w-[95%] border ${
                    msg.speaker === 'STUDENT' 
                      ? 'bg-teal-50/30 text-teal-800 rounded-tr-none border-teal-100' 
                      : 'bg-slate-50/50 text-slate-700 rounded-tl-none border-slate-100'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
