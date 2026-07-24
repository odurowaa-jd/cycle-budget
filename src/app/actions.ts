"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { TransactionType } from "@prisma/client"

export async function addTransaction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) return;
  const itemName = formData.get("itemName") as string
  const amountTaken = parseFloat(formData.get("amountTaken") as string)
  const amountReturned = parseFloat(formData.get("amountReturned") as string) || 0
  const category = formData.get("category") as string
  const type = formData.get("type") as TransactionType || "EXPENSE"
  const actualSpent = type === "INCOME" ? -amountTaken : (amountTaken - amountReturned)

  const activeCycle = await prisma.cycle.findFirst({
    where: { isClosed: false, monthlyBudget: { household: { users: { some: { clerkId: userId } } } } },
  })
  if (!activeCycle) throw new Error("No active cycle found")

  await prisma.transaction.create({
    data: { itemName, amountTaken, amountReturned, actualSpent, category, type, cycleId: activeCycle.id },
  })
  revalidatePath("/")
}

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
}

export async function updateWeeklyLimit(cycleId: string, newLimit: number) {
  await prisma.cycle.update({
    where: { id: cycleId },
    data: { limitAmount: newLimit }
  });
  revalidatePath("/");
}

export async function addTopUp(amount: number) {
  const { userId } = await auth();
  if (!userId) return;

  const activeCycle = await prisma.cycle.findFirst({
    where: { isClosed: false, monthlyBudget: { household: { users: { some: { clerkId: userId } } } } },
  })
  if (!activeCycle) return;

  await prisma.cycle.update({
    where: { id: activeCycle.id },
    data: { limitAmount: { increment: amount } },
  })
  revalidatePath("/");
}

export async function startNewMonth(formData: FormData) {
    const { userId } = await auth();
    const totalLimit = parseFloat(formData.get("totalLimit") as string);
    const weeklyLimit = parseFloat(formData.get("weeklyLimit") as string);
    const currency = formData.get("currency") as string;
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });
    
    await prisma.household.update({ where: { id: dbUser!.householdId }, data: { currency } });
    const newMonth = await prisma.monthlyBudget.create({
      data: {
        monthName: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date()),
        year: new Date().getFullYear(),
        totalLimit,
        householdId: dbUser!.householdId
      }
    });
    await prisma.cycle.create({
      data: { cycleNumber: 1, limitAmount: weeklyLimit, startDate: new Date(), monthlyBudgetId: newMonth.id }
    });
    revalidatePath("/");
}

export async function closeAndStartNextCycle(currentCycleId: string, nextWeekLimit: number) {
    const { userId } = await auth();
    if (!userId) return;

    const currentCycle = await prisma.cycle.findUnique({
      where: { id: currentCycleId },
      include: { transactions: true }
    });
    if (!currentCycle) return;

    const spent = currentCycle.transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.actualSpent, 0);
    const income = currentCycle.transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + Math.abs(t.actualSpent), 0);
    const surplus = (currentCycle.limitAmount + income) - spent;
    const rollover = surplus > 0 ? surplus : 0;

    await prisma.cycle.update({ where: { id: currentCycleId }, data: { isClosed: true } });

    if (currentCycle.cycleNumber < 4) {
      await prisma.cycle.create({
        data: {
          cycleNumber: currentCycle.cycleNumber + 1,
          limitAmount: nextWeekLimit + rollover,
          rolloverAmount: rollover,
          startDate: new Date(),
          monthlyBudgetId: currentCycle.monthlyBudgetId,
        },
      });
    }
    revalidatePath("/");
}