import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import MonthCollapse from "@/components/MonthCollapse";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Activity, PieChart, Info } from "lucide-react";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!dbUser) redirect("/");

  const months = await prisma.monthlyBudget.findMany({
    where: { householdId: dbUser.householdId },
    include: {
      cycles: { include: { transactions: true }, orderBy: { cycleNumber: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="flex min-h-screen bg-[#f0fafa]">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
          <header>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={18} className="text-teal-600" />
              <p className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em]">Longitudinal Archive</p>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Financial History</h1>
            <p className="text-slate-400 text-sm mt-2">Audit your previous liquidity cycles and spending behavior.</p>
          </header>

          {months.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-teal-100 flex flex-col items-center">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                  <Info size={32} />
               </div>
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No historical data recorded yet.</p>
            </div>
          ) : (
            months.map((month) => {
              // 1. Calculate the max value for this specific month's chart scaling
              const weekSpends = month.cycles.map(w => 
                w.transactions.filter((t:any) => t.type === 'EXPENSE').reduce((a:any, b:any) => a + b.actualSpent, 0)
              );
              const maxSpentInMonth = Math.max(...weekSpends, ...month.cycles.map(w => w.limitAmount), 100);
              const ceiling = maxSpentInMonth * 1.3;

              return (
                <MonthCollapse key={month.id} month={month}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* CHART COLUMN (2/3 width) */}
                    <div className="lg:col-span-2 bg-slate-50 p-8 rounded-[2.5rem] border border-teal-50 shadow-inner">
                      <div className="relative h-60 w-full grid grid-cols-4 items-end gap-2 px-2 border-b-2 border-slate-200 pb-1">
                        
                        {month.cycles.map((week: any) => {
                          const spent = week.transactions.filter((t:any) => t.type === 'EXPENSE').reduce((a:any, b:any) => a + b.actualSpent, 0);
                          const barHeight = (spent / ceiling) * 100;
                          const limitPos = (week.limitAmount / ceiling) * 100;

                          return (
                            <div key={week.id} className="relative flex flex-col items-center h-full justify-end z-10">
                              {/* WEEKLY LIMIT LINE */}
                              <div 
                                className="absolute w-full border-t border-dashed border-rose-300 z-0 opacity-50" 
                                style={{ bottom: `${limitPos}%` }}
                              ></div>
                              
                              <span className={`text-[10px] font-black mb-2 ${spent > week.limitAmount ? 'text-rose-500' : 'text-slate-900'}`}>
                                {spent.toFixed(0)}
                              </span>

                              {/* THE BAR - Fixed width to prevent disappearing */}
                              <div 
                                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-1000 shadow-md ${spent > week.limitAmount ? 'bg-rose-500' : 'bg-teal-500'}`}
                                style={{ 
                                  height: `${Math.max(barHeight, 4)}%`,
                                  minHeight: '8px' // Force visibility even if spend is 0
                                }}
                              >
                                 <div className="w-full h-full bg-white/10 rounded-t-xl"></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-tighter">WK {week.cycleNumber}</span>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-[8px] text-slate-300 font-black uppercase mt-4 text-center tracking-[0.2em]">Weekly Distribution View</p>
                    </div>

                    {/* SPENDING AREAS COLUMN (1/3 width) */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-teal-50 shadow-sm">
                      <div className="flex items-center gap-2 mb-8 text-slate-400">
                        <PieChart size={16} className="text-teal-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Expense Concentration</span>
                      </div>
                      
                      <div className="space-y-6">
                        {["Food", "Bills", "Transport", "Other"].map(cat => {
                          const catTotal = month.cycles
                            .flatMap(c => c.transactions)
                            .filter(t => t.type === 'EXPENSE' && t.category === cat)
                            .reduce((a, b) => a + b.actualSpent, 0);
                          
                          const monthTotalExpenses = weekSpends.reduce((a, b) => a + b, 0);
                          const percentage = monthTotalExpenses > 0 ? (catTotal / monthTotalExpenses) * 100 : 0;

                          return (
                            <div key={cat} className="group">
                               <div className="flex justify-between items-center mb-2">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-teal-600 transition-colors">{cat}</p>
                                  <p className="text-xs font-black text-slate-900">{catTotal.toFixed(0)} <span className="text-[9px] text-slate-300">GHS</span></p>
                               </div>
                               <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-teal-500 h-full transition-all duration-700" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                               </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                  </div>
                </MonthCollapse>
              )
            })
          )}
        </div>
      </main>
    </div>
  );
}