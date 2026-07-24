export default function CategoryPulse({ transactions }: { transactions: any[] }) {
  const categories = ["Food", "Bills", "Transport", "Other"];
  const total = transactions.reduce((acc, t) => acc + t.actualSpent, 0);

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {categories.map(cat => {
        const spent = transactions.filter(t => t.category === cat).reduce((acc, t) => acc + t.actualSpent, 0);
        const percentage = total > 0 ? (spent / total) * 100 : 0;
        
        return (
          <div key={cat} className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-1">
               <span className="text-[9px] font-black uppercase text-slate-400">{cat}</span>
               <span className="text-[9px] font-black text-slate-900">{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full" style={{ width: `${percentage}%` }}></div>
            </div>
          </div>
        )
      })}
    </div>
  );
}