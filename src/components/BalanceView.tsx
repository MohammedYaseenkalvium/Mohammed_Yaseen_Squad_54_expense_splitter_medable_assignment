import { usePeople, useExpenses } from "../api/hooks";
import {calculateBalances,calculateTotalSpending,simplifyDebts,formatCurrency,getBalanceStatus,getBalanceText} from "../utils/balance";

function BalanceView() {
  const { data: people = [] } = usePeople();
  const { data: expenses = [] } = useExpenses();

  const balances = calculateBalances(expenses);
  const totalSpending = calculateTotalSpending(expenses);
  const simplifiedDebts = simplifyDebts(balances);

  const allSettled = simplifiedDebts.length === 0;

  return (
    <div className="bg-white rounded-xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <h2 className="text-gray-700 mb-4 text-2xl border-b-2 border-gray-200 pb-2">
        💰 Balances
      </h2>

      <div className="flex justify-between items-center p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg mb-6">
          <span>Total Group Spending:</span>
        <strong className="text-2xl">${totalSpending.toFixed(2)}</strong>
      </div>

      <div className="mb-6">
        <h3 className="text-gray-600 my-2 text-lg">Individual Balances</h3>
        {people.length === 0 ? (
            <p className="text-center text-gray-400 py-4 italic">
            Add people to see balances
          </p>
        ) : (
          people.map((person) => {
            const balance = balances[person] || 0;
            const status = getBalanceStatus(balance);
            const balanceText = getBalanceText(balance);
            let statusColor = "text-gray-600";
            let bgColor = "bg-gray-100";
            let borderColor = "border-gray-300";

            if (status === 'owed') {
              statusColor = "text-green-700";
              bgColor = "bg-green-50";
              borderColor = "border-green-300";
            } else if (status === 'owes') {
              statusColor = "text-red-700";
              bgColor = "bg-red-50";
              borderColor = "border-red-300";
            }

            return (
              <div
                key={person}
                className={`flex justify-between items-center px-3 py-3 mb-2 rounded-md transition-all hover:translate-x-1 ${bgColor} border ${borderColor}`}
              >
                <span className="font-medium text-gray-800">{person}</span>
                <span className="flex items-center gap-2">
                  <span className={`text-sm ${statusColor}`}>{balanceText}</span>
                  <strong className={`text-lg ${statusColor}`}>
                    {formatCurrency(balance)}
                      </strong>
                    </span>
              </div>
            );
          })
        )}
      </div>

      {allSettled ? (
        <div className="text-center py-8 bg-green-100 rounded-lg text-green-900 font-medium">
          <p>✅ All balances are settled!</p>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-blue-900 font-semibold mb-3 text-lg">
            💡 Suggested Settlements
          </h3>
          <div className="space-y-2">
            {simplifiedDebts.map((debt, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{debt.from}</span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium text-gray-800">{debt.to}</span>
                </div>
                <span className="font-bold text-indigo-600">
                     ${debt.amount.toFixed(2)}
                  </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-3 text-center">
            {simplifiedDebts.length} {simplifiedDebts.length === 1 ? 'transaction' : 'transactions'} needed to settle all debts
          </p>
        </div>
      )}
    </div>
  );
}

export default BalanceView;
