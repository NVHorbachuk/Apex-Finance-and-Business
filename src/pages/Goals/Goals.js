import React, { useEffect, useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { MdOutlineCreate } from 'react-icons/md';

const Goals = () => {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchedGoals = [
      {
        id: 6,
        name: 'DSadas',
        tag: 'QKMEFAFZI3',
        amount: 1000,
        collected: 0,
        expirationDate: 'November 4, 2022 4:50 PM',
      },
    ];
    setGoals(fetchedGoals);
  }, []);

  const handleEdit = (id) => {
    console.log('Редагувати ціль з ID:', id);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Ви впевнені, що хочете видалити ціль?');
    if (confirmDelete) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  const handleCreate = () => {
    console.log('Створити нову ціль');
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
            {goals.map(goal => (
              <tr key={goal.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.tag}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.amount}€</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{goal.collected}€</td>
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
    </div>
  );
};

export default Goals;
