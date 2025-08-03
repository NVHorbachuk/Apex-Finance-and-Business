// src/pages/Dashboard/Dashboard.js
import React from 'react';
import { Line, Pie } from 'react-chartjs-2'; // Importing chart components
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend);

// Placeholder data for charts and other dashboard elements
const chartData = {
  labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'], // Labels for the x-axis (months)
  datasets: [
    {
      label: 'Доходи', // Label for income data
      data: [1200, 1500, 1300, 1600, 1700, 1800], // Sample income data
      borderColor: 'rgba(75, 192, 192, 1)', // Line color for income
      backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill color for income
      fill: true, // Fill area under the line
      tension: 0.3, // Curve tension for the line
    },
    {
      label: 'Витрати', // Label for expense data
      data: [800, 900, 1100, 1000, 1200, 1300], // Sample expense data
      borderColor: 'rgba(255, 99, 132, 1)', // Line color for expenses
      backgroundColor: 'rgba(255, 99, 132, 0.2)', // Fill color for expenses
      fill: true, // Fill area under the line
      tension: 0.3, // Curve tension for the line
    },
  ],
};

const pieChartData = {
  labels: ['Продукти', 'Транспорт', 'Розваги', 'Комунальні'], // Labels for pie chart segments
  datasets: [
    {
      data: [300, 150, 100, 200], // Sample data for pie chart segments
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], // Colors for segments
      hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'], // Hover colors
    },
  ],
};

const recentTransactions = [
  { id: 1, description: 'Кава', amount: -50, date: '01.08.2025', type: 'expense' }, // Sample transaction
  { id: 2, description: 'Зарплата', amount: 25000, date: '31.07.2025', type: 'income' }, // Sample transaction
  { id: 3, description: 'Квитки в кіно', amount: -200, date: '30.07.2025', type: 'expense' }, // Sample transaction
];

const reminders = [
  { id: 1, text: 'Оплатити рахунок за інтернет (10.08.2025)', type: 'payment' }, // Sample reminder
  { id: 2, text: 'Переглянути бюджет на серпень', type: 'budget' }, // Sample reminder
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Dashboard Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Дашборд</h1>

      {/* Current Balance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-lg text-gray-600">Загальний баланс</p>
            <p className="text-4xl font-extrabold text-blue-600">15,000 ₴</p>
          </div>
          {/* Placeholder for an icon */}
          <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        {/* Example Account Balance */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg text-gray-600">Основний рахунок</p>
          <p className="text-3xl font-bold text-green-600">12,500 ₴</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-lg text-gray-600">Кредитна картка</p>
          <p className="text-3xl font-bold text-red-600">-2,000 ₴</p>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Доходи та Витрати (Останні 6 місяців)</h2>
          <Line data={chartData} /> {/* Line chart for income/expenses */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Розподіл Витрат</h2>
          <div className="h-64 flex items-center justify-center"> {/* Container for pie chart */}
            <Pie data={pieChartData} /> {/* Pie chart for expense distribution */}
          </div>
        </div>
      </div>

      {/* Budget Status & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Поточний статус бюджету</h2>
          <div className="space-y-4">
            {/* Sample Budget Item */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-800">Продукти</p>
                <p className="text-sm text-gray-500">Витрачено: 800 ₴ з 1000 ₴</p>
              </div>
              <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div> {/* Progress bar */}
              </div>
              <span className="text-green-600 font-bold">80%</span>
            </div>
            {/* Another Sample Budget Item */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-gray-800">Транспорт</p>
                <p className="text-sm text-gray-500">Витрачено: 400 ₴ з 300 ₴</p>
              </div>
              <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '100%' }}></div> {/* Over budget */}
              </div>
              <span className="text-red-600 font-bold">133%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Останні транзакції</h2>
          <ul className="divide-y divide-gray-200">
            {recentTransactions.map(transaction => (
              <li key={transaction.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-lg text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <p className={`text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}{transaction.amount} ₴
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Reminders Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Нагадування</h2>
        <ul className="divide-y divide-gray-200">
          {reminders.map(reminder => (
            <li key={reminder.id} className="py-3 text-lg text-gray-800">
              {reminder.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
