import React, { useState, useEffect } from 'react';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    CreditCardIcon, // Наприклад, якщо вона використовується
    XMarkIcon // Додано XMarkIcon для закриття модального вікна
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
// Додано 'query' та 'where'
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore'; 

// Імпорт компонентів бічної панелі та хедера
import { HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon, ChevronDownIcon, BanknotesIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom'; // Залишаємо Link, бо він потрібен для бічної панелі

// URL для логотипу (посилається на файл у папці public)
const logoUrl = "/image.png";

function Accounts({ db, auth, userId }) {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAccount, setCurrentAccount] = useState(null); // Для редагування
    const [isSaving, setIsSaving] = useState(false);

    // Стан для форми додавання/редагування
    const [accountName, setAccountName] = useState('');
    const [accountBalance, setAccountBalance] = useState('');

    // Отримання ID додатку
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

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


    const openModal = (account = null) => {
        setCurrentAccount(account);
        setAccountName(account ? account.name : '');
        setAccountBalance(account ? account.balance : '');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAccount(null);
        setAccountName('');
        setAccountBalance('');
    };

    const handleSaveAccount = async (e) => {
        e.preventDefault();
        if (!db || !userId || !accountName.trim() || isNaN(parseFloat(accountBalance))) {
            console.error("Помилка: Необхідні дані для рахунку відсутні або некоректні.");
            return;
        }

        setIsSaving(true);
        const accountData = {
            name: accountName.trim(),
            balance: parseFloat(accountBalance),
            userId: userId,
            updatedAt: new Date().toISOString(),
            createdAt: currentAccount?.createdAt || new Date().toISOString()
        };

        try {
            if (currentAccount) {
                // Оновлення існуючого рахунку
                const accountRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, currentAccount.id);
                await updateDoc(accountRef, accountData);
                console.log("Рахунок успішно оновлено!");
            } else {
                // Додавання нового рахунку
                const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
                await addDoc(accountsCollectionRef, accountData);
                console.log("Рахунок успішно додано!");
            }
            closeModal();
        } catch (err) {
            console.error("Помилка збереження рахунку:", err);
            setError(new Error(`Помилка збереження рахунку: ${err.message || err}`));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async (accountId) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей рахунок? Усі пов’язані транзакції також можуть бути видалені.')) {
            if (!db || !userId) {
                console.error("Firebase або ID користувача недоступні.");
                return;
            }

            setIsSaving(true); // Використовуємо той самий індикатор
            try {
                // Видалення рахунку
                const accountRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, accountId);
                await deleteDoc(accountRef);

                // Опціонально: Видалення пов'язаних транзакцій.
                // Це вимагає окремого запиту і може бути повільним для великих наборів даних.
                // Для масштабованих рішень краще використовувати Cloud Functions.
                const transactionsQuery = query(collection(db, `/artifacts/${appId}/users/${userId}/transactions`), where('accountId', '==', accountId));
                const transactionsSnapshot = await onSnapshot(transactionsQuery, (snapshot) => {
                    snapshot.forEach(async (docRef) => {
                        await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/transactions`, docRef.id));
                    });
                    console.log("Пов'язані транзакції видалено (якщо вони були).");
                });
                transactionsSnapshot(); // Відписка від onSnapshot після виконання

                console.log("Рахунок успішно видалено!");
            } catch (err) {
                console.error("Помилка видалення рахунку:", err);
                setError(new Error(`Помилка видалення рахунку: ${err.message || err}`));
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження даних...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Бічна панель (скопійована з Dashboard для послідовності) */}
            <aside className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-r-xl">
                <div>
                    <div className="flex items-center mb-10">
                        <img src={logoUrl} alt="Finance Manager Logo" className="w-8 h-8 mr-2 object-contain" />
                        <span className="text-xl font-bold text-gray-900">Finance Manager</span>
                    </div>
                    <nav className="space-y-4">
                        <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <HomeIcon className="h-5 w-5 mr-3" /> Home
                        </Link>
                        <Link to="/budgets" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Budgets
                        </Link>
                        <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Goals
                        </Link>
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Accounts
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Transactions
                        </Link>
                        <Link to="/categories" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-3" /> Categories
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основний контент сторінки Рахунків */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                {/* Хедер (скопійований з Dashboard для послідовності) */}
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-end items-center mb-6">
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
                                <p className="font-semibold text-gray-800">{auth.currentUser?.email || 'Користувач'}</p>
                                <p className="text-gray-500">{userId}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Рахунки</h1>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" /> Додати рахунок
                    </button>
                </div>

                {/* Account List */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Ваші рахунки</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Назва</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Баланс</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {accounts.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">Рахунків не знайдено.</td>
                                    </tr>
                                ) : (
                                    accounts.map((acc) => (
                                        <tr key={acc.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{acc.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{acc.balance.toFixed(2)} ₴</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => openModal(acc)} className="text-blue-500 hover:text-blue-700">
                                                    <PencilIcon className="h-5 w-5 inline" />
                                                </button>
                                                <button onClick={() => handleDeleteAccount(acc.id)} className="text-red-500 hover:text-red-700">
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

                {/* Modal для додавання/редагування рахунку */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-xl font-bold mb-4">{currentAccount ? 'Редагувати' : 'Новий'} рахунок</h2>
                            <form onSubmit={handleSaveAccount} className="space-y-4">
                                <label className="block">
                                    <span className="text-gray-700">Назва рахунку:</span>
                                    <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} required className="mt-1 block w-full border p-2 rounded" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Початковий баланс:</span>
                                    <input type="number" step="0.01" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} required className="mt-1 block w-full border p-2 rounded" />
                                </label>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Зберігаємо...' : 'Зберегти'}
                                    </button>
                                    <button type="button" onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded">Скасувати</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Accounts;
