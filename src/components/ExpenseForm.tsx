import { useState } from "react";
import { usePeople, useAddExpense } from "../api/hooks";
import { generateId } from "../api/store";
import { Expense } from "../types";

function ExpenseForm() {
  const { data: people = [] } = usePeople();
  const addExpenseMutation = useAddExpense();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [customAmounts, setCustomAmounts] = useState<{ [person: string]: number }>({});
  const handleSplitToggle = (person: string) => {
    setSplitBetween((prev) => {
      if (prev.includes(person)) {
        return prev.filter((p) => p !== person);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleCustomAmountChange = (person: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setCustomAmounts((prev) => ({
      ...prev,
      [person]: numValue,
    }));
  };

  const validateForm = (): string | null => {
    if (!description.trim()) return "Please enter a description";
    if (!amount || parseFloat(amount) <= 0) return "Please enter a valid amount";
    if (!date) return "Please select a date";
    if (!paidBy) return "Please select who paid";
    if (splitBetween.length === 0) return "Please select at least one person to split between";

    if (splitType === 'custom') {
      const totalCustom = splitBetween.reduce((sum, person) => sum + (customAmounts[person] || 0), 0);
      if (Math.abs(totalCustom - parseFloat(amount)) > 0.01) {
        return `Custom amounts ($${totalCustom.toFixed(2)}) must equal total amount ($${parseFloat(amount).toFixed(2)})`;
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpenseMutation.reset();

    const validationError = validateForm();
    if (validationError) {
      addExpenseMutation.mutate({} as Expense, {
        onError: () => { }, // Trigger error state with validation message
      });
      return;
    }

    const expense: Expense = {
      id: generateId(),
      description: description.trim(),
      amount: parseFloat(amount),
      paidBy,
      splitBetween,
      date,
      splitType,
      ...(splitType === 'custom' && { customAmounts }),
    };

    addExpenseMutation.mutate(expense, {
      onSuccess: () => {
        setDescription("");
        setAmount("");
        setDate(new Date().toISOString().split('T')[0]);
        setPaidBy("");
        setSplitBetween([]);
        setCustomAmounts({});
        setSplitType('equal');
      },
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        💸 Add Expense
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block mb-1 text-gray-700 font-medium text-sm"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="What was the expense for?"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 mb-4">
            <label
              htmlFor="amount"
              className="block mb-1 text-gray-700 font-medium text-sm"
            >
              Amount ($)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex-1 mb-4">
            <label
              htmlFor="date"
              className="block mb-1 text-gray-700 font-medium text-sm"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="paidBy"
            className="block mb-1 text-gray-700 font-medium text-sm"
          >
            Paid By
          </label>
          <select
            id="paidBy"
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-base transition-colors focus:outline-none focus:border-indigo-500 cursor-pointer"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            <option value="">Select person...</option>
            {people.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Split Type
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
              <input
                type="radio"
                value="equal"
                name="splitType"
                className="cursor-pointer"
                checked={splitType === 'equal'}
                onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
              />
              <span>Equal Split</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
              <input
                type="radio"
                value="custom"
                name="splitType"
                className="cursor-pointer"
                checked={splitType === 'custom'}
                onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
              />
              <span>Custom Amounts</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-700 font-medium text-sm">
            Split Between
          </label>
          <div className="flex flex-col gap-2">
            {people.map((person) => (
              <div
                key={person}
                className="flex items-center justify-between p-2 bg-gray-50 rounded mb-1"
              >
                <label className="flex items-center gap-2 cursor-pointer px-1 py-1 rounded transition-colors hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="cursor-pointer"
                    checked={splitBetween.includes(person)}
                    onChange={() => handleSplitToggle(person)}
                  />
                  <span>{person}</span>
                </label>
                {splitType === 'custom' && splitBetween.includes(person) && (
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-24 px-2 py-1 border-2 border-gray-200 rounded-md text-sm transition-colors focus:outline-none focus:border-indigo-500"
                    value={customAmounts[person] || ""}
                    onChange={(e) => handleCustomAmountChange(person, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {addExpenseMutation.isError && (
          <div className="bg-red-100 text-red-900 px-3 py-2 rounded-md mb-4 flex items-center gap-2">
            {addExpenseMutation.error?.message || "Failed to add expense"}
          </div>
        )}

        {addExpenseMutation.isSuccess && (
          <div className="bg-green-100 text-green-900 px-3 py-2 rounded-md mb-4 flex items-center gap-2">
            Expense added successfully!
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-medium cursor-pointer transition-all hover:bg-indigo-600 hover:-translate-y-px flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={addExpenseMutation.isPending || people.length === 0}
        >
          {addExpenseMutation.isPending ? "Adding..." : "Add Expense"}
        </button>

        {people.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-2">
            Add people first to create expenses
          </p>
        )}
      </form>
    </div>
  );
}

export default ExpenseForm;
