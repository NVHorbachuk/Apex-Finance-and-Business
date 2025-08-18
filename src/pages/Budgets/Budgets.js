// src/pages/Budgets/Budgets.js
import React, { useState } from "react";

const Budgets = () => {
  const [budgets, setBudgets] = useState([
    { id: 1, name: "Budget 1", photo: null },
    { id: 15, name: "Budget 2", photo: null },
  ]);

  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newBudget, setNewBudget] = useState({ name: "", photo: null });

  const handleCreate = () => {
    const newId = Math.max(...budgets.map(b => b.id)) + 1;
    setBudgets([...budgets, { id: newId, ...newBudget }]);
    setShowCreateModal(false);
    setNewBudget({ name: "", photo: null });
  };

  const handleEdit = () => {
    setBudgets(prev =>
      prev.map(b => (b.id === selectedBudget.id ? selectedBudget : b))
    );
    setShowEditModal(false);
    setSelectedBudget(null);
  };

  const handleDelete = id => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      setBudgets(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">List of budgets</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          + Create new
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Photo</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map(budget => (
            <tr key={budget.id} className="border-t">
              <td className="p-3">{budget.id}</td>
              <td className="p-3">{budget.name}</td>
              <td className="p-3">
                {budget.photo ? (
                  <img src={URL.createObjectURL(budget.photo)} alt="budget" className="w-10 h-10 object-cover rounded" />
                ) : (
                  <span className="text-gray-400">No photo</span>
                )}
              </td>
              <td className="p-3 flex items-center justify-center gap-3">
                <button title="Members">
                  👥
                </button>
                <button
                  title="Edit"
                  onClick={() => {
                    setSelectedBudget(budget);
                    setShowEditModal(true);
                  }}
                >
                  ✏️
                </button>
                <button
                  title="Delete"
                  onClick={() => handleDelete(budget.id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Create budget</h2>
            <input
              type="text"
              placeholder="Name"
              className="w-full mb-4 border p-2 rounded"
              value={newBudget.name}
              onChange={e =>
                setNewBudget({ ...newBudget, name: e.target.value })
              }
            />
            <input
              type="file"
              className="mb-4"
              onChange={e =>
                setNewBudget({ ...newBudget, photo: e.target.files[0] })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditModal && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit budget</h2>
            <input
              type="text"
              className="w-full mb-4 border p-2 rounded"
              value={selectedBudget.name}
              onChange={e =>
                setSelectedBudget({ ...selectedBudget, name: e.target.value })
              }
            />
            <input
              type="file"
              className="mb-4"
              onChange={e =>
                setSelectedBudget({
                  ...selectedBudget,
                  photo: e.target.files[0],
                })
              }
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
