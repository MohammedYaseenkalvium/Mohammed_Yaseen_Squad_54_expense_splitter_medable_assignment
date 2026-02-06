import { Balance, Expense, SimplifiedDebt } from "../types";

export function calculateBalances(expenses: Expense[] = []): Balance {
    const balances: Balance = {};

    for (const expense of expenses) {
        const { amount, paidBy, splitBetween, splitType, customAmounts } = expense;

        balances[paidBy] = (balances[paidBy] || 0) + amount;

        if (splitBetween.length === 0) continue;

        if (splitType === 'equal') {
            const share = amount / splitBetween.length;

            for (const person of splitBetween) {
                balances[person] = (balances[person] || 0) - share;
            }
        } else if (splitType === "custom" && customAmounts) {
            for (const person of splitBetween) {
                const share = customAmounts[person] || 0;
                balances[person] = (balances[person] || 0) - share;
            }
        }
    }

    return balances;
}


export function calculateTotalSpending(expenses: Expense[] = []): number {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}


export function simplifyDebts(balances: Balance): SimplifiedDebt[] {
    const debts: SimplifiedDebt[] = [];

    const creditors: { person: string; amount: number }[] = [];
    const debtors: { person: string; amount: number }[] = [];

    for (const [person, balance] of Object.entries(balances)) {
        if (balance > 0.01) {
            creditors.push({ person, amount: balance });
        } else if (balance < -0.01) {
            debtors.push({ person, amount: -balance });
        }
    }

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const amount = Math.min(creditor.amount, debtor.amount);

        if (amount > 0.01) {
            debts.push({
                from: debtor.person,
                to: creditor.person,
                amount: Math.round(amount * 100) / 100
            });
        }

        creditor.amount -= amount;
        debtor.amount -= amount;

        if (creditor.amount < 0.01) i++;
        if (debtor.amount < 0.01) j++;
    }

    return debts;
}


export function formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toFixed(2)}`;
}


export function getBalanceStatus(balance: number): 'owed' | 'owes' | 'settled' {
    if (balance > 0.01) return 'owed';
    if (balance < -0.01) return 'owes';
    return 'settled';
}


export function getBalanceText(balance: number): string {
    const status = getBalanceStatus(balance);
    if (status === 'settled') return 'settled up';
    if (status === 'owed') return `is owed`;
    return `owes`;
}