import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    HomeIcon, ClipboardDocumentListIcon, BanknotesIcon, CreditCardIcon, ListBulletIcon,
    UserCircleIcon, PlusIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon,
    ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon
} from "@heroicons/react/24/outline";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';

const logoUrl = "/image.png"; // Placeholder for the logo. Ensure this path is correct.

const currencies = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'UAH', name: 'Українська гривня', symbol: '₴' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

function Transactions({ db, auth, userId, userData }) {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [newTransaction, setNewTransaction] = useState({
        description: "",
        amount: "",
        type: "expense", // 'income' or 'expense'
        category: "Other",
        date: new Date().toISOString().substring(0, 10),
        currency: "UAH",
        accountId: "" // Will be set to the first available account or require user selection
    });
    const [editTransaction, setEditTransaction] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const [accounts, setAccounts] = useState([]); // For account dropdown

    // Filters and sorting
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all"); // 'all', 'income', 'expense'
    const [filterCategory, setFilterCategory] = useState("all"); // 'all' or specific category
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [sortBy, setSortBy] = useState("date"); // 'date' or 'amount'
    const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

    const [availableCategories, setAvailableCategories] = useState([]);

    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
    const navigate = useNavigate();

    // Fetch transactions and accounts from Firestore
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const unsubscribes = [];

        // Fetch accounts
        const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
        unsubscribes.push(onSnapshot(accountsCollectionRef, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
            // Set default account for new transaction if available and not already set
            if (fetchedAccounts.length > 0 && newTransaction.accountId === "") {
                setNewTransaction(prev => ({ ...prev, accountId: fetchedAccounts[0].id }));
            }
        }, (err) => {
            console.error("Transactions.js: Помилка отримання рахунків:", err);
            setError(err);
        }));

        // Fetch transactions
        const transactionsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
        unsubscribes.push(onSnapshot(transactionsCollectionRef, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(fetchedTransactions);

            const uniqueCategories = new Set();
            fetchedTransactions.forEach(t => {
                if (t.category && t.category !== 'All categories') uniqueCategories.add(t.category);
            });
            setAvailableCategories(Array.from(uniqueCategories));
            setLoading(false);
        }, (err) => {
            console.error("Transactions.js: Помилка отримання транзакцій:", err);
            setError(err);
            setLoading(false);
        }));

        return () => unsubscribes.forEach(unsub => unsub());
    }, [db, userId, appId, newTransaction.accountId]); // Added newTransaction.accountId to dependencies for initial account setting

    // Apply filters and sorting
    useEffect(() => {
        let tempTransactions = [...transactions];

        // Search
        if (searchTerm) {
            tempTransactions = tempTransactions.filter(t =>
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (filterType !== "all") {
            tempTransactions = tempTransactions.filter(t => t.type === filterType);
        }

        // Filter by category
        if (filterCategory !== "all") {
            tempTransactions = tempTransactions.filter(t => t.category === filterCategory);
        }

        // Filter by date range
        if (filterStartDate) {
            tempTransactions = tempTransactions.filter(t => t.date >= filterStartDate);
        }
        if (filterEndDate) {
            tempTransactions = tempTransactions.filter(t => t.date <= filterEndDate);
        }

        // Sort
        tempTransactions.sort((a, b) => {
            let valA, valB;
            if (sortBy === "date") {
                valA = new Date(a.date);
                valB = new Date(b.date);
            } else if (sortBy === "amount") {
                // Sort by signed amount, which is already stored in Firestore
                valA = parseFloat(a.amount);
                valB = parseFloat(b.amount);
            }
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });

        setFilteredTransactions(tempTransactions);
    }, [transactions, searchTerm, filterType, filterCategory, filterStartDate, filterEndDate, sortBy, sortOrder]);

    const handleAddTransaction = async () => {
        if (!db || !userId || !newTransaction.description.trim() || isNaN(parseFloat(newTransaction.amount)) || !newTransaction.date.trim() || !newTransaction.accountId) {
            setError(new Error("Будь ласка, заповніть усі обов'язкові поля."));
            return;
        }

        try {
            const amount = parseFloat(newTransaction.amount);
            // Ensure transaction amount is correctly signed based on type
            const transactionAmount = newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

            const transactionsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
            await addDoc(transactionsCollectionRef, {
                description: newTransaction.description.trim(),
                amount: transactionAmount,
                type: newTransaction.type,
                category: newTransaction.category,
                date: newTransaction.date, // Store as string "YYYY-MM-DD"
                currency: newTransaction.currency,
                accountId: newTransaction.accountId,
                createdAt: new Date().toISOString(),
                userId: userId
            });

            // Update account balance
            const accountDocRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, newTransaction.accountId);
            const currentAccount = accounts.find(acc => acc.id === newTransaction.accountId);
            if (currentAccount) {
                await updateDoc(accountDocRef, {
                    balance: (currentAccount.balance || 0) + transactionAmount
                });
            } else {
                console.warn("Transactions.js: Рахунок для оновлення балансу не знайдено:", newTransaction.accountId);
            }

            setNewTransaction({
                description: "", amount: "", type: "expense", category: "Other",
                date: new Date().toISOString().substring(0, 10), currency: "UAH", accountId: accounts[0]?.id || ""
            });
            setShowAddModal(false);
            setError(null);
        } catch (err) {
            console.error("Помилка додавання транзакції:", err);
            setError(new Error(`Помилка додавання транзакції: ${err.message}`));
        }
    };

    const handleEditTransaction = async () => {
        if (!editTransaction || !db || !userId || !editTransaction.description.trim() || isNaN(parseFloat(editTransaction.amount)) || !editTransaction.date.trim() || !editTransaction.accountId) {
            setError(new Error("Будь ласка, заповніть усі обов'язкові поля для редагування."));
            return;
        }

        try {
            const oldTransaction = transactions.find(t => t.id === editTransaction.id);
            if (!oldTransaction) {
                setError(new Error("Помилка: Стара транзакція не знайдена."));
                return;
            }

            const oldAmount = oldTransaction.amount; // This is the signed amount from Firestore
            const newAmountValue = parseFloat(editTransaction.amount); // User-entered, should be positive
            const newTransactionAmount = editTransaction.type === 'expense' ? -Math.abs(newAmountValue) : Math.abs(newAmountValue);

            const transactionDocRef = doc(db, `/artifacts/${appId}/users/${userId}/transactions`, editTransaction.id);
            await updateDoc(transactionDocRef, {
                description: editTransaction.description.trim(),
                amount: newTransactionAmount,
                type: editTransaction.type,
                category: editTransaction.category,
                date: editTransaction.date,
                currency: editTransaction.currency,
                accountId: editTransaction.accountId,
            });

            // Adjust account balance
            const accountDocRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, editTransaction.accountId);
            const currentAccount = accounts.find(acc => acc.id === editTransaction.accountId);

            if (currentAccount) {
                // The change in balance is (new_amount - old_amount)
                const balanceChange = newTransactionAmount - oldAmount;
                await updateDoc(accountDocRef, {
                    balance: (currentAccount.balance || 0) + balanceChange
                });
            } else {
                console.warn("Transactions.js: Рахунок для оновлення балансу не знайдено:", editTransaction.accountId);
            }

            setSelectedTransaction(null);
            setEditTransaction(null);
            setShowEditModal(false);
            setError(null);
        } catch (err) {
            console.error("Помилка оновлення транзакції:", err);
            setError(new Error(`Помилка оновлення транзакції: ${err.message}`));
        }
    };

    const handleDeleteTransaction = (transaction) => {
        setSelectedTransaction(transaction);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (selectedTransaction && db && userId) {
            try {
                // Adjust account balance before deleting transaction
                const accountDocRef = doc(db, `/artifacts/${appId}/users/${userId}/accounts`, selectedTransaction.accountId);
                const currentAccount = accounts.find(acc => acc.id === selectedTransaction.accountId);

                if (currentAccount) {
                    await updateDoc(accountDocRef, {
                        balance: (currentAccount.balance || 0) - selectedTransaction.amount // Subtracting the amount effectively adds it back if it was an expense (negative) or removes it if income (positive)
                    });
                } else {
                    console.warn("Transactions.js: Рахунок для оновлення балансу не знайдено при видаленні:", selectedTransaction.accountId);
                }

                await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/transactions`, selectedTransaction.id));
                setError(null);
            } catch (err) {
                console.error("Помилка видалення транзакції:", err);
                setError(new Error(`Помилка видалення транзакції: ${err.message}`));
            } finally {
                setShowDeleteConfirm(false);
                setSelectedTransaction(null);
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setSelectedTransaction(null);
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

    // Determine the display name
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження транзакцій...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-[#F7FAFC] font-['DM Sans']">
            {/* Sidebar */}
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
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" />  Рахунки  
                        </Link>
                        <Link to="/transactions" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Транзакції
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Керування транзакціями</h1>
                    <div className="flex items-center space-x-6">
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
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Список транзакцій</h2>

                    {/* Filters and Search */}
                    <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Пошук за описом або категорією..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="relative">
                            <label htmlFor="filterType" className="sr-only">Тип транзакції</label>
                            <select
                                id="filterType"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                            >
                                <option value="all">Всі типи</option>
                                <option value="income">Дохід</option>
                                <option value="expense">Витрата</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>

                        <div className="relative">
                            <label htmlFor="filterCategory" className="sr-only">Категорія</label>
                            <select
                                id="filterCategory"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                            >
                                <option value="all">Всі категорії</option>
                                {availableCategories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>

                        <div className="flex space-x-2">
                            <input
                                type="date"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                title="Дата початку"
                            />
                            <input
                                type="date"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                                className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                title="Дата закінчення"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-4">
                            <div className="relative">
                                <label htmlFor="sortBy" className="sr-only">Сортувати за</label>
                                <select
                                    id="sortBy"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                >
                                    <option value="date">Датою</option>
                                    <option value="amount">Сумою</option>
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <label htmlFor="sortOrder" className="sr-only">Порядок сортування</label>
                                <select
                                    id="sortOrder"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                >
                                    <option value="desc">Спаданням</option>
                                    <option value="asc">Зростанням</option>
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-[#2C5282] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4299E1] transition-colors duration-200 flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" /> Додати транзакцію
                        </button>
                    </div>

                    {filteredTransactions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Немає транзакцій, що відповідають критеріям.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F0F4F8]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Опис</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Сума</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Тип</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Категорія</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Дата</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Рахунок</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Дії</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransactions.map(transaction => {
                                        const currencySymbol = currencies.find(c => c.code === transaction.currency)?.symbol || '';
                                        // Display amount: if expense, show negative sign, otherwise positive, and always show symbol.
                                        // Math.abs ensures we work with a positive value for display, then add the sign.
                                        const displayAmount = `${transaction.type === 'expense' ? '-' : '+'}${currencySymbol}${Math.abs(transaction.amount).toFixed(2)}`;
                                        const amountColorClass = transaction.type === 'expense' ? 'text-red-600' : 'text-green-600';
                                        const accountName = accounts.find(acc => acc.id === transaction.accountId)?.name || 'Невідомий рахунок';

                                        return (
                                            <tr key={transaction.id} className="hover:bg-[#EBF8FF] transition-colors duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.description}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${amountColorClass}`}>{displayAmount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                        ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {transaction.type === 'income' ? 'Дохід' : 'Витрата'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.category}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{accountName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTransaction(transaction);
                                                            // For editing, we show a positive amount for the user to adjust.
                                                            // The type determines if it's income or expense when saving.
                                                            setEditTransaction({ ...transaction, amount: Math.abs(transaction.amount) });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-md hover:bg-indigo-50"
                                                        title="Редагувати"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTransaction(transaction)}
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

                {/* Add Transaction Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Додати нову транзакцію</h2>

                            <div className="mb-4 space-y-3">
                                <div className="relative">
                                    <label htmlFor="newTransactionDescription" className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                                    <input
                                        id="newTransactionDescription"
                                        type="text"
                                        placeholder="Напр. 'Кава', 'Зарплата'"
                                        value={newTransaction.description}
                                        onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="newTransactionAmount" className="block text-sm font-medium text-gray-700 mb-1">Сума</label>
                                    <input
                                        id="newTransactionAmount"
                                        type="number"
                                        placeholder="Напр. 25.00"
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        step="0.01"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="newTransactionType" className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                                    <select
                                        id="newTransactionType"
                                        value={newTransaction.type}
                                        onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                    >
                                        <option value="expense">Витрата</option>
                                        <option value="income">Дохід</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <label htmlFor="newTransactionCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        id="newTransactionCategory"
                                        type="text"
                                        placeholder="Напр. 'Їжа', 'Транспорт'"
                                        value={newTransaction.category}
                                        onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                        list="categoriesList"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <datalist id="categoriesList">
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="relative">
                                    <label htmlFor="newTransactionDate" className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                                    <input
                                        id="newTransactionDate"
                                        type="date"
                                        value={newTransaction.date}
                                        onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="newTransactionCurrency" className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                    <select
                                        id="newTransactionCurrency"
                                        value={newTransaction.currency}
                                        onChange={e => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                        required
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <label htmlFor="newTransactionAccount" className="block text-sm font-medium text-gray-700 mb-1">Рахунок</label>
                                    <select
                                        id="newTransactionAccount"
                                        value={newTransaction.accountId}
                                        onChange={e => setNewTransaction({ ...newTransaction, accountId: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                        required
                                    >
                                        {accounts.length === 0 ? (
                                            <option value="">Додайте рахунок</option>
                                        ) : (
                                            accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))
                                        )}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleAddTransaction}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                >
                                    Додати
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Transaction Modal */}
                {showEditModal && editTransaction && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                            <button
                                onClick={() => { setShowEditModal(false); setEditTransaction(null); setSelectedTransaction(null); }}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center">Редагувати транзакцію</h2>

                            <div className="mb-4 space-y-3">
                                <div className="relative">
                                    <label htmlFor="editTransactionDescription" className="block text-sm font-medium text-gray-700 mb-1">Опис</label>
                                    <input
                                        id="editTransactionDescription"
                                        type="text"
                                        value={editTransaction.description}
                                        onChange={e => setEditTransaction({ ...editTransaction, description: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="editTransactionAmount" className="block text-sm font-medium text-gray-700 mb-1">Сума</label>
                                    <input
                                        id="editTransactionAmount"
                                        type="number"
                                        value={editTransaction.amount}
                                        onChange={e => setEditTransaction({ ...editTransaction, amount: e.target.value })}
                                        step="0.01"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="editTransactionType" className="block text-sm font-medium text-gray-700 mb-1">Тип</label>
                                    <select
                                        id="editTransactionType"
                                        value={editTransaction.type}
                                        onChange={e => setEditTransaction({ ...editTransaction, type: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                    >
                                        <option value="expense">Витрата</option>
                                        <option value="income">Дохід</option>
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <label htmlFor="editTransactionCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        id="editTransactionCategory"
                                        type="text"
                                        value={editTransaction.category}
                                        onChange={e => setEditTransaction({ ...editTransaction, category: e.target.value })}
                                        list="categoriesList"
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <datalist id="categoriesList">
                                        {availableCategories.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="relative">
                                    <label htmlFor="editTransactionDate" className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                                    <input
                                        id="editTransactionDate"
                                        type="date"
                                        value={editTransaction.date}
                                        onChange={e => setEditTransaction({ ...editTransaction, date: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="editTransactionCurrency" className="block text-sm font-medium text-gray-700 mb-1">Валюта</label>
                                    <select
                                        id="editTransactionCurrency"
                                        value={editTransaction.currency}
                                        onChange={e => setEditTransaction({ ...editTransaction, currency: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                        required
                                    >
                                        {currencies.map(c => (
                                            <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                                </div>
                                <div className="relative">
                                    <label htmlFor="editTransactionAccount" className="block text-sm font-medium text-gray-700 mb-1">Рахунок</label>
                                    <select
                                        id="editTransactionAccount"
                                        value={editTransaction.accountId}
                                        onChange={e => setEditTransaction({ ...editTransaction, accountId: e.target.value })}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white pr-8"
                                        required
                                    >
                                        {accounts.length === 0 ? (
                                            <option value="">Додайте рахунок</option>
                                        ) : (
                                            accounts.map(acc => (
                                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                                            ))
                                        )}
                                    </select>
                                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={() => { setShowEditModal(false); setEditTransaction(null); setSelectedTransaction(null); }}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleEditTransaction}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && selectedTransaction && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                            <div className="flex items-center text-red-500 mb-4">
                                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Підтвердити видалення</h3>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Ви впевнені, що хочете видалити транзакцію "{selectedTransaction.description}"?
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

export default Transactions;
