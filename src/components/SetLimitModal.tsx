"use client"
import { useState, useEffect } from "react";
import { updateWeeklyLimit, closeAndStartNextCycle } from "@/app/actions";
import { X, ShieldAlert } from "lucide-react";

export default function SetLimitModal({ 
  isOpen, 
  onClose, 
  mode, 
  currentCycleId, 
  suggestedLimit 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  mode: 'EDIT' | 'SETTLE',
  currentCycleId: string,
  suggestedLimit: number
}) {
  const [val, setVal] = useState(suggestedLimit);

  // Sync value when suggestedLimit changes or modal opens
  useEffect(() => {
    setVal(suggestedLimit);
  }, [suggestedLimit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      if (mode === 'EDIT') {
        await updateWeeklyLimit(currentCycleId, val);
      } else {
        await closeAndStartNextCycle(currentCycleId, val);
      }
      onClose();
    } catch (err) {
      console.error("Failed to update limit:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Box */}
      <div className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-teal-50 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
            <ShieldAlert size={24} />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">
          {mode === 'EDIT' ? 'Adjust Limit' : 'Next Allotment'}
        </h3>
        <p className="text-xs font-medium text-slate-500 mb-8 leading-relaxed">
          {mode === 'EDIT' 
            ? "Modify the current week's spending permission." 
            : "Settle this cycle and define the starting liquidity for next week."}
        </p>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-teal-600 uppercase tracking-widest ml-1">New Limit Amount</label>
            <input 
              type="number" 
              value={val} 
              onChange={(e) => setVal(Number(e.target.value))}
              autoFocus
              className="w-full mt-2 p-5 bg-slate-50 rounded-2xl border-none font-black text-3xl text-slate-900 outline-none ring-2 ring-transparent focus:ring-teal-500/20 transition-all"
            />
          </div>

          <button 
            onClick={handleSubmit}
            className="w-full bg-slate-950 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-95"
          >
            {mode === 'EDIT' ? 'UPDATE LIMIT' : 'CONFIRM & SETTLE'}
          </button>
        </div>
      </div>
    </div>
  );
}