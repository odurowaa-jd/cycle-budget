"use client"
import { useState } from 'react';
import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, History, Menu, X, TrendingUp, ShieldCheck } from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-white rounded-2xl shadow-xl text-teal-600"><Menu size={24} /></button>
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-900 text-white p-8 transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-900"><TrendingUp size={22}/></div>
          <div><h1 className="text-xl font-black tracking-tighter">CycleBudget</h1><p className="text-[9px] text-teal-400 font-bold uppercase tracking-widest">Algorithmic Finance</p></div>
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-3 p-4 bg-slate-800 rounded-2xl font-bold text-sm"><LayoutDashboard size={18}/> Cockpit</Link>
          <Link href="/history" className="flex items-center gap-3 p-4 text-slate-400 hover:text-white font-bold text-sm"><History size={18}/> Analysis</Link>
        </nav>
        <div className="pt-8 border-t border-slate-800 flex items-center gap-4">
          <UserButton /><div className="overflow-hidden"><p className="text-[10px] font-black text-teal-500 uppercase">Verified</p><p className="text-xs font-bold text-white truncate">Active Session</p></div>
        </div>
      </aside>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" />}
    </>
  );
}