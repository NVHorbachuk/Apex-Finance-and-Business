import React, { useState } from 'react';
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const initialTransactions = [
  { id: 1, date: '2025-08-01', description: 'Кава', amount: -50, category: 'Їжа', account: 'Основний', type: 'expense' },
  { id: 2, date: '2025-07-31', description: 'Зарплата', amount: 25000, category: 'Зарплата', account: 'Основний', type: 'income' },
  { id: 3, date: '2025-07-30', description: 'Квитки в кіно', amount: -200, category: 'Розваги', account: 'Кредитна картка', type: 'expense' },
  { id: 4, date: '2025-07-29', description: 'Продукти', amount: -750, category: 'Їжа', account: 'Основний', type: 'expense' },
  { id: 5, date: '2025-07-28', description: 'Оренда квартири', amount: -10000, category: 'Житло', account: 'Основний', type: 'expense' },
];

function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterType, setFilterType] = useState('');

  const categories = ['Їжа', 'Транспорт', 'Розваги', 'Комунальні', 'Зарплата', 'Подарунки'];
  const accounts = ['Основний', 'Кредитна картка', 'Готівка', 'Інвестиції'];

  const openModal = (transaction = null) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTransaction(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTransaction = {
      id: currentTransaction ? currentTransaction.id : Date.now(),
      date: formData.get('date'),
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount')),
      category: formData.get('category'),
      account: formData.get('account'),
      type: formData.get('type'),
    };

    if (currentTransaction) {
      setTransactions(transactions.map(t => t.id === newTransaction.id ? newTransaction : t));
    } else {
      setTransactions([...transactions, newTransaction]);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю транзакцію?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const filteredTransactions = transactions
    .filter(t =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterCategory ? t.category === filterCategory : true) &&
      (filterAccount ? t.account === filterAccount : true) &&
      (filterType ? t.type === filterType : true)
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date DESC

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Транзакції</h1>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition"
        >
          <PlusCircleIcon className="h-5 w-5 mr-2" /> Додати транзакцію
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Пошук за описом..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Всі категорії</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select
          value={filterAccount}
          onChange={(e) => setFilterAccount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Всі рахунки</option>
          {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Всі типи</option>
          <option value="income">Дохід</option>
          <option value="expense">Витрата</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Список транзакцій</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Опис</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сума</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категорія</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Рахунок</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Дії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Транзакцій не знайдено.</td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{t.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{t.description}</td>
                    <td className={`px-6 py-4 text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : ''}{Math.abs(t.amount)} ₴
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{t.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{t.account}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openModal(t)} className="text-blue-500 hover:text-blue-700">
                        <PencilIcon className="h-5 w-5 inline" />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{currentTransaction ? 'Редагувати' : 'Нова'} транзакція</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="date" name="date" defaultValue={currentTransaction?.date} required className="w-full border p-2 rounded" />
              <input type="text" name="description" placeholder="Опис" defaultValue={currentTransaction?.description} required className="w-full border p-2 rounded" />
              <input type="number" name="amount" placeholder="Сума" step="0.01" defaultValue={currentTransaction?.amount} required className="w-full border p-2 rounded" />
              <select name="category" defaultValue={currentTransaction?.category} required className="w-full border p-2 rounded">
                <option value="">Оберіть категорію</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select name="account" defaultValue={currentTransaction?.account} required className="w-full border p-2 rounded">
                <option value="">Оберіть рахунок</option>
                {accounts.map(acc => <option key={acc} value={acc}>{acc}</option>)}
              </select>
              <select name="type" defaultValue={currentTransaction?.type || 'expense'} className="w-full border p-2 rounded">
                <option value="expense">Витрата</option>
                <option value="income">Дохід</option>
              </select>
              <div className="flex justify-end space-x-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Зберегти</button>
                <button type="button" onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded">Скасувати</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
