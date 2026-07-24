"use client"
import { addTopUp } from "@/app/actions"
import { Plus } from "lucide-react"

export default function TopUpButton() {
  const handleTopUp = async () => {
    const amount = prompt("How much would you like to move from the Vault to this Week?");
    if (amount && !isNaN(Number(amount))) {
      await addTopUp(Number(amount));
    }
  }

  return (
    <button 
      onClick={handleTopUp}
      className="flex items-center gap-2 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-teal-500/30"
    >
      <Plus size={14} /> Quick Top-Up
    </button>
  )
}