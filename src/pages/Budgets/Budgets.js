import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    BanknotesIcon, PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon,
    HomeIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, UserCircleIcon,
    ChevronDownIcon, FunnelIcon, CalendarDaysIcon, XMarkIcon, ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';

const logoUrl = "/image.png";

// Available currencies for selection (копіюємо з Dashboard.js для послідовності)
const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'UAH', name: 'Українська гривня', symbol: '₴' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];


function Budgets({ db, auth, userId, userData }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true); // Виправлено: використовувати useState для ініціалізації
    const [error, setError] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [selectedBudget, setSelectedBudget] = useState(null);
    const [newBudget, setNewBudget] = useState({ name: "", limit: 0, spent: 0, category: "All categories", currency: "UAH", recurrence: "Monthly", startDate: new Date().toISOString().substring(0, 10) });
    const [editBudget, setEditBudget] = useState({ name: "", limit: 0, spent: 0, category: "", currency: "", recurrence: "", startDate: "" });
    const [amountToCredit, setAmountToCredit] = useState('');

    const [availableCategories, setAvailableCategories] = useState(['All categories']);

    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
    const navigate = useNavigate();

    // Fetch budgets and transactions from Firestore
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const unsubscribes = [];

        const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
        unsubscribes.push(onSnapshot(budgetsCollectionRef, (snapshot) => {
            const fetchedBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(fetchedBudgets);
            setLoading(false);
        }, (err) => {
            console.error("Budgets.js: Помилка отримання бюджетів:", err);
            setError(err);
            setLoading(false);
        }));

        const transactionsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
        unsubscribes.push(onSnapshot(transactionsCollectionRef, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const uniqueCategories = new Set(['All categories']);
            fetchedTransactions.forEach(t => {
                if (t.category) uniqueCategories.add(t.category);
            });
            setAvailableCategories(Array.from(uniqueCategories));
        }, (err) => {
            console.error("Budgets.js: Помилка отримання транзакцій для категорій:", err);
            setError(err);
        }));

        return () => unsubscribes.forEach(unsub => unsub());
    }, [db, userId, appId]);

    // Handle Create Budget
    const handleCreate = async () => {
        if (!db || !userId || !newBudget.name.trim() || isNaN(parseFloat(newBudget.limit)) || !newBudget.currency.trim() || !newBudget.recurrence.trim() || !newBudget.startDate.trim()) {
            setError(new Error("Будь ласка, заповніть усі поля для створення бюджету."));
            return;
        }

        try {
            const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
            await addDoc(budgetsCollectionRef, {
                name: newBudget.name.trim(),
                limit: parseFloat(newBudget.limit),
                spent: 0, // Initial spent is 0
                category: newBudget.category.trim(),
                currency: newBudget.currency.trim(),
                recurrence: newBudget.recurrence.trim(),
                startDate: newBudget.startDate.trim(),
                createdAt: new Date().toISOString(),
                userId: userId
            });
            setNewBudget({ name: "", limit: 0, spent: 0, category: "All categories", currency: "UAH", recurrence: "Monthly", startDate: new Date().toISOString().substring(0, 10) });
            setShowCreateModal(false);
            setError(null);
        } catch (err) {
            console.error("Помилка додавання бюджету:", err);
            setError(new Error(`Помилка додавання бюджету: ${err.message}`));
        }
    };

    // Handle Edit Budget
    const handleEdit = async () => {
        // Забезпечуємо, що всі поля існують перед викликом .trim() або parseFloat()
        const budgetToValidate = {
            name: editBudget.name || '',
            limit: parseFloat(editBudget.limit) || 0,
            spent: parseFloat(editBudget.spent) || 0,
            category: editBudget.category || '',
            currency: editBudget.currency || '',
            recurrence: editBudget.recurrence || '',
            startDate: editBudget.startDate || '',
        };

        if (!db || !userId || !selectedBudget || !budgetToValidate.name.trim() || isNaN(budgetToValidate.limit) || isNaN(budgetToValidate.spent) || !budgetToValidate.currency.trim() || !budgetToValidate.recurrence.trim() || !budgetToValidate.startDate.trim()) {
            setError(new Error("Будь ласка, заповніть усі поля для редагування бюджету."));
            return;
        }

        try {
            const budgetDocRef = doc(db, `/artifacts/${appId}/users/${userId}/budgets`, selectedBudget.id);
            await updateDoc(budgetDocRef, {
                name: budgetToValidate.name.trim(),
                limit: budgetToValidate.limit,
                spent: budgetToValidate.spent,
                category: budgetToValidate.category.trim(),
                currency: budgetToValidate.currency.trim(),
                recurrence: budgetToValidate.recurrence.trim(),
                startDate: budgetToValidate.startDate.trim(),
            });
            setSelectedBudget(null);
            setShowEditModal(false);
            setError(null);
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
                setError(null);
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

    // Функція для додавання суми до вже зарахованих коштів
    const handleCreditAmount = () => {
        const amount = parseFloat(amountToCredit);
        if (!isNaN(amount) && amount > 0) {
            setEditBudget(prev => ({
                ...prev,
                spent: prev.spent + amount
            }));
            setAmountToCredit(''); // Очистити поле вводу після додавання
        }
    };

    // Функція для виходу з облікового запису
    const handleLogout = async () => {
        if (!auth) {
            console.error("Firebase Auth не доступний.");
            return;
        }
        try {
            await signOut(auth);
            console.log("Користувач успішно вийшов з облікового запису.");
            navigate('/login');
        } catch (error) {
            console.error("Помилка виходу з облікового запису:", error);
            setError(new Error(`Помилка виходу: ${error.message}`));
        }
    };

    // Determine the display name
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';


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
                        <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <HomeIcon className="h-5 w-5 mr-3" /> Інформаційна панель
                        </Link>
                        <Link to="/budgets" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Бюджети
                        </Link>
                        <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Наші цілі
                        </Link>
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Рахунки
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Транзакції
                        </Link>
                        {/* <Link to="/categories" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-3" /> Categories
                        </Link> */}
                    </nav>
                </div>
            </aside>

            {/* Основний вміст сторінки бюджетів */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Керування бюджетами</h1>
                    <div className="flex items-center space-x-6">
                        {/* Вибір бюджету (залишився статичним) */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                <option value="Budget 1">Budget 1</option>
                                <option value="Budget 2">Budget 2</option>
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <UserCircleIcon className="h-8 w-8 text-blue-500" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800">{displayName}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                                Вийти
                            </button>
                        </div>
                    </div>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Список бюджетів</h2>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#2C5282] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4299E1] transition-colors duration-200 flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" /> Створити новий бюджет
                        </button>
                    </div>
                    {budgets.length === 0 ? (
                        <p className="text-gray-500">Немає доданих бюджетів.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F0F4F8]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Назва</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Категорія</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Валюта</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Періодичність</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Дата початку</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ліміт</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Зараховано</th>
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
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{budget.currency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{budget.recurrence}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{budget.startDate}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{currencies.find(c => c.code === budget.currency)?.symbol}{budget.limit.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{currencies.find(c => c.code === budget.currency)?.symbol}{budget.spent.toFixed(2)}</td>
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
                                                            // Виправлено: забезпечуємо, що всі поля ініціалізовані рядками, якщо вони відсутні
                                                            setEditBudget({
                                                                ...budget,
                                                                name: budget.name || '',
                                                                limit: budget.limit || 0,
                                                                spent: budget.spent || 0,
                                                                category: budget.category || 'All categories',
                                                                currency: budget.currency || 'UAH',
                                                                recurrence: budget.recurrence || 'Monthly',
                                                                startDate: budget.startDate || new Date().toISOString().substring(0, 10)
                                                            });
                                                            setAmountToCredit('');
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
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Створити новий бюджет</h2>

                            {/* General Info */}
                            <div className="mb-4 space-y-3">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                    <BanknotesIcon className="h-5 w-5 mr-2 text-green-500" /> Загальна інформація
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="newBudgetName" className="block text-sm font-medium text-gray-700 mb-1">Назва бюджету</label>
                                        <input
                                            id="newBudgetName"
                                            type="text"
                                            placeholder="Напр. 'Продукти'"
                                            value={newBudget.name}
                                            onChange={e => setNewBudget({ ...newBudget, name: e.target.value })}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="newBudgetAmount" className="block text-sm font-medium text-gray-700 mb-1">Сума</label>
                                        <input
                                            id="newBudgetAmount"
                                            type="number"
                                            placeholder="Напр. 500.00"
                                            value={newBudget.limit === 0 ? '' : newBudget.limit}
                                            onChange={e => setNewBudget({ ...newBudget, limit: parseFloat(e.target.value) || 0 })}
                                            step="0.01"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="newBudgetCurrency" className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                        <select
                                            id="newBudgetCurrency"
                                            value={newBudget.currency}
                                            onChange={e => setNewBudget({ ...newBudget, currency: e.target.value })}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            required
                                        >
                                            {currencies.map(c => (
                                                <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Budget Filter */}
                            <div className="mb-4 space-y-3">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                    <FunnelIcon className="h-5 w-5 mr-2 text-orange-500" /> Фільтр бюджету
                                </h3>
                                <div>
                                    <label htmlFor="newBudgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Бюджет для</label>
                                    <select
                                        id="newBudgetCategory"
                                        value={newBudget.category}
                                        onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Budget Period */}
                            <div className="mb-4 space-y-3">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-purple-500" /> Період бюджету
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {['Once', 'Daily', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'].map(period => (
                                        <button
                                            key={period}
                                            type="button"
                                            onClick={() => setNewBudget({ ...newBudget, recurrence: period })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200
                                                ${newBudget.recurrence === period ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                            `}
                                        >
                                            {period === 'Once' ? 'Одноразово' :
                                             period === 'Daily' ? 'Щоденно' :
                                             period === 'Weekly' ? 'Щотижня' :
                                             period === 'Biweekly' ? 'Раз на два тижні' :
                                             period === 'Monthly' ? 'Щомісяця' :
                                             'Щорічно'}
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label htmlFor="newBudgetStartDate" className="block text-sm font-medium text-gray-700 mb-1">Дата початку</label>
                                    <input
                                        id="newBudgetStartDate"
                                        type="date"
                                        value={newBudget.startDate}
                                        onChange={e => setNewBudget({ ...newBudget, startDate: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                >
                                    Створити бюджет
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Budget Modal */}
                {showEditModal && selectedBudget && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedBudget(null); }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5">Редагувати бюджет</h2>
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="editBudgetName" className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                                    <input
                                        id="editBudgetName"
                                        type="text"
                                        value={editBudget.name}
                                        onChange={e => setEditBudget({ ...editBudget, name: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editBudgetLimit" className="block text-sm font-medium text-gray-700 mb-1">Ліміт</label>
                                    <input
                                        id="editBudgetLimit"
                                        type="number"
                                        value={editBudget.limit}
                                        onChange={e => setEditBudget({ ...editBudget, limit: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                {/* Оновлене поле "Зараховано" */}
                                <div>
                                    <label htmlFor="editBudgetSpent" className="block text-sm font-medium text-gray-700 mb-1">Зараховано</label>
                                    <input
                                        id="editBudgetSpent"
                                        type="number"
                                        value={editBudget.spent}
                                        onChange={e => setEditBudget({ ...editBudget, spent: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                {/* Нове поле для додавання суми до зарахування */}
                                <div className="flex items-end space-x-2">
                                    <div className="flex-1">
                                        <label htmlFor="amountToCredit" className="block text-sm font-medium text-gray-700 mb-1">Додати суму для зарахування</label>
                                        <input
                                            id="amountToCredit"
                                            type="number"
                                            placeholder="0.00"
                                            value={amountToCredit}
                                            onChange={e => setAmountToCredit(e.target.value)}
                                            step="0.01"
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreditAmount}
                                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
                                    >
                                        Зарахувати
                                    </button>
                                </div>
                                {/* Кінець нового поля */}
                                <div>
                                    <label htmlFor="editBudgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <select
                                        id="editBudgetCategory"
                                        value={editBudget.category}
                                        onChange={e => setEditBudget({ ...editBudget, category: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="editBudgetCurrency" className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                    <select
                                        id="editBudgetCurrency"
                                        value={editBudget.currency}
                                        onChange={e => setEditBudget({ ...editBudget, currency: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="editBudgetRecurrence" className="block text-sm font-medium text-gray-700 mb-1">Періодичність</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Once', 'Daily', 'Weekly', 'Biweekly', 'Monthly', 'Yearly'].map(period => (
                                            <button
                                                key={period}
                                                type="button"
                                                onClick={() => setEditBudget({ ...editBudget, recurrence: period })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200
                                                    ${editBudget.recurrence === period ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                                `}
                                            >
                                                {period === 'Once' ? 'Одноразово' :
                                                 period === 'Daily' ? 'Щоденно' :
                                                 period === 'Weekly' ? 'Щотижня' :
                                                 period === 'Biweekly' ? 'Раз на два тижні' :
                                                 period === 'Monthly' ? 'Щомісяця' :
                                                 'Щорічно'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="editBudgetStartDate" className="block text-sm font-medium text-gray-700 mb-1">Дата початку</label>
                                    <input
                                        id="editBudgetStartDate"
                                        type="date"
                                        value={editBudget.startDate}
                                        onChange={e => setEditBudget({ ...editBudget, startDate: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    onClick={() => { setShowEditModal(false); setSelectedBudget(null); }}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleEdit}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
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
