import React, { useState, useEffect } from 'react'; // Видалено useCallback з імпорту
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    XMarkIcon // Додано для закриття модального вікна
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
// Залишено тільки ті, що безпосередньо використовуються
import { collection, query, where, onSnapshot, doc, runTransaction } from 'firebase/firestore'; 

// Імпорт компонентів бічної панелі та хедера
import { HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon, ChevronDownIcon, BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// URL для логотипу (посилається на файл у папці public)
const logoUrl = "/image.png";

function Transactions({ db, auth, userId }) {
    // Стан для транзакцій, рахунків та категорій, отриманих з Firestore
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]); // Дані рахунків з Firestore
    const [categories, setCategories] = useState([]); // Дані категорій з Firestore
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Стан для модального вікна форми транзакції
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null); // Для редагування
    const [isSaving, setIsSaving] = useState(false); // Для індикатора збереження/оновлення

    // Стан для модального вікна підтвердження видалення
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    // Стан для фільтрів та пошуку
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterAccount, setFilterAccount] = useState('');
    const [filterType, setFilterType] = useState('');

    // Отримання ID додатку
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    // Функції відкриття/закриття модальних вікон
    const openTransactionModal = (transaction = null) => {
        setCurrentTransaction(transaction);
        setIsModalOpen(true);
    };

    const closeTransactionModal = () => {
        setIsModalOpen(false);
        setCurrentTransaction(null);
    };

    const openConfirmModal = (transaction) => {
        setTransactionToDelete(transaction);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
        setTransactionToDelete(null);
    };

    // --- useEffect для завантаження даних з Firestore ---
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false); // Немає db або userId, не можемо завантажувати
            return;
        }

        setLoading(true);

        // 1. Отримання рахунків
        const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
        const unsubscribeAccounts = onSnapshot(accountsCollectionRef, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
        }, (err) => {
            console.error("Transactions: Помилка отримання рахунків:", err);
            setError(err);
        });

        // 2. Отримання категорій (припустимо, вони також зберігаються користувачем)
        // Якщо категорії глобальні, шлях буде відрізнятися, наприклад, `/categories`
        const categoriesCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/categories`);
        const unsubscribeCategories = onSnapshot(categoriesCollectionRef, (snapshot) => {
            const fetchedCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Припускаємо, що категорії мають поле 'name'
            setCategories(fetchedCategories.map(cat => cat.name));
        }, (err) => {
            console.error("Transactions: Помилка отримання категорій:", err);
            setError(err);
        });


        // 3. Отримання транзакцій
        const transactionsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
        const unsubscribeTransactions = onSnapshot(transactionsCollectionRef, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (err) => {
            console.error("Transactions: Помилка отримання транзакцій:", err);
            setError(err);
            setLoading(false);
        });

        // Очищення підписок при розмонтуванні компонента
        return () => {
            unsubscribeAccounts();
            unsubscribeCategories();
            unsubscribeTransactions();
        };
    }, [db, userId, appId]);

    // --- Обробники Firestore операцій ---

    // Функція для додавання/оновлення транзакції
    const handleSaveTransaction = async (e) => {
        e.preventDefault();
        if (!db || !userId) {
            console.error("Firebase або ID користувача недоступні.");
            return;
        }

        setIsSaving(true);
        const formData = new FormData(e.target);
        const newTransactionData = {
            date: formData.get('date'),
            description: formData.get('description'),
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            accountId: formData.get('account'), // Змінено на accountId для посилання на ID рахунку
            type: formData.get('type'),
            userId: userId, // Переконайтеся, що userId завжди зберігається з транзакцією
            createdAt: currentTransaction?.createdAt || new Date().toISOString(), // Зберігаємо час створення
            updatedAt: new Date().toISOString() // Оновлюємо час оновлення
        };

        const accountDocRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, newTransactionData.accountId);

        try {
            await runTransaction(db, async (transactionFirestore) => {
                const accountDoc = await transactionFirestore.get(accountDocRef);

                if (!accountDoc.exists()) {
                    throw new Error("Рахунок не існує!"); // Виправлено: кидаємо об'єкт Error
                }

                let newAccountBalance = accountDoc.data().balance;
                let oldAmount = 0; // Для редагування

                if (currentTransaction) {
                    // Якщо редагуємо, спочатку відкатуємо стару суму
                    oldAmount = currentTransaction.amount;
                    if (currentTransaction.type === 'expense') {
                        newAccountBalance += oldAmount; // Додаємо назад стару витрату
                    } else { // income
                        newAccountBalance -= oldAmount; // Віднімаємо старий дохід
                    }
                }

                // Застосовуємо нову суму
                if (newTransactionData.type === 'expense') {
                    newAccountBalance -= newTransactionData.amount;
                } else { // income
                    newAccountBalance += newTransactionData.amount;
                }

                transactionFirestore.update(accountDocRef, { balance: newAccountBalance });

                if (currentTransaction) {
                    // Оновлення існуючої транзакції
                    const transactionRef = doc(db, `/artifacts/${appId}/users/${userId}/transactions`, currentTransaction.id);
                    transactionFirestore.update(transactionRef, newTransactionData);
                } else {
                    // Додавання нової транзакції
                    const transactionsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
                    // Використовуємо doc() без параметрів для генерації нового ID, потім set()
                    transactionFirestore.set(doc(transactionsCollectionRef), newTransactionData);
                }
            });

            console.log("Транзакція успішно збережена!");
            closeTransactionModal();
        } catch (e) {
            console.error("Помилка збереження транзакції або оновлення балансу рахунку: ", e);
            setError(new Error(`Помилка: ${e.message || e}`)); // Краще повідомлення про помилку
        } finally {
            setIsSaving(false);
        }
    };


    // Функція для видалення транзакції
    const handleDeleteTransaction = async () => {
        if (!db || !userId || !transactionToDelete) {
            console.error("Firebase або ID користувача недоступні, або транзакція для видалення не обрана.");
            return;
        }

        const transactionRef = doc(db, `/artifacts/${appId}/users/${userId}/transactions`, transactionToDelete.id);
        const accountDocRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, transactionToDelete.accountId);

        setIsSaving(true); // Використовуємо той самий індикатор
        try {
            await runTransaction(db, async (transactionFirestore) => {
                const accountDoc = await transactionFirestore.get(accountDocRef);

                if (!accountDoc.exists()) {
                    throw new Error("Рахунок не існує!"); // Виправлено: кидаємо об'єкт Error
                }

                let newAccountBalance = accountDoc.data().balance;
                // Відкатуємо суму транзакції з балансу рахунку
                if (transactionToDelete.type === 'expense') {
                    newAccountBalance += transactionToDelete.amount; // Додаємо назад витрату
                } else { // income
                    newAccountBalance -= transactionToDelete.amount; // Віднімаємо дохід
                }

                transactionFirestore.update(accountDocRef, { balance: newAccountBalance });
                transactionFirestore.delete(transactionRef); // Видаляємо транзакцію
            });

            console.log("Транзакція успішно видалена!");
            closeConfirmModal();
        } catch (e) {
            console.error("Помилка видалення транзакції або оновлення балансу рахунку: ", e);
            setError(new Error(`Помилка: ${e.message || e}`));
        } finally {
            setIsSaving(false);
        }
    };

    // Фільтрація та сортування транзакцій
    const filteredTransactions = transactions
        .filter(t =>
            t.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (filterCategory ? t.category === filterCategory : true) &&
            (filterAccount ? t.accountId === filterAccount : true) && // Фільтруємо за accountId
            (filterType ? t.type === filterType : true)
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // Сортування за датою DESC

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

            {/* Основний контент сторінки Транзакцій */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                {/* Хедер (скопійований з Dashboard для послідовності) */}
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-end items-center mb-6">
                    <div className="flex items-center space-x-6">
                        {/* Вибір бюджету (залишився статичним, можна додати отримання з Firestore) */}
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

                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">Транзакції</h1>

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => openTransactionModal()}
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
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
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
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {/* Відображаємо назву рахунку за його ID */}
                                                {accounts.find(acc => acc.id === t.accountId)?.name || 'Невідомий рахунок'}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => openTransactionModal(t)} className="text-blue-500 hover:text-blue-700">
                                                    <PencilIcon className="h-5 w-5 inline" />
                                                </button>
                                                <button onClick={() => openConfirmModal(t)} className="text-red-500 hover:text-red-700">
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

                {/* Modal для додавання/редагування транзакції */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg relative">
                            <button
                                onClick={closeTransactionModal}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-xl font-bold mb-4">{currentTransaction ? 'Редагувати' : 'Нова'} транзакція</h2>
                            <form onSubmit={handleSaveTransaction} className="space-y-4">
                                <label className="block">
                                    <span className="text-gray-700">Дата:</span>
                                    <input type="date" name="date" defaultValue={currentTransaction?.date || new Date().toISOString().substring(0, 10)} required className="mt-1 block w-full border p-2 rounded" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Опис:</span>
                                    <input type="text" name="description" placeholder="Опис" defaultValue={currentTransaction?.description} required className="mt-1 block w-full border p-2 rounded" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Сума:</span>
                                    <input type="number" name="amount" placeholder="Сума" step="0.01" defaultValue={currentTransaction?.amount} required className="mt-1 block w-full border p-2 rounded" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Категорія:</span>
                                    <select name="category" defaultValue={currentTransaction?.category} required className="mt-1 block w-full border p-2 rounded">
                                        <option value="">Оберіть категорію</option>
                                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Рахунок:</span>
                                    <select name="account" defaultValue={currentTransaction?.accountId} required className="mt-1 block w-full border p-2 rounded">
                                        <option value="">Оберіть рахунок</option>
                                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                    </select>
                                </label>
                                <label className="block">
                                    <span className="text-gray-700">Тип:</span>
                                    <select name="type" defaultValue={currentTransaction?.type || 'expense'} className="mt-1 block w-full border p-2 rounded">
                                        <option value="expense">Витрата</option>
                                        <option value="income">Дохід</option>
                                    </select>
                                </label>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Зберігаємо...' : 'Зберегти'}
                                    </button>
                                    <button type="button" onClick={closeTransactionModal} className="bg-gray-400 text-white px-4 py-2 rounded">Скасувати</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal для підтвердження видалення */}
                {isConfirmModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm relative">
                            <button
                                onClick={closeConfirmModal}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                            <h2 className="text-xl font-bold mb-4">Підтвердження видалення</h2>
                            <p className="mb-4">Ви впевнені, що хочете видалити транзакцію "{transactionToDelete?.description}"?</p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={handleDeleteTransaction}
                                    className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Видаляємо...' : 'Видалити'}
                                </button>
                                <button type="button" onClick={closeConfirmModal} className="bg-gray-400 text-white px-4 py-2 rounded">Скасувати</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Transactions;
