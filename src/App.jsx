import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function FinanceTrackerApp() {

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finance-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'Income',
    category: 'Salary',
    amount: '',
    description: '',
  });

  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const categories = [
    'Salary',
    'Business',
    'Freelance',
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Investment',
    'Savings',
    'Health',
    'Other',
  ];

  const addTransaction = () => {
    if (!form.amount) return;

    const newTransaction = {
      ...form,
      id: Date.now(),
      amount: parseFloat(form.amount),
    };

    setTransactions([newTransaction, ...transactions]);

    setForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Income',
      category: 'Salary',
      amount: '',
      description: '',
    });
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = totalIncome - totalExpense;

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const dailyData = sortedTransactions.reduce((acc, transaction) => {
    const existingDay = acc.find((item) => item.date === transaction.date);
    const income = transaction.type === 'Income' ? transaction.amount : 0;
    const expense = transaction.type === 'Expense' ? transaction.amount : 0;

    if (existingDay) {
      existingDay.income += income;
      existingDay.expense += expense;
      existingDay.savings = existingDay.income - existingDay.expense;
    } else {
      acc.push({
        date: transaction.date,
        income,
        expense,
        savings: income - expense,
      });
    }

    return acc;
  }, []);

  const expenseByCategory = transactions
    .filter((transaction) => transaction.type === 'Expense')
    .reduce((acc, transaction) => {
      const existingCategory = acc.find(
        (item) => item.category === transaction.category
      );

      if (existingCategory) {
        existingCategory.amount += transaction.amount;
      } else {
        acc.push({ category: transaction.category, amount: transaction.amount });
      }

      return acc;
    }, []);

  const chartColors = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-2">Personal Finance Tracker</h1>
          <p className="text-gray-500">Track income, expenses, and savings from your phone or PC.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-100 rounded-2xl p-5 shadow">
            <h2 className="text-lg font-semibold">Total Income</h2>
            <p className="text-3xl font-bold mt-2">${totalIncome.toFixed(2)}</p>
          </div>

          <div className="bg-red-100 rounded-2xl p-5 shadow">
            <h2 className="text-lg font-semibold">Total Expenses</h2>
            <p className="text-3xl font-bold mt-2">${totalExpense.toFixed(2)}</p>
          </div>

          <div className="bg-blue-100 rounded-2xl p-5 shadow">
            <h2 className="text-lg font-semibold">Net Savings</h2>
            <p className="text-3xl font-bold mt-2">${savings.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold">Add Transaction</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border rounded-xl p-3"
            />

            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border rounded-xl p-3"
            >
              <option>Income</option>
              <option>Expense</option>
            </select>

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border rounded-xl p-3"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="border rounded-xl p-3"
            />
          </div>

          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border rounded-xl p-3 w-full"
          />

          <button
            onClick={addTransaction}
            className="bg-black text-white px-6 py-3 rounded-2xl hover:opacity-90"
          >
            Add Transaction
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Income vs Expenses</h2>
            <div className="h-72">
              {dailyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Add transactions to see your chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                    <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Savings Trend</h2>
            <div className="h-72">
              {dailyData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Add transactions to see your savings trend.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={3} name="Savings" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Expenses by Category</h2>
            <div className="h-72">
              {expenseByCategory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Add expenses to see category breakdown.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={entry.category} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Recent Transactions</h2>
            <span className="text-gray-500">{transactions.length} entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-3">Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{t.date}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          t.type === 'Income'
                            ? 'bg-green-200'
                            : 'bg-red-200'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td>{t.description}</td>
                    <td className="font-semibold">${t.amount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Savings Tips</h2>
          <ul className="space-y-2 text-gray-700 list-disc pl-5">
            <li>Try saving at least 20% of every income payment.</li>
            <li>Reduce unnecessary subscriptions and impulse purchases.</li>
            <li>Track daily expenses consistently.</li>
            <li>Invest part of your savings into skills or side businesses.</li>
            <li>Build an emergency fund equal to 3–6 months of expenses.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
