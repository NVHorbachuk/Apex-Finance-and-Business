import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BanknotesIcon, PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, HomeIcon
} from "@heroicons/react/24/outline";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

const logoUrl = "/image.png"; // Defined here for Budgets.js

function Budgets({ db, auth, userId }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [selectedBudget, setSelectedBudget] = useState(null);
    const [newBudget, setNewBudget] = useState({ name: "", limit: 0, spent: 0, category: "" });
    const [editBudget, setEditBudget] = useState({ name: "", limit: 0, spent: 0, category: "" });

    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
    const navigate = useNavigate();

    // Fetch budgets from Firestore
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
        const unsubscribe = onSnapshot(budgetsCollectionRef, (snapshot) => {
            const fetchedBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(fetchedBudgets);
            setLoading(false);
        }, (err) => {
            console.error("Budgets.js: Помилка отримання бюджетів:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, appId]);

    // Handle Create Budget
    const handleCreate = async () => {
        if (!db || !userId || !newBudget.name.trim() || isNaN(parseFloat(newBudget.limit))) {
            setError(new Error("Будь ласка, заповніть назву бюджету та ліміт."));
            return;
        }

        try {
            const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
            await addDoc(budgetsCollectionRef, {
                name: newBudget.name.trim(),
                limit: parseFloat(newBudget.limit),
                spent: 0, // Initial spent is 0
                category: newBudget.category.trim() || 'Без категорії', // Default category if empty
                createdAt: new Date().toISOString(),
                userId: userId
            });
            setNewBudget({ name: "", limit: 0, spent: 0, category: "" });
            setShowCreateModal(false);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error("Помилка додавання бюджету:", err);
            setError(new Error(`Помилка додавання бюджету: ${err.message}`));
        }
    };

    // Handle Edit Budget
    const handleEdit = async () => {
        if (!db || !userId || !selectedBudget || !editBudget.name.trim() || isNaN(parseFloat(editBudget.limit)) || isNaN(parseFloat(editBudget.spent))) {
            setError(new Error("Будь ласка, заповніть усі поля для редагування бюджету."));
            return;
        }

        try {
            const budgetDocRef = doc(db, `/artifacts/${appId}/users/${userId}/budgets`, selectedBudget.id);
            await updateDoc(budgetDocRef, {
                name: editBudget.name.trim(),
                limit: parseFloat(editBudget.limit),
                spent: parseFloat(editBudget.spent),
                category: editBudget.category.trim(),
            });
            setSelectedBudget(null);
            setShowEditModal(false);
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error("Помилка оновлення бюджету:", err);
            setError(new Error(`Помилка оновлення бюджету: ${err.message}`));
        }
    };

    // Handle Delete Budget
    const handleDelete = (budget) => {
        setSelectedBudget(budget);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedBudget && db && userId) {
            try {
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/budgets`, selectedBudget.id));
                setError(null); // Clear any previous errors
            } catch (err) {
                console.error("Помилка видалення бюджету:", err);
                setError(new Error(`Помилка видалення бюджету: ${err.message}`));
            } finally {
                setShowDeleteConfirm(false);
                setSelectedBudget(null);
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedBudget(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження бюджетів...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;


    return (
        <div className="flex min-h-screen bg-[#F7FAFC] font-['DM Sans']">
            {/* Бічна панель */}
            <aside className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-r-xl">
                <div>
                    <div className="flex items-center mb-10">
                        <img src={logoUrl} alt="Finance Manager Logo" className="w-8 h-8 mr-2 object-contain" />
                        <span className="text-xl font-bold text-gray-900">Finance Manager</span>
                    </div>
                    <nav className="space-y-4">
                        <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <HomeIcon className="h-5 w-5 mr-3" /> Головна
                        </Link>
                        <Link to="/budgets" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Бюджети
                        </Link>
                        {/* Add other navigation links here as needed, similar to Dashboard's sidebar */}
                    </nav>
                </div>
            </aside>

            {/* Основний вміст сторінки бюджетів */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Керування бюджетами</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-[#2C5282] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4299E1] transition-colors duration-200 flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" /> Створити новий бюджет
                    </button>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Список бюджетів</h2>
                    {budgets.length === 0 ? (
                        <p className="text-gray-500">Немає доданих бюджетів.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F0F4F8]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Назва</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Категорія</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ліміт</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Витрачено</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Прогрес</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Дії</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {budgets.map(budget => {
                                        const progress = (budget.spent / budget.limit) * 100;
                                        const progressColor = progress > 100 ? 'bg-red-500' : 'bg-green-500'; // Використовуємо кольори Tailwind
                                        return (
                                            <tr key={budget.id} className="hover:bg-[#EBF8FF] transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{budget.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{budget.category || 'Без категорії'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${budget.limit.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${budget.spent.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                                                        <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBudget(budget);
                                                            setEditBudget({ ...budget });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-md hover:bg-indigo-50"
                                                        title="Редагувати"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(budget)}
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-md hover:bg-red-50 ml-2"
                                                        title="Видалити"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Budget Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Створити бюджет</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="newBudgetName" className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                                    <input
                                        id="newBudgetName"
                                        type="text"
                                        placeholder="Напр. 'Продукти'"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={newBudget.name}
                                        onChange={e => setNewBudget({ ...newBudget, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newBudgetLimit" className="block text-sm font-medium text-gray-700 mb-1">Ліміт</label>
                                    <input
                                        id="newBudgetLimit"
                                        type="number"
                                        placeholder="Напр. 500.00"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={newBudget.limit === 0 ? '' : newBudget.limit}
                                        onChange={e => setNewBudget({ ...newBudget, limit: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newBudgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        id="newBudgetCategory"
                                        type="text"
                                        placeholder="Напр. 'Їжа', 'Транспорт'"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={newBudget.category}
                                        onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="bg-[#2C5282] text-white px-4 py-2 rounded-lg hover:bg-[#4299E1] transition-colors duration-200"
                                >
                                    Створити
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Budget Modal */}
                {showEditModal && selectedBudget && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Редагувати бюджет</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="editBudgetName" className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                                    <input
                                        id="editBudgetName"
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editBudget.name}
                                        onChange={e => setSelectedBudget({ ...selectedBudget, name: e.target.value }) || setEditBudget({ ...editBudget, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editBudgetLimit" className="block text-sm font-medium text-gray-700 mb-1">Ліміт</label>
                                    <input
                                        id="editBudgetLimit"
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editBudget.limit}
                                        onChange={e => setSelectedBudget({ ...selectedBudget, limit: parseFloat(e.target.value) || 0 }) || setEditBudget({ ...editBudget, limit: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editBudgetSpent" className="block text-sm font-medium text-gray-700 mb-1">Витрачено</label>
                                    <input
                                        id="editBudgetSpent"
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editBudget.spent}
                                        onChange={e => setSelectedBudget({ ...selectedBudget, spent: parseFloat(e.target.value) || 0 }) || setEditBudget({ ...editBudget, spent: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editBudgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        id="editBudgetCategory"
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editBudget.category}
                                        onChange={e => setSelectedBudget({ ...selectedBudget, category: e.target.value }) || setEditBudget({ ...editBudget, category: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => { setShowEditModal(false); setSelectedBudget(null); }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="bg-[#2C5282] text-white px-4 py-2 rounded-lg hover:bg-[#4299E1] transition-colors duration-200"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && selectedBudget && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                            <div className="flex items-center text-red-500 mb-4">
                                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Підтвердити видалення</h3>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Ви впевнені, що хочете видалити бюджет "<span className="font-semibold">{selectedBudget.name}</span>"?
                                Цю дію не можна скасувати.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                    Видалити
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Budgets;
