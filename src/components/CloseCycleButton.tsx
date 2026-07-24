"use client"
import { closeAndStartNextCycle } from "@/app/actions"
import { useTransition } from "react"
import { Power } from "lucide-react"

export default function CloseCycleButton({ 
  cycleId, 
  cycleNumber, 
  nextAmount 
}: { 
  cycleId: string, 
  cycleNumber: number, 
  nextAmount: number 
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="pt-6 border-t border-teal-50">
      <button 
        disabled={isPending}
        onClick={() => {
          if (confirm(`Close Week ${cycleNumber}? This will release your next allotment.`)) {
            startTransition(() => closeAndStartNextCycle(cycleId, nextAmount))
          }
        }}
        className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-slate-400"
      >
        <Power size={18} />
        {isPending ? "Re-calculating..." : `Settle Week ${cycleNumber} & Reset`}
      </button>
      <p className="text-[9px] text-slate-400 font-black uppercase text-center mt-4 tracking-widest">
        Next disbursement: <span className="text-teal-600">{nextAmount.toFixed(0)}</span> per protocol
      </p>
    </div>
  )
}