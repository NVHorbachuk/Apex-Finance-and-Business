import React, { useState, useEffect } from 'react';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    CreditCardIcon, // For account icon
    XMarkIcon, // For closing modals
    ExclamationTriangleIcon // For delete confirmation
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; // Для функції виходу

// Імпорт компонентів бічної панелі та хедера
import { HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon, ChevronDownIcon, BanknotesIcon, ListBulletIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';

// URL для логотипу (посилається на файл у папці public)
const logoUrl = "/image.png";

// Доступні валюти (скопійовано з Dashboard.js для послідовності)
const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'UAH', name: 'Українська гривня', symbol: '₴' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];


function Accounts({ db, auth, userId, userData }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Стан для модальних вікон
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Стан для форм
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [newAccount, setNewAccount] = useState({ name: '', balance: 0, currency: 'UAH' });
    const [editAccount, setEditAccount] = useState({ name: '', balance: 0, currency: '' });
    const [amountToCredit, setAmountToCredit] = useState(''); // Нове поле для додавання/віднімання суми

    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
    const navigate = useNavigate();

    // Завантаження рахунків з Firestore
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
        const unsubscribe = onSnapshot(accountsCollectionRef, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
            setLoading(false);
        }, (err) => {
            console.error("Accounts: Помилка отримання рахунків:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, appId]);

    // Обробник створення рахунку
    const handleCreateAccount = async () => {
        // Перевіряємо, чи всі необхідні поля заповнені та коректні
        if (!db || !userId || !newAccount.name.trim() || isNaN(parseFloat(newAccount.balance)) || !newAccount.currency.trim()) {
            setError(new Error("Будь ласка, заповніть усі поля для нового рахунку."));
            return;
        }

        try {
            const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
            await addDoc(accountsCollectionRef, {
                name: newAccount.name.trim(),
                balance: parseFloat(newAccount.balance),
                currency: newAccount.currency.trim(),
                createdAt: new Date().toISOString(),
                userId: userId
            });
            setNewAccount({ name: '', balance: 0, currency: 'UAH' });
            setShowCreateModal(false);
            setError(null);
        } catch (err) {
            console.error("Помилка додавання рахунку:", err);
            setError(new Error(`Помилка додавання рахунку: ${err.message}`));
        }
    };

    // Обробник редагування рахунку
    const handleEditAccount = async () => {
        // Перевіряємо, чи всі необхідні поля заповнені та коректні
        if (!db || !userId || !selectedAccount || !editAccount.name.trim() || isNaN(parseFloat(editAccount.balance)) || !editAccount.currency.trim()) {
            setError(new Error("Будь ласка, заповніть усі поля для редагування рахунку."));
            return;
        }

        try {
            const accountDocRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, selectedAccount.id);
            await updateDoc(accountDocRef, {
                name: editAccount.name.trim(),
                balance: parseFloat(editAccount.balance),
                currency: editAccount.currency.trim(),
                updatedAt: new Date().toISOString()
            });
            setSelectedAccount(null);
            setShowEditModal(false);
            setError(null);
        } catch (err) {
            console.error("Помилка оновлення рахунку:", err);
            setError(new Error(`Помилка оновлення рахунку: ${err.message}`));
        }
    };

    // Обробник додавання суми до рахунку при редагуванні
    const handleCreditAmount = () => {
        const amount = parseFloat(amountToCredit);
        if (!isNaN(amount) && amount !== 0) { // Дозволяємо додавати як позитивні, так і негативні суми
            setEditAccount(prev => ({
                ...prev,
                balance: prev.balance + amount
            }));
            setAmountToCredit(''); // Очистити поле вводу після додавання
        }
    };


    // Обробник видалення рахунку
    const handleDeleteAccount = (account) => {
        setSelectedAccount(account);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteAccount = async () => {
        if (selectedAccount && db && userId) {
            try {
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/accounts`, selectedAccount.id));
                setError(null);
            } catch (err) {
                console.error("Помилка видалення рахунку:", err);
                setError(new Error(`Помилка видалення рахунку: ${err.message}`));
            } finally {
                setShowDeleteConfirm(false);
                setSelectedAccount(null);
            }
        }
    };

    const cancelDeleteAccount = () => {
        setShowDeleteConfirm(false);
        setSelectedAccount(null);
    };

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

    // Визначаємо ім'я для відображення
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження рахунків...</div>;
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
                        <Link to="/budgets" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Бюджети
                        </Link>
                        <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Наші цілі
                        </Link>
                        <Link to="/accounts" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Рахунки
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Транзакції
                        </Link>
                        {/* Видалено посилання на Categories */}
                        {/* <Link to="/categories" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-3" /> Categories
                        </Link> */}
                        <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                        <Link to="/profile-settings" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основний вміст сторінки рахунків */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Керування рахунками</h1>
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
                        <BellIcon className="h-6 w-6 text-gray-500 cursor-pointer hover:text-blue-600" />
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
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Список рахунків</h2>
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#2C5282] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4299E1] transition-colors duration-200 flex items-center"
                        >
                            <PlusCircleIcon className="h-5 w-5 mr-2" /> Створити новий рахунок
                        </button>
                    </div>
                    {accounts.length === 0 ? (
                        <p className="text-gray-500">Немає доданих рахунків.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F0F4F8]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Назва</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Баланс</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Валюта</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Дії</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {accounts.map(account => {
                                        const currencySymbol = currencies.find(c => c.code === account.currency)?.symbol || '';
                                        return (
                                            <tr key={account.id} className="hover:bg-[#EBF8FF] transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{currencySymbol}{account.balance.toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{account.currency}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedAccount(account);
                                                            // Ініціалізуємо editAccount, гарантуючи, що name, balance та currency не є undefined
                                                            setEditAccount({
                                                                name: account.name || '',
                                                                balance: account.balance || 0,
                                                                currency: account.currency || 'UAH' // Задаємо 'UAH' як значення за замовчуванням, якщо валюта відсутня
                                                            });
                                                            setAmountToCredit(''); // Очистити поле додавання суми
                                                            setShowEditModal(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-md hover:bg-indigo-50"
                                                        title="Редагувати"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAccount(account)}
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

                {/* Create Account Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Створити новий рахунок</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="newAccountName" className="block text-sm font-medium text-gray-700 mb-1">Назва рахунку</label>
                                    <input
                                        id="newAccountName"
                                        type="text"
                                        placeholder="Напр. 'Готівка', 'Дебетна картка'"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={newAccount.name}
                                        onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newAccountBalance" className="block text-sm font-medium text-gray-700 mb-1">Початковий баланс</label>
                                    <input
                                        id="newAccountBalance"
                                        type="number"
                                        placeholder="Напр. 1000.00"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={newAccount.balance === 0 ? '' : newAccount.balance}
                                        onChange={e => setNewAccount({ ...newAccount, balance: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newAccountCurrency" className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                    <select
                                        id="newAccountCurrency"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={newAccount.currency}
                                        onChange={e => setNewAccount({ ...newAccount, currency: e.target.value })}
                                        required
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                                        ))}
                                    </select>
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
                                    onClick={handleCreateAccount}
                                    className="bg-[#2C5282] text-white px-4 py-2 rounded-lg hover:bg-[#4299E1] transition-colors duration-200"
                                >
                                    Створити
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Account Modal */}
                {showEditModal && selectedAccount && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">
                            <button
                                onClick={() => { setShowEditModal(false); setSelectedAccount(null); }}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Редагувати рахунок</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="editAccountName" className="block text-sm font-medium text-gray-700 mb-1">Назва рахунку</label>
                                    <input
                                        id="editAccountName"
                                        type="text"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editAccount.name}
                                        onChange={e => setEditAccount({ ...editAccount, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editAccountBalance" className="block text-sm font-medium text-gray-700 mb-1">Поточний баланс</label>
                                    <input
                                        id="editAccountBalance"
                                        type="number"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editAccount.balance}
                                        onChange={e => setEditAccount({ ...editAccount, balance: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                {/* Нове поле для додавання/віднімання суми */}
                                <div className="flex items-end space-x-2">
                                    <div className="flex-1">
                                        <label htmlFor="amountToCredit" className="block text-sm font-medium text-gray-700 mb-1">Додати/відняти суму</label>
                                        <input
                                            id="amountToCredit"
                                            type="number"
                                            placeholder="Напр. 50.00 або -20.00"
                                            value={amountToCredit}
                                            onChange={e => setAmountToCredit(e.target.value)}
                                            step="0.01"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreditAmount}
                                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                    >
                                        Застосувати
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor="editAccountCurrency" className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                    <select
                                        id="editAccountCurrency"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        value={editAccount.currency}
                                        onChange={e => setEditAccount({ ...editAccount, currency: e.target.value })}
                                        required
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => { setShowEditModal(false); setSelectedAccount(null); }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleEditAccount}
                                    className="bg-[#2C5282] text-white px-4 py-2 rounded-lg hover:bg-[#4299E1] transition-colors duration-200"
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
                                Ви впевнені, що хочете видалити рахунок "<span className="font-semibold">{selectedAccount.name}</span>"?
                                Цю дію не можна скасувати.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelDeleteAccount}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={confirmDeleteAccount}
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

export default Accounts;
