import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. CLEANUP (Order is important to avoid foreign key errors)
  console.log("Cleaning up database...");
  await prisma.transaction.deleteMany({});
  await prisma.cycle.deleteMany({});
  await prisma.monthlyBudget.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.household.deleteMany({});

  // 2. CREATE HOUSEHOLD (With the new Currency field)
  console.log("Creating Household...");
  const household = await prisma.household.create({
    data: {
      name: "Main Household",
      currency: "GHS",
    },
    select: {
      id: true,
      name: true,
      currency: true,
    },
  });

  // 3. CREATE A SEED USER
  // NOTE: Replace 'user_seed_test' with your actual Clerk ID if you want to see this data
  // when you log in, otherwise the app will create a fresh one for you.
  console.log("Creating User...");
  const seedUser = await prisma.user.create({
    data: {
      clerkId: "user_seed_test", // Placeholder
      email: "test@cyclebudget.com",
      householdId: household.id,
    },
  });

  // 4. CREATE MONTHLY BUDGET
  const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
  const year = new Date().getFullYear();

  console.log(`Creating Monthly Budget for ${monthName}...`);
  const monthlyBudget = await prisma.monthlyBudget.create({
    data: {
      monthName,
      year,
      totalLimit: 2000.0,
      householdId: household.id,
    },
  });

  // 5. CREATE WEEK 1 (Cycle 1)
  console.log("Creating Week 1...");
  const week1 = await prisma.cycle.create({
    data: {
      cycleNumber: 1,
      limitAmount: 500.0,
      rolloverAmount: 0.0,
      startDate: new Date(),
      monthlyBudgetId: monthlyBudget.id,
    },
  });

  // 6. CREATE INITIAL TRANSACTIONS
  console.log("Creating initial transactions...");
  
  // INCOME: Adding 2000 to the month
  await prisma.transaction.create({
    data: {
      itemName: "Opening Balance / Salary",
      amountTaken: 2000.0,
      amountReturned: 0.0,
      actualSpent: -2000.0, // Negative spent = Income
      category: "Salary",
      type: TransactionType.INCOME,
      cycleId: week1.id,
    },
  });

  // EXPENSE: Sample grocery spend
  await prisma.transaction.create({
    data: {
      itemName: "Weekend Groceries",
      amountTaken: 150.0,
      amountReturned: 10.0,
      actualSpent: 140.0, // 150 - 10
      category: "Food",
      type: TransactionType.EXPENSE,
      cycleId: week1.id,
    },
  });

  console.log(`
✅ SEEDING COMPLETE
---------------------------
Household:  ${household.name}
Month:      ${monthName} ${year}
Currency:   ${household.currency}
Status:     Week 1 active with 1 Income & 1 Expense.
  `);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });