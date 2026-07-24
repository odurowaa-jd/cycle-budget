"use client"
import { addTransaction } from "@/app/actions"
import { useRef, useState } from "react"
import { PlusCircle, MinusCircle, Wallet, Tag } from "lucide-react"

export default function AddExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [type, setType] = useState("EXPENSE")

  return (
    <form 
      ref={formRef}
      action={async (formData) => {
        formData.append("type", type)
        await addTransaction(formData)
        formRef.current?.reset()
        setType("EXPENSE")
      }}
      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-teal-50 space-y-6"
    >
      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
        <button 
          type="button" 
          onClick={() => setType("EXPENSE")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${type === "EXPENSE" ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"}`}
        >
          <MinusCircle size={14} /> Outflow
        </button>
        <button 
          type="button" 
          onClick={() => setType("INCOME")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${type === "INCOME" ? "bg-white text-teal-600 shadow-sm" : "text-slate-400"}`}
        >
          <PlusCircle size={14} /> Inflow
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <span className="absolute left-4 top-4 text-slate-400"><Tag size={18} /></span>
          <input name="itemName" required placeholder={type === "EXPENSE" ? "What's this for?" : "Source of income"} className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 font-bold outline-none" />
        </div>

        <div className="relative">
          <span className="absolute left-4 top-4 text-slate-400"><Wallet size={18} /></span>
          <select name="category" className="w-full pl-12 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 font-bold outline-none appearance-none">
            {type === "EXPENSE" ? (
              <>
                <option value="Food">🍅 Food & Groceries</option>
                <option value="Bills">💡 Monthly Bills</option>
                <option value="Transport">🚕 Transport</option>
                <option value="Other">📦 Other Expenses</option>
              </>
            ) : (
              <>
                <option value="Salary">💰 Monthly Salary</option>
                <option value="Gift">🎁 Personal Gift</option>
                <option value="Donation">🤲 Donation</option>
                <option value="Other">✨ Other Income</option>
              </>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input name="amountTaken" type="number" step="0.01" required placeholder="Amount" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 font-bold outline-none" />
          {type === "EXPENSE" && (
            <input name="amountReturned" type="number" step="0.01" placeholder="Change" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-teal-500 font-bold outline-none" />
          )}
        </div>
      </div>

      <button type="submit" className={`w-full py-5 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${type === "EXPENSE" ? "bg-slate-900 shadow-slate-200" : "bg-teal-600 shadow-teal-200"}`}>
        CONFIRM {type}
      </button>
    </form>
  )
}