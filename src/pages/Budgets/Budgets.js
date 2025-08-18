// src/pages/Budgets/Budgets.js
import React from "react";

const budgetsData = [
  {
    title: "Groceries",
    description: "Track your spending for groceries.",
    spent: 250,
    total: 500,
  },
  {
    title: "Entertainment",
    description: "Track your spending for entertainment.",
    spent: 150,
    total: 200,
  },
  {
    title: "Transport",
    description: "Track your spending for transport.",
    spent: 80,
    total: 100,
  },
  {
    title: "Shopping",
    description: "Track your spending for shopping.",
    spent: 400,
    total: 1000,
  },
];

const Budgets = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700">
          + Add Budget
        </button>
      </div>

      {/* Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetsData.map((budget, index) => {
          const remaining = budget.total - budget.spent;
          const progress = (budget.spent / budget.total) * 100;

          return (
            <div
              key={index}
              className="bg-white shadow rounded-xl p-4 border border-gray-200"
            >
              <h2 className="text-lg font-medium">{budget.title}</h2>
              <p className="text-sm text-gray-500">{budget.description}</p>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 my-4">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm">
                <span>${budget.spent.toFixed(2)} spent</span>
                <span>${remaining.toFixed(2)} remaining</span>
              </div>

              <p className="mt-2 text-gray-600 text-sm">
                Total: ${budget.total.toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;
