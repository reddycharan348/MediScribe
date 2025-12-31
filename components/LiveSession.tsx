
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, AlertCircle, Info, Activity } from 'lucide-react';

interface LiveSessionProps {
  onComplete: (transcript: string) => void;
  isRoleplay?: boolean;
}

const LiveSession: React.FC<LiveSessionProps> = ({ onComplete, isRoleplay = false }) => {
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  const timerRef = useRef<number | null>(null);
  const sessionRef = useRef<any>(null);
  const transcriptionBuffer = useRef<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      analyserRef.current = audioContextRef.current.createAnalyser();
      const sourceNode = audioContextRef.current.createMediaStreamSource(streamRef.current);
      sourceNode.connect(analyserRef.current);
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            timerRef.current = window.setInterval(() => setElapsed(prev => prev + 1), 1000);

            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setAudioLevel(Math.sqrt(sum / inputData.length) * 100);

              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            sourceNode.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              transcriptionBuffer.current += (text + ' ');
              setTranscript(transcriptionBuffer.current);
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              transcriptionBuffer.current += (text + ' ');
              setTranscript(transcriptionBuffer.current);
            }
          },
          onerror: (e) => console.error('Gemini error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: isRoleplay 
            ? "You are a patient in a medical student simulation. Answer questions naturally, describing your symptoms accurately. Stay in character. Do not give medical advice."
            : "You are a silent scribe. Accurately transcribe the conversation between the doctor and patient. Do not speak unless spoken to. Focus on medical clinical data.",
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start live session:', err);
      alert('Error starting live session. Please check your microphone permissions.');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    onComplete(transcriptionBuffer.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${isActive ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
              {isActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Duration</p>
              <span className="font-mono text-xl font-bold">{formatTime(elapsed)}</span>
            </div>
          </div>
          
          {isActive && (
            <div className="flex gap-1 items-end h-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-blue-500 rounded-full"
                  style={{ height: `${Math.max(4, Math.random() * audioLevel + 8)}px` }}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8">
          {!isActive ? (
            <div className="text-center py-8">
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isRoleplay ? 'Practice Clinical Roleplay' : 'Start Clinical Scribing'}
              </h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
                {isRoleplay 
                  ? 'Talk to a simulated AI patient to refine your diagnostic and communication skills.'
                  : 'Gemini will record and structure the dialogue of your real patient encounter.'}
              </p>
              <button 
                onClick={startSession}
                className={`px-8 py-3 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-3 mx-auto ${isRoleplay ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <Mic className="w-4 h-4" />
                {isRoleplay ? 'Start Roleplay' : 'Start Recording'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6 h-60 overflow-y-auto border border-slate-100 custom-scrollbar">
                {transcript ? (
                  <p className="text-slate-700 leading-relaxed text-sm font-medium">
                    {transcript}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <Activity className="w-6 h-6 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest">Awaiting Audio Stream...</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={stopSession}
                  className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                >
                  Finish & Generate Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
