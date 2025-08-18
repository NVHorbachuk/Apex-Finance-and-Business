import React, { useEffect, useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { MdOutlineCreate } from 'react-icons/md';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const initialFormData = {
    name: '',
    tag: '',
    amount: '',
    currency: 'USD',
    expirationDate: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const fetchedGoals = [
      {
        id: 6,
        name: 'DSadas',
        tag: 'QKMEFAFZI3',
        amount: 1000,
        collected: 0,
        currency: 'EUR',
        expirationDate: 'November 4, 2022 4:50 PM',
      },
    ];
    setGoals(fetchedGoals);
  }, []);

  const handleCreate = () => {
    setFormData(initialFormData);
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id) => {
    const goal = goals.find((g) => g.id === id);
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        tag: goal.tag,
        amount: goal.amount,
        currency: goal.currency || 'USD',
        expirationDate: new Date(goal.expirationDate).toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM
      });
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Ви впевнені, що хочете видалити ціль?');
    if (confirmDelete) {
      setGoals(goals.filter((goal) => goal.id !== id));
    }
  };

  const handleSave = () => {
    if (editingGoal) {
      setGoals(goals.map((goal) =>
        goal.id === editingGoal.id ? { ...goal, ...formData } : goal
      ));
    } else {
      const newGoal = {
        id: Date.now(),
        ...formData,
        collected: 0,
        expirationDate: new Date(formData.expirationDate).toLocaleString(),
        tag: Math.random().toString(36).substring(2, 12).toUpperCase(),
      };
      setGoals([...goals, newGoal]);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
    setEditingGoal(null);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Goals</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <MdOutlineCreate className="text-lg" />
          Create new
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tag</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Collected</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Expiration Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {goals.map((goal) => (
              <tr key={goal.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.tag}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.amount}{goal.currency === 'EUR' ? '€' : '$'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.collected}{goal.currency === 'EUR' ? '€' : '$'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.expirationDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex gap-3">
                  <button
                    onClick={() => handleEdit(goal.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {editingGoal ? 'Edit goal' : 'Create goal'}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Name"
                className="border p-2 rounded"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {editingGoal && (
                <input
                  type="text"
                  placeholder="Tag"
                  disabled
                  className="border p-2 rounded bg-gray-100"
                  value={formData.tag}
                />
              )}
              <input
                type="number"
                placeholder="Amount"
                className="border p-2 rounded"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <select
                className="border p-2 rounded"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="USD">United States Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
              <input
                type="datetime-local"
                className="border p-2 rounded"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              />
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingGoal ? 'Save' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
