import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, RefreshCw, Flame, Activity } from 'lucide-react';
import CrystalizedBall from '../ui/CrystalizedBall/CrystalizedBall';
import { chatWithGemini } from '../../services/geminiTriageService';

export default function CopilotDrawer({
  isOpen,
  onClose,
  currentUser
}) {
  const [copilotPreset, setCopilotPreset] = useState('plasma');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${currentUser?.name || 'Clinician'}. I am the MediQueue Trained Triage Copilot powered by Google Gemini. Ask me about ESI v4 criteria, acute coronary syndromes, red flag symptoms, or drug interactions.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend) return;

    if (!customPrompt) setInput('');
    const userMsg = { sender: 'user', text: textToSend };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsAnalyzing(true);

    try {
      const response = await chatWithGemini(textToSend, updated);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
      if (textToSend.toLowerCase().includes('critical') || textToSend.toLowerCase().includes('emergency') || textToSend.toLowerCase().includes('arrest')) {
        setCopilotPreset('ember');
      } else {
        setCopilotPreset('plasma');
      }
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Clinical Decision System: Patient stability indicators should be evaluated against ESI v4 protocol. Alert attending physician for any physiological decompensation.'
        }
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const QUICK_PROMPTS = [
    'Assess STEMI chest pain protocol',
    'Verify pediatric respiratory distress signs',
    'Check anaphylaxis triage criteria',
    'Sepsis qSOFA score thresholds'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col p-5 shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">MediQueue Clinical AI Copilot</h3>
              <p className="text-[10px] text-teal-600 font-mono">GEMINI TRIAGE CDS ENGINE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D WebGL CrystalizedBall Component */}
        <div className="w-full h-36 my-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 relative flex items-center justify-center shadow-inner">
          <CrystalizedBall preset={copilotPreset} size={0.65} />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-mono text-teal-300 border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>NEURAL CDS RUNNING</span>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1 mb-2">
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="text-[10px] bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 px-2 py-1 rounded-lg transition-colors text-left"
            >
              + {qp}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3 min-h-[220px]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-teal-600 text-white ml-6'
                  : 'bg-white text-slate-800 border border-slate-200 mr-4 shadow-sm'
              }`}
            >
              {msg.text}
            </div>
          ))}

          {isAnalyzing && (
            <div className="text-xs text-slate-500 italic p-2 flex items-center gap-2 bg-white rounded-lg border border-slate-200 mr-6">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
              <span>Analyzing clinical symptoms and vitals...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask regarding triage, stat orders, ESI tier..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="mediqueue-input-field text-xs flex-1"
          />
          <button
            onClick={() => handleSend()}
            disabled={isAnalyzing || !input.trim()}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
