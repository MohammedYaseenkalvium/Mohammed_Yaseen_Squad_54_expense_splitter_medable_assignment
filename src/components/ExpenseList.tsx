import { useState } from "react";
import { useExpenses, useRemoveExpense } from "../api/hooks";

function ExpenseList() {
  const { data: expenses = [] } = useExpenses();
  const removeExpenseMutation = useRemoveExpense();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (id: number, description: string) => {
    if (window.confirm(`Delete "${description}"?`)) {
      removeExpenseMutation.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        📝 Expense History
      </h2>

      {expenses.length === 0 ? (
        <p className="text-center text-gray-400 py-8 italic">
          No expenses added yet. Add your first expense to get started!
        </p>
      ) : (
        <div>
          {expenses.map((expense) => {
            const isExpanded = expandedId === expense.id;

            return (
              <div
                key={expense.id}
                className="bg-gray-50 rounded-lg mb-4 border border-gray-200 overflow-hidden"
              >
                <div className="p-4 flex justify-between items-center cursor-pointer transition-colors hover:bg-gray-100">
                  <div className="flex-1" onClick={() => toggleExpand(expense.id)}>
                    <h4 className="text-gray-800 mb-1 text-lg whitespace-nowrap overflow-hidden text-ellipsis">
                      {expense.description}
                    </h4>
                    <div className="flex gap-4 text-gray-600 text-sm">
                      <span>{formatDate(expense.date)}</span>
                      <span>Paid by {expense.paidBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-semibold text-gray-700">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <button
                      className="bg-transparent text-red-500 px-2 py-1 transition-colors hover:bg-red-100 rounded disabled:opacity-50"
                      onClick={() => handleDelete(expense.id, expense.description)}
                      disabled={removeExpenseMutation.isPending}
                      aria-label="Delete"
                    >
                      🗑️
                    </button>
                    <button
                      className="bg-transparent text-gray-600 px-2 py-1 transition-colors hover:bg-gray-50"
                      onClick={() => toggleExpand(expense.id)}
                      aria-label="Expand"
                    >
                      {isExpanded ? '▼' : '▶'}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-200 pt-3 bg-white">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Split Type</p>
                        <p className="font-medium text-gray-800">
                          {expense.splitType === 'equal' ? '📊 Equal Split' : '✏️ Custom Split'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Split Between</p>
                        <p className="font-medium text-gray-800">
                          {expense.splitBetween.length} {expense.splitBetween.length === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Individual Shares</p>
                      <div className="space-y-2">
                        {expense.splitBetween.map((person) => {
                          let share = 0;
                          if (expense.splitType === 'equal') {
                            share = expense.amount / expense.splitBetween.length;
                          } else if (expense.customAmounts) {
                            share = expense.customAmounts[person] || 0;
                          }

                          return (
                            <div
                              key={person}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <span className="text-gray-700">{person}</span>
                              <span className="font-semibold text-gray-800">
                                ${share.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-700">
        <p>
          Total Expenses: <strong>{expenses.length}</strong>
        </p>
      </div>
    </div>
  );
}

export default ExpenseList;
