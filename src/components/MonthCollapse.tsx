"use client"
import { useState } from 'react';
import { ChevronDown, ChevronRight, Calendar, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MonthCollapse({ month, children }: { month: any, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate month-wide stats for the header
  const totalSpent = month.cycles.reduce((acc: number, c: any) => 
    acc + c.transactions.filter((t: any) => t.type === "EXPENSE").reduce((tAcc: number, t: any) => tAcc + t.actualSpent, 0), 0
  );
  
  const totalIncome = month.cycles.reduce((acc: number, c: any) => 
    acc + c.transactions.filter((t: any) => t.type === "INCOME").reduce((tAcc: number, t: any) => tAcc + Math.abs(t.actualSpent), 0), 0
  );

  return (
    <div className="bg-white rounded-[2rem] border border-teal-50 shadow-sm overflow-hidden mb-4 transition-all hover:shadow-md">
      {/* HEADER: Always Visible */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tighter">{month.monthName} {month.year}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {month.cycles.length} Weekly Cycles Recorded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden md:block text-right">
            <div className="flex items-center gap-1 justify-end text-teal-600 font-black text-sm">
              <ArrowUpRight size={14} /> +{totalIncome.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 justify-end text-rose-500 font-black text-sm">
              <ArrowDownRight size={14} /> -{totalSpent.toLocaleString()}
            </div>
          </div>
          
          <div className={`p-2 rounded-full transition-transform ${isOpen ? 'bg-teal-600 text-white rotate-180' : 'bg-slate-100 text-slate-400'}`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </button>

      {/* CONTENT: Hidden until toggled */}
      {isOpen && (
        <div className="p-8 pt-0 border-t border-slate-50 bg-[#fafdfd]">
          <div className="mt-8">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}