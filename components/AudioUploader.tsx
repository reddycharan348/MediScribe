
import React, { useState } from 'react';
import { Upload, FileVideo, FileAudio, ShieldAlert } from 'lucide-react';

interface AudioUploaderProps {
  onUpload: (base64: string, type: string) => void;
  isProcessing: boolean;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onUpload, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      alert('Please upload an audio or video file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onUpload(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div 
        onDragEnter={onDrag}
        onDragLeave={onDrag}
        onDragOver={onDrag}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ${
          dragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-300 bg-white'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-400 hover:bg-slate-50/30'}`}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex -space-x-3">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
              <FileAudio className="w-8 h-8" />
            </div>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner relative z-10 border-4 border-white">
              <FileVideo className="w-8 h-8" />
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900">Upload Clinical Media</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Drag and drop your audio or video recording. Gemini will automatically transcribe and summarize the encounter.
            </p>
          </div>

          <input 
            type="file" 
            id="file-upload" 
            className="hidden" 
            accept="audio/*,video/*"
            disabled={isProcessing}
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          
          <label 
            htmlFor="file-upload"
            className="group px-8 py-3 bg-slate-900 text-white font-bold rounded-xl cursor-pointer hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
          >
            <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            {isProcessing ? 'Analysis in Progress...' : 'Choose Media File'}
          </label>
        </div>
      </div>
      
      {isProcessing && (
        <div className="mt-10 flex flex-col items-center">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
            Processing multimodal clinical data...
          </p>
        </div>
      )}

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            Supported Extensions
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Audio: MP3, WAV, AAC, M4A<br />
            Video: MP4, MOV, WEBM, AVI
          </p>
        </div>
        <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm">
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            De-identification
          </h4>
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            Ensure all media is free of PII before upload. AI processing happens in highly secure ephemeral environments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioUploader;
