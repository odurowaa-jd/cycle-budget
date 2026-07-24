"use client"

export default function AnalysisChart({ cycles }: { cycles: any[] }) {
  // Find highest value for scaling to ensure bars don't clip
  const highestValue = Math.max(...cycles.map(c => {
    const spent = c.transactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((acc: number, t: any) => acc + t.actualSpent, 0);
    return Math.max(spent, c.limitAmount);
  }), 100);
  
  const ceiling = highestValue * 1.3; // 30% padding at top

  return (
    <div className="relative h-60 w-full grid grid-cols-4 items-end gap-6 px-4 border-b-2 border-slate-100 pb-1">
      {cycles.sort((a,b) => a.cycleNumber - b.cycleNumber).map((week) => {
        const spent = week.transactions
          .filter((t: any) => t.type === 'EXPENSE')
          .reduce((acc: number, t: any) => acc + t.actualSpent, 0);
        
        const barHeight = (spent / ceiling) * 100;
        const limitPos = (week.limitAmount / ceiling) * 100;

        return (
          <div key={week.id} className="relative flex flex-col items-center h-full justify-end z-10 group">
            {/* UNIQUE LIMIT LINE */}
            <div 
              className="absolute w-full border-t-2 border-dashed border-rose-300 z-0 opacity-40 group-hover:opacity-100 transition-opacity" 
              style={{ bottom: `${limitPos}%` }}
            >
               <span className="absolute -top-4 right-0 text-[7px] font-black text-rose-400 uppercase">Limit</span>
            </div>

            <span className={`text-[10px] font-black mb-2 transition-all ${spent > week.limitAmount ? 'text-rose-500 scale-110' : 'text-slate-900'}`}>
              {spent.toFixed(0)}
            </span>

            <div 
              className={`w-full max-w-[45px] rounded-t-2xl shadow-lg transition-all duration-1000 ease-out ${spent > week.limitAmount ? 'bg-rose-500 shadow-rose-200' : 'bg-teal-500 shadow-teal-100'}`}
              style={{ height: `${Math.max(barHeight, 6)}%` }}
            >
               <div className="w-full h-full bg-white/20 rounded-t-2xl"></div>
            </div>
            <span className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest font-mono">W{week.cycleNumber}</span>
          </div>
        );
      })}
    </div>
  );
}