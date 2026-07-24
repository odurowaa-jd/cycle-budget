import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardUI from "@/components/DashboardUI";
import { startNewMonth } from "./actions";

export default async function Dashboard() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId) redirect("/sign-in");

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { household: true }
  });

  if (!dbUser) {
    const household = await prisma.household.create({ data: { name: `${user?.firstName}'s Home` } });
    dbUser = await prisma.user.create({
      data: { clerkId: userId, email: user?.emailAddresses[0].emailAddress || "", householdId: household.id },
      include: { household: true }
    });
  }

  const month = await prisma.monthlyBudget.findFirst({
    where: { householdId: dbUser.householdId },
    orderBy: { createdAt: "desc" },
    include: { cycles: { include: { transactions: true }, orderBy: { cycleNumber: "asc" } } }
  });

  if (!month || !month.cycles.find(c => !c.isClosed)) {
    return (
      <main className="min-h-screen bg-[#f0f9fa] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-teal-100 text-center">
          <div className="w-20 h-20 bg-teal-600 text-white rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-teal-200">🚀</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">CycleBudget</h2>
          <form action={startNewMonth} className="space-y-4 text-left mt-8">
             <select name="currency" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold ring-1 ring-teal-50"><option value="GHS">🇬🇭 GHS</option><option value="USD">🇺🇸 USD</option></select>
             <input name="totalLimit" type="number" required placeholder="Monthly Reserve" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold ring-1 ring-teal-50" />
             <input name="weeklyLimit" type="number" required placeholder="Initial Weekly Wallet" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold ring-1 ring-teal-50" />
             <button className="w-full bg-teal-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-teal-100">ACTIVATE PROTOCOL</button>
          </form>
        </div>
      </main>
    );
  }

  const activeCycle = month.cycles.find(c => !c.isClosed)!;
  const mIncomes = month.cycles.flatMap(c => c.transactions).filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Math.abs(t.actualSpent), 0);
  const totalPool = month.totalLimit + mIncomes;
  const totalAssigned = month.cycles.reduce((acc, c) => acc + c.limitAmount, 0);
  const vaultReserve = totalPool - totalAssigned;
  const wSpent = activeCycle.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.actualSpent, 0);
  const wRemaining = activeCycle.limitAmount - wSpent;

  return (
    <DashboardUI activeCycle={activeCycle} month={month} vaultReserve={vaultReserve} totalPool={totalPool} wRemaining={wRemaining} cur={dbUser.household.currency} />
  );
}