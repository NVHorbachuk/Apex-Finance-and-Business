// src/pages/Transactions/Transactions.js
import React, { useState } from 'react';
import { PlusCircleIcon, PencilIcon, TrashIcon, FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Importing icons from Heroicons

// Placeholder data for transactions
const initialTransactions = [
  { id: 1, date: '2025-08-01', description: 'Кава', amount: -50, category: 'Їжа', account: 'Основний', type: 'expense' },
  { id: 2, date: '2025-07-31', description: 'Зарплата', amount: 25000, category: 'Зарплата', account: 'Основний', type: 'income' },
  { id: 3, date: '2025-07-30', description: 'Квитки в кіно', amount: -200, category: 'Розваги', account: 'Кредитна картка', type: 'expense' },
  { id: 4, date: '2025-07-29', description: 'Продукти', amount: -750, category: 'Їжа', account: 'Основний', type: 'expense' },
  { id: 5, date: '2025-07-28', description: 'Оренда квартири', amount: -10000, category: 'Житло', account: 'Основний', type: 'expense' },
];

function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions); // State for managing transactions
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling the add/edit modal
  const [currentTransaction, setCurrentTransaction] = useState(null); // State for storing transaction being edited

  // Dummy categories and accounts for the form
  const categories = ['Їжа', 'Транспорт', 'Розваги', 'Комунальні', 'Зарплата', 'Подарунки'];
  const accounts = ['Основний', 'Кредитна картка', 'Готівка', 'Інвестиції'];

  // Function to open the add/edit modal
  const openModal = (transaction = null) => {
    setCurrentTransaction(transaction); // Set current transaction if editing, otherwise null for adding
    setIsModalOpen(true);
  };

  // Function to close the add/edit modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  // Function to handle form submission (add/edit transaction)
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTransaction = {
      id: currentTransaction ? currentTransaction.id : transactions.length + 1, // Generate new ID or use existing
      date: formData.get('date'),
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount')),
      category: formData.get('category'),
      account: formData.get('account'),
      type: formData.get('type'),
    };

    if (currentTransaction) {
      // Update existing transaction
      setTransactions(transactions.map(t => t.id === newTransaction.id ? newTransaction : t));
    } else {
      // Add new transaction
      setTransactions([...transactions, newTransaction]);
    }
    closeModal(); // Close modal after submission
  };

  // Function to delete a transaction
  const handleDelete = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю транзакцію?')) { // Simple confirmation
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Transactions Header */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Транзакції</h1>

      {/* Action Buttons: Add Transaction */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Додати транзакцію
        </button>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Пошук за описом..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Всі категорії</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Всі рахунки</option>
          {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
        </select>
        <select className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Всі типи</option>
          <option value="income">Дохід</option>
          <option value="expense">Витрата</option>
        </select>
      </div>

      {/* Transactions List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Список транзакцій</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Опис
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сума
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категорія
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Рахунок
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Дії</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                    Транзакцій не знайдено.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : ''}{transaction.amount} ₴
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.account}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openModal(transaction)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        title="Редагувати"
                      >
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Видалити"
                      >
                        <TrashIcon className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {currentTransaction ? 'Редагувати транзакцію' : 'Додати нову транзакцію'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">Дата:</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  defaultValue={currentTransaction ? currentTransaction.date : ''}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Опис:</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  defaultValue={currentTransaction ? currentTransaction.description : ''}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Опис транзакції"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">Сума:</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  defaultValue={currentTransaction ? Math.abs(currentTransaction.amount) : ''} // Display absolute value
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Сума"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700 text-sm font-bold mb-2">Тип:</label>
                <select
                  id="type"
                  name="type"
                  defaultValue={currentTransaction ? currentTransaction.type : 'expense'}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="expense">Витрата</option>
                  <option value="income">Дохід</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Категорія:</label>
                <select
                  id="category"
                  name="category"
                  defaultValue={currentTransaction ? currentTransaction.category : ''}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Виберіть категорію</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="mb-6">
                <label htmlFor="account" className="block text-gray-700 text-sm font-bold mb-2">Рахунок:</label>
                <select
                  id="account"
                  name="account"
                  defaultValue={currentTransaction ? currentTransaction.account : ''}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Виберіть рахунок</option>
                  {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                >
                  {currentTransaction ? 'Зберегти зміни' : 'Додати транзакцію'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Скасувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
