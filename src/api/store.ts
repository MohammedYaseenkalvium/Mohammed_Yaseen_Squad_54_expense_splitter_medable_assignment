import { Expense } from "../types";
import { initialExpenses, initialPeople } from "../initialData";

let people = initialPeople;
let expenses = initialExpenses;

let nextId = Math.max(...initialExpenses.map(e => e.id), 0) + 1;

export const generateId = (): number => {
    return nextId++;
};

const validatePersonName = (name: string): void => {
    if (!name || !name.trim()) {
        throw new Error("Person name cannot be empty");
    }
};

const validateExpense = (expense: Expense): void => {
    if (!expense.description || !expense.description.trim()) {
        throw new Error("Expense description cannot be empty");
    }
    if (expense.amount <= 0) {
        throw new Error("Expense amount must be positive");
    }
    if (!expense.paidBy || !expense.paidBy.trim()) {
        throw new Error("Expense must have a payer");
    }
    if (!expense.splitBetween || expense.splitBetween.length === 0) {
        throw new Error("Expense must be split between at least one person");
    }
    if (expense.splitType === 'custom' && expense.customAmounts) {
        const total = Object.values(expense.customAmounts).reduce((sum, amt) => sum + amt, 0);
        if (Math.abs(total - expense.amount) > 0.01) {
            throw new Error("Custom amounts must sum to total expense amount");
        }
    }
};

export const getPeople = async () => people;

export const addPerson = async (name: string) => {
    validatePersonName(name);
    const trimmedName = name.trim();

    if (!people.includes(trimmedName)) {
        people.push(trimmedName);
    }
    return people;
};

export const removePerson = async (name: string) => {
    people = people.filter((p) => p !== name);
    expenses = expenses.filter((e) => e.paidBy !== name && !e.splitBetween.includes(name));
    return people;
};

export const getExpenses = async () => expenses;

export const addExpense = async (expense: Expense) => {
    validateExpense(expense);
    expenses.push(expense);
    return expenses;
};

export const removeExpense = async (expenseId: number) => {
    expenses = expenses.filter((e) => e.id !== expenseId);
    return expenses;
};