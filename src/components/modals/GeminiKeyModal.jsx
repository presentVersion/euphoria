import React, { useState } from 'react';
import { Key, X, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { getGeminiApiKey, setGeminiApiKey } from '../../services/geminiTriageService';

export default function GeminiKeyModal({ isOpen, onClose }) {
  const [keyInput, setKeyInput] = useState(getGeminiApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(keyInput);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-base">Gemini API Key Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Triage & Clinical Decision Support:</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            The app features a trained offline clinical heuristic fallback. Providing your Google Gemini API key enables real-time LLM-driven urgency assessment, ESI scoring, and physiological radar analysis.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="mediqueue-input-field text-xs font-mono"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>API Key Saved Successfully</span>
              </>
            ) : (
              <span className="text-slate-400 font-normal">Active key stored in localStorage</span>
            )}
          </span>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-600/20"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
