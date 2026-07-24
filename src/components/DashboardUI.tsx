"use client"

import { useState, useTransition } from "react";
import Sidebar from "./Sidebar";
import AnalysisChart from "./AnalysisChart";
import AddExpenseForm from "./AddExpenseForm";
import TopUpButton from "./TopUpButton";
import { UserButton } from "@clerk/nextjs";
import { 
  Landmark, 
  Wallet, 
  Activity, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Zap, 
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import SetLimitModal from "./SetLimitModal";
import { deleteTransaction } from "@/app/actions";

export default function DashboardUI({ activeCycle, month, vaultReserve, totalPool, wRemaining, cur }: any) {
  const [modal, setModal] = useState<{show: boolean, mode: 'EDIT' | 'SETTLE'}>({show: false, mode: 'EDIT'});
  const [isPending, startTransition] = useTransition();

  const totalAllocated = totalPool - vaultReserve;
  const vaultUsagePercent = (totalAllocated / totalPool) * 100;
  
  const weeklyLimit = activeCycle.limitAmount;
  const weeklySpent = weeklyLimit - wRemaining;
  const weeklyUsagePercent = (weeklySpent / weeklyLimit) * 100;

  return (
    <div className="flex min-h-screen bg-[#f0fafa]">
      <Sidebar />
      
      {/* THE MODAL - Ensure it is rendered here */}
      <SetLimitModal 
        isOpen={modal.show} 
        onClose={() => setModal({...modal, show: false})} 
        mode={modal.mode} 
        currentCycleId={activeCycle.id} 
        suggestedLimit={activeCycle.limitAmount} 
      />

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <header className="flex justify-between items-center ml-14 lg:ml-0">
            <div className="group">
              <div className="flex items-center gap-3">
                 <div className="bg-teal-500 p-2 rounded-2xl text-slate-900 shadow-lg shadow-teal-200">
                    <Zap size={28} fill="currentColor" />
                 </div>
                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">CycleBudget</h1>
              </div>
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] mt-3 flex items-center gap-2">
                <ShieldCheck size={12} /> Strategic Liquidity Management Protocol
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4 bg-white p-2 pr-5 rounded-full shadow-xl border border-teal-50">
               <UserButton />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">System Operator</p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-8">
              
              {/* VAULT */}
              <div className="bg-white p-10 rounded-[3.5rem] border border-teal-100 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-2 text-slate-400">
                   <Landmark size={16}/> 
                   <p className="text-[10px] font-black uppercase tracking-widest">Unallocated Vault Reserve</p>
                </div>
                <h3 className="text-6xl font-black text-slate-900 tracking-tighter mb-8">
                  {vaultReserve.toFixed(0)}<span className="text-xl ml-2 text-teal-400">{cur}</span>
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase">
                        <span>Portfolio Allocation</span>
                        <span>{vaultUsagePercent.toFixed(0)}% Utilized</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full transition-all duration-1000" style={{ width: `${Math.min(vaultUsagePercent, 100)}%` }}></div>
                    </div>
                </div>
              </div>

              {/* WALLET */}
              <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group border-t border-white/10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-teal-400">
                    <Wallet size={16}/>
                    <p className="text-[10px] font-black uppercase tracking-widest">Cycle Wallet (W{activeCycle.cycleNumber})</p>
                  </div>
                  {/* EDIT BUTTON FIX */}
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setModal({show: true, mode: 'EDIT'});
                    }} 
                    className="p-3 bg-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/20 transition-all z-20"
                  >
                    <Edit3 size={20}/>
                  </button>
                </div>
                <h2 className="text-7xl font-black tracking-tighter mb-8">{wRemaining.toFixed(0)}<span className="text-xl ml-2 text-slate-600">{cur}</span></h2>
                <TopUpButton />
                
                <div className="mt-12 space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Weekly Burn Rate: {weeklyUsagePercent.toFixed(0)}%</span>
                    <span>Cap: {weeklyLimit.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-4 rounded-full p-1 border border-slate-800">
                    <div className={`h-full rounded-full transition-all duration-1000 ${weeklyUsagePercent > 85 ? 'bg-rose-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(weeklyUsagePercent, 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <AddExpenseForm />
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-8 rounded-[3.5rem] shadow-2xl border border-teal-50">
                 <div className="flex items-center gap-2 mb-8 ml-2">
                    <Activity size={18} className="text-teal-500" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Velocity Analysis</h3>
                 </div>
                 <AnalysisChart cycles={month.cycles} />
              </div>

              <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-teal-50">
                <h3 className="font-black text-slate-900 uppercase text-xs mb-8 border-b border-teal-50 pb-4 tracking-widest">Transaction Ledger</h3>
                <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                   {activeCycle.transactions.length === 0 && <p className="text-center py-20 text-slate-300 italic">No flow detected this week.</p>}
                   {[...activeCycle.transactions].reverse().map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center group p-3 hover:bg-slate-50 rounded-[1.5rem] transition-all">
                         <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                               {t.type === 'INCOME' ? <TrendingUp size={20}/> : <ArrowDownRight size={20}/>}
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-sm leading-none mb-1">{t.itemName}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t.category}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <p className={`font-black text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'}`}>
                              {t.type === 'INCOME' ? '+' : '-'}{Math.abs(t.actualSpent).toLocaleString()}
                            </p>
                            <button 
                              onClick={() => startTransition(async () => await deleteTransaction(t.id))}
                              className="text-slate-200 hover:text-rose-500 transition-colors p-2"
                            >
                              <Trash2 size={18}/>
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
              </div>

              <button 
                onClick={() => setModal({show: true, mode: 'SETTLE'})} 
                className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[2.5rem] shadow-2xl transition-all uppercase text-[10px] tracking-[0.4em]"
              >
                Settle Week {activeCycle.cycleNumber} & Release Funds
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}