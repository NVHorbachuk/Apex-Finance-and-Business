import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler as FillerPlugin } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
    BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, ChartBarIcon,
    ArrowUpIcon, ArrowDownIcon, UsersIcon,
    PencilIcon, TrashIcon, ExclamationTriangleIcon // Додано ці іконки
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Реєстрація компонентів Chart.js та FillerPlugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, FillerPlugin);

// URL для логотипу (посилається на файл у папці public)
const logoUrl = "/image.png";

// Функція для отримання назви місяця українською
const getMonthName = (monthIndex) => {
    const months = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    return months[monthIndex];
};

function Dashboard({ db, auth, userId, userData }) { // Приймаємо userData
    // Стан для динамічних даних, отриманих з Firestore
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [currentAccount, setCurrentAccount] = useState('');
    const [currentSelectedBudgetId, setCurrentSelectedBudgetId] = useState(''); // Новий стан для вибраного бюджету
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadedSourcesCount, setLoadedSourcesCount] = useState(0);

    // Стан для даних графіків та зведень
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
    const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
    const [overallBalance, setOverallBalance] = useState(0);
    const [latestTransactions, setLatestTransactions] = useState([]);
    const [largestExpenses, setLargestExpenses] = useState([]);
    const [dailyFinancialSummary, setDailyFinancialSummary] = useState({});

    // Стан для форми додавання нового рахунку
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [addingAccount, setAddingAccount] = useState(false);

    // Стан для управління бюджетами (інтегровано з Budgets.js)
    const [showCreateBudgetModal, setShowCreateBudgetModal] = useState(false);
    const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
    const [showDeleteBudgetConfirm, setShowDeleteBudgetConfirm] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [newBudget, setNewBudget] = useState({ name: '', limit: 0, spent: 0, category: '' });
    const [editBudget, setEditBudget] = useState({ name: '', limit: 0, spent: 0, category: '' });

    // Стан для календаря
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Виправлено, щоб не змінювався випадково
    const [calendarDaysFirstMonth, setCalendarDaysFirstMonth] = useState([]);
    const [calendarDaysSecondMonth, setCalendarDaysSecondMonth] = useState([]);

    // Отримання ID додатку
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    const navigate = useNavigate();

    // useCallback для функцій обробки даних, щоб уникнути зайвих ре-рендерів
    const processFinancialData = useCallback((fetchedTransactions, fetchedAccounts) => {
        const parseDateStringForSort = (dateString) => {
            if (!dateString) return new Date(0);
            const parts = dateString.split('.');
            if (parts.length === 3) { // DD.MM.YYYY
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            return new Date(dateString); // YYYY-MM-DD
        };

        const dailySummary = {};
        fetchedTransactions.forEach(t => {
            const dateObj = new Date(t.date);
            if (isNaN(dateObj.getTime())) {
                console.warn(`Некоректна дата транзакції: ${t.date}`);
                return;
            }
            const dateKey = dateObj.toISOString().substring(0, 10);

            if (!dailySummary[dateKey]) {
                dailySummary[dateKey] = { income: 0, expense: 0, count: 0, categories: {} };
            }
            if (t.type === 'income') {
                dailySummary[dateKey].income += t.amount;
            } else {
                dailySummary[dateKey].expense += Math.abs(t.amount);
            }
            dailySummary[dateKey].count += 1;
            const category = t.category || 'Без категорії';
            dailySummary[dateKey].categories[category] = (dailySummary[dateKey].categories[category] || 0) + Math.abs(t.amount);
        });
        setDailyFinancialSummary(dailySummary);


        const dailyDataForLineChart = fetchedTransactions.reduce((acc, transaction) => {
            const transactionDate = new Date(transaction.date);
            if (isNaN(transactionDate.getTime())) return acc;
            const dateKey = transactionDate.toLocaleDateString('uk-UA');
            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey] += (transaction.type === 'income' ? transaction.amount : -Math.abs(transaction.amount));
            return acc;
        }, {});

        const sortedDatesForLineChart = Object.keys(dailyDataForLineChart).sort((a, b) => parseDateStringForSort(a) - parseDateStringForSort(b));
        let cumulativeBalance = 0;
        const lineLabels = [];
        const lineValues = [];
        sortedDatesForLineChart.forEach(date => {
            cumulativeBalance += dailyDataForLineChart[date];
            lineLabels.push(date);
            lineValues.push(cumulativeBalance);
        });

        setLineChartData({
            labels: lineLabels,
            datasets: [
                {
                    label: 'Чистий баланс',
                    data: lineValues,
                    borderColor: '#4A5568',
                    backgroundColor: 'rgba(74, 85, 104, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
            ],
        });

        const categorySpending = fetchedTransactions.filter(t => t.type === 'expense').reduce((acc, transaction) => {
            const category = transaction.category || 'Без категорії';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += Math.abs(transaction.amount);
            return acc;
        }, {});

        const pieLabels = Object.keys(categorySpending);
        const pieValues = Object.values(categorySpending);

        setPieChartData({
            labels: pieLabels,
            datasets: [
                {
                    data: pieValues,
                    backgroundColor: [
                        '#2C5282', '#4299E1', '#38B2AC', '#48BB78', '#ECC94B',
                        '#ED8936', '#E53E3E', '#805AD5', '#667EEA', '#A0AEC0',
                        '#A78BFA', '#F6AD55', '#2D3748', '#C05621', '#319795',
                        '#2C7A7B', '#B794F4', '#CBD5E0', '#9F7AEA', '#D53F8C',
                        '#00A3C4'
                    ],
                    hoverOffset: 4,
                },
            ],
        });

        const totalOverallBalance = fetchedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        setOverallBalance(totalOverallBalance);

        const sortedTransactions = [...fetchedTransactions].sort((a, b) => {
            const dateA = parseDateStringForSort(a.date);
            const dateB = parseDateStringForSort(b.date);
            return dateB - dateA;
        });
        setLatestTransactions(sortedTransactions.slice(0, 5));

        const expenses = fetchedTransactions.filter(t => t.type === 'expense');
        const sortedExpenses = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        setLargestExpenses(sortedExpenses.slice(0, 5));

    }, []);

    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setLoadedSourcesCount(0);

        const unsubscribes = [];

        const incrementLoadedCount = () => {
            setLoadedSourcesCount(prev => prev + 1);
        };

        const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
        unsubscribes.push(onSnapshot(accountsCollectionRef, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0 && !currentAccount) {
                setCurrentAccount(fetchedAccounts[0].id);
            }
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Помилка отримання рахунків:", err);
            setError(err);
            incrementLoadedCount();
        }));

        let transactionsQueryRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
        if (currentAccount) {
            transactionsQueryRef = query(transactionsQueryRef, where('accountId', '==', currentAccount));
        }
        unsubscribes.push(onSnapshot(transactionsQueryRef, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(fetchedTransactions);
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Помилка отримання транзакцій:", err);
            setError(err);
            incrementLoadedCount();
        }));

        const goalsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/goals`);
        unsubscribes.push(onSnapshot(goalsCollectionRef, (snapshot) => {
            const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGoals(fetchedGoals);
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Помилка отримання цілей:", err);
            setError(err);
            incrementLoadedCount();
        }));

        const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
        unsubscribes.push(onSnapshot(budgetsCollectionRef, (snapshot) => {
            const fetchedBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(fetchedBudgets);
            if (fetchedBudgets.length > 0 && !currentSelectedBudgetId) {
                setCurrentSelectedBudgetId(fetchedBudgets[0].id);
            }
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Помилка отримання бюджетів:", err);
            setError(err);
            incrementLoadedCount();
        }));

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [db, userId, appId, currentAccount, currentSelectedBudgetId]);

    useEffect(() => {
        const totalExpectedSources = 4;
        if (loadedSourcesCount >= totalExpectedSources) {
            setLoading(false);
        }
    }, [loadedSourcesCount]);

    useEffect(() => {
        if (!loading) {
            const hasData = accounts.length > 0 || transactions.length > 0 || goals.length > 0 || budgets.length > 0;
            if (hasData || loadedSourcesCount === 4) {
                processFinancialData(transactions, accounts);
            }
        }
    }, [transactions, accounts, goals, budgets, loading, processFinancialData, loadedSourcesCount]);

    const handleAddAccount = async (e) => {
        e.preventDefault();
        if (!db || !userId || !newAccountName.trim() || isNaN(parseFloat(newAccountBalance))) {
            console.error("Помилка: Необхідні дані для додавання рахунку відсутні або некоректні.");
            return;
        }

        setAddingAccount(true);
        try {
            const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
            await addDoc(accountsCollectionRef, {
                name: newAccountName.trim(),
                balance: parseFloat(newAccountBalance),
                createdAt: new Date().toISOString(),
                userId: userId
            });
            setNewAccountName('');
            setNewAccountBalance('');
            console.log("Рахунок успішно додано!");
        } catch (err) {
            console.error("Помилка додавання рахунку:", err);
            setError(err);
        } finally {
            setAddingAccount(false);
        }
    };

    const handleCreateBudget = async () => {
        if (!db || !userId || !newBudget.name.trim() || isNaN(parseFloat(newBudget.limit))) {
            setError(new Error("Будь ласка, заповніть назву бюджету та ліміт."));
            return;
        }

        try {
            const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
            const docRef = await addDoc(budgetsCollectionRef, {
                name: newBudget.name.trim(),
                limit: parseFloat(newBudget.limit),
                spent: 0,
                category: newBudget.category.trim(),
                createdAt: new Date().toISOString(),
                userId: userId
            });
            setNewBudget({ name: '', limit: 0, spent: 0, category: '' });
            setShowCreateBudgetModal(false);
            setCurrentSelectedBudgetId(docRef.id);
            console.log("Бюджет успішно додано!");
        } catch (err) {
            console.error("Помилка додавання бюджету:", err);
            setError(new Error(`Помилка додавання бюджету: ${err.message}`));
        }
    };

    const handleEditBudget = async () => {
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
            setShowEditBudgetModal(false);
            console.log("Бюджет успішно оновлено!");
        } catch (err) {
            console.error("Помилка оновлення бюджету:", err);
            setError(new Error(`Помилка оновлення бюджету: ${err.message}`));
        }
    };

    const handleDeleteBudget = (budget) => {
        setSelectedBudget(budget);
        setShowDeleteBudgetConfirm(true);
    };

    const confirmDeleteBudget = async () => {
        if (selectedBudget && db && userId) {
            try {
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/budgets`, selectedBudget.id));
                console.log("Бюджет успішно видалено!");
            } catch (err) {
                console.error("Помилка видалення бюджету:", err);
                setError(new Error(`Помилка видалення бюджету: ${err.message}`));
            } finally {
                setShowDeleteBudgetConfirm(false);
                setSelectedBudget(null);
                if (budgets.length > 1) {
                    setCurrentSelectedBudgetId(budgets.find(b => b.id !== selectedBudget.id)?.id || '');
                } else {
                    setCurrentSelectedBudgetId('');
                }
            }
        }
    };

    const cancelDeleteBudget = () => {
        setShowDeleteBudgetConfirm(false);
        setSelectedBudget(null);
    };

    const generateDaysArray = useCallback((month, year) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const numDays = lastDayOfMonth.getDate();
        const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= numDays; i++) {
            days.push(i);
        }
        return days;
    }, []);

    useEffect(() => {
        setCalendarDaysFirstMonth(generateDaysArray(currentMonth, currentYear));
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        setCalendarDaysSecondMonth(generateDaysArray(nextMonth, nextYear));
    }, [currentMonth, currentYear, generateDaysArray]);

    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => {
            if (prevMonth === 0) {
                setCurrentYear(prevYear => prevYear - 1);
                return 11;
            }
            return prevMonth - 1;
        });
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => {
            if (prevMonth === 11) {
                setCurrentYear(prevYear => prevYear + 1);
                return 0;
            }
            return prevMonth + 1;
        });
    };

    const isTodayFn = useCallback((day, month, year) => {
        const localToday = new Date();
        return day === localToday.getDate() && month === localToday.getMonth() && year === localToday.getFullYear();
    }, []);

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

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            x: { grid: { display: false }, ticks: { display: true, font: { size: 10 } } },
            y: { beginAtZero: true, grid: { display: true, color: 'rgba(200, 200, 200, 0.2)' }, ticks: { font: { size: 10 } } },
        },
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } },
            tooltip: { enabled: true }
        },
    };

    // Визначення імені для відображення
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження даних...</div>;
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
                        <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                        {/* Нове посилання на Налаштування профілю */}
                        <Link to="/profile-settings" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основна область контенту */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                {/* Верхній бар */}
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-end items-center mb-6">
                    <div className="flex items-center space-x-6">
                        {/* Вибір бюджету */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={currentSelectedBudgetId}
                                onChange={(e) => setCurrentSelectedBudgetId(e.target.value)}
                            >
                                {budgets.length > 0 ? (
                                    budgets.map(budget => (
                                        <option key={budget.id} value={budget.id}>{budget.name}</option>
                                    ))
                                ) : (
                                    <option value="">Немає бюджетів</option>
                                )}
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>
                        <BellIcon className="h-6 w-6 text-gray-500 cursor-pointer hover:text-blue-600" />
                        <div className="flex items-center space-x-2">
                            <UserCircleIcon className="h-8 w-8 text-blue-500" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800">{displayName}</p>
                                {/* Рядок з userId видалено */}
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

                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Основна панель для
                    <span className="relative inline-block ml-2">
                        <select
                            className="appearance-none bg-transparent text-blue-600 font-bold pr-6 cursor-pointer focus:outline-none focus:ring-0"
                            value={currentAccount}
                            onChange={(e) => setCurrentAccount(e.target.value)}
                        >
                            {accounts.length > 0 ? (
                                accounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))
                            ) : (
                                <option value="">Немає рахунків</option>
                            )}
                        </select>
                        <ChevronDownIcon className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
                    </span>
                </h1>

                {/* --- Верхній блок: Загальний баланс та Баланс по рахунках --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Загальний баланс */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 md:col-span-1 flex flex-col justify-between">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Загальний баланс</h2>
                        <p className="text-5xl font-extrabold text-[#2C5282]">${overallBalance.toFixed(2)}</p>
                    </div>

                    {/* Баланс по рахунках */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 md:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Баланс по рахунках</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {accounts.length === 0 ? (
                                <p className="text-gray-500">Немає доданих рахунків.</p>
                            ) : (
                                accounts.map(account => (
                                    <div key={account.id} className="flex items-center bg-[#EDF2F7] p-3 rounded-lg shadow-sm">
                                        <CreditCardIcon className="h-6 w-6 text-[#4A5568] mr-3" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{account.name}</p>
                                            <p className="text-sm text-gray-600">${account.balance.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Форма для додавання нового рахунку */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Додати новий рахунок</h2>
                    <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <input
                            type="text"
                            placeholder="Назва рахунку (напр. 'Готівка')"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Початковий баланс (напр. 1000.00)"
                            value={newAccountBalance}
                            onChange={(e) => setNewAccountBalance(e.target.value)}
                            step="0.01"
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-[#2C5282] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#4299E1] transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={addingAccount}
                        >
                            {addingAccount ? 'Додаємо...' : 'Додати рахунок'}
                        </button>
                    </form>
                </div>

                {/* --- Середина: Графіки доходів/витрат, Бюджети, Цілі --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Секція календаря з фінансовими даними */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        {/* Заголовок та навігація календаря */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center text-lg font-semibold text-gray-800">
                                <ChevronLeftIcon className="h-5 w-5 text-[#4A5568] cursor-pointer mr-2" onClick={goToPreviousMonth} />
                                <span>{getMonthName(currentMonth)} {currentYear}</span>
                                <ChevronRightIcon className="h-5 w-5 text-[#4A5568] cursor-pointer ml-2" onClick={goToNextMonth} />
                            </div>
                        </div>

                        {/* Календарі (два поруч) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Перший місяць */}
                            <div className="calendar-month p-3 bg-[#F0F4F8] rounded-lg">
                                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => <span key={day}>{day}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                    {calendarDaysFirstMonth.map((day, index) => {
                                        const dateKey = day !== null ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                                        const daySummary = dateKey ? dailyFinancialSummary[dateKey] : null;
                                        const isToday = isTodayFn(day, currentMonth, currentYear);

                                        return (
                                            <span
                                                key={`day-${currentMonth}-${currentYear}-${day || index}`}
                                                className={`p-1 rounded-full flex flex-col items-center justify-start text-center text-sm relative transition-colors duration-200
                                                    ${day === null ? 'opacity-0 cursor-default' : 'text-gray-800'}
                                                    ${isToday ? 'bg-[#3182CE] text-white font-bold' : (day !== null ? 'hover:bg-[#E2E8F0] cursor-pointer' : '')}
                                                `}
                                                style={{ minHeight: '60px' }}
                                            >
                                                {day}
                                                {daySummary && (daySummary.expense > 0 || daySummary.income > 0) && (
                                                    <div className="text-xs mt-1">
                                                        {daySummary.expense > 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-[#E53E3E]'} font-semibold block`}>
                                                                -${daySummary.expense.toFixed(0)}
                                                            </span>
                                                        )}
                                                        {daySummary.income > 0 && daySummary.expense === 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-[#38A169]'} font-semibold block`}>
                                                                +${daySummary.income.toFixed(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Другий місяць */}
                            <div className="calendar-month p-3 bg-[#F0F4F8] rounded-lg">
                                <div className="flex justify-between items-center text-sm font-medium mb-3">
                                    <span>{getMonthName(currentMonth === 11 ? 0 : currentMonth + 1)} {currentMonth === 11 ? currentYear + 1 : currentYear}</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => <span key={day}>{day}</span>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                    {calendarDaysSecondMonth.map((day, index) => {
                                        const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
                                        const nextYearForDate = currentMonth === 11 ? currentYear + 1 : currentYear;
                                        const dateKey = day !== null ? `${nextYearForDate}-${String(nextMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                                        const daySummary = dateKey ? dailyFinancialSummary[dateKey] : null;
                                        const isToday = isTodayFn(day, nextMonthIndex, nextYearForDate);

                                        return (
                                            <span
                                                key={`day-${nextMonthIndex}-${nextYearForDate}-${day || index}`}
                                                className={`p-1 rounded-full flex flex-col items-center justify-start text-center text-sm relative transition-colors duration-200
                                                    ${day === null ? 'opacity-0 cursor-default' : 'text-gray-800'}
                                                    ${isToday ? 'bg-[#3182CE] text-white font-bold' : (day !== null ? 'hover:bg-[#E2E8F0] cursor-pointer' : '')}
                                                `}
                                                style={{ minHeight: '60px' }}
                                            >
                                                {day}
                                                {daySummary && (daySummary.expense > 0 || daySummary.income > 0) && (
                                                    <div className="text-xs mt-1">
                                                        {daySummary.expense > 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-[#E53E3E]'} font-semibold block`}>
                                                                -${daySummary.expense.toFixed(0)}
                                                            </span>
                                                        )}
                                                        {daySummary.income > 0 && daySummary.expense === 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-[#38A169]'} font-semibold block`}>
                                                                +${daySummary.income.toFixed(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Графік Чистого Балансу (Income vs Expenses Trend) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Тенденція чистого балансу (Доходи vs Витрати)</h2>
                            <ChartBarIcon className="h-6 w-6 text-[#4A5568]" />
                        </div>
                        <div className="relative h-48 w-full">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* Бюджети (прогрес бари та управління) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Ваші бюджети</h2>
                            <button
                                onClick={() => setShowCreateBudgetModal(true)}
                                className="bg-[#2C5282] text-white px-4 py-2 rounded-lg shadow hover:bg-[#4299E1] transition-colors duration-200 flex items-center"
                            >
                                <BanknotesIcon className="h-5 w-5 mr-2" /> Додати новий
                            </button>
                        </div>
                        {budgets.length === 0 ? (
                            <p className="text-gray-500">Немає доданих бюджетів.</p>
                        ) : (
                            <div className="space-y-4">
                                {budgets
                                    .filter(budget => currentSelectedBudgetId ? budget.id === currentSelectedBudgetId : true)
                                    .map(budget => {
                                        const progress = (budget.spent / budget.limit) * 100;
                                        const progressColor = progress > 100 ? 'bg-[#E53E3E]' : 'bg-[#38A169]';
                                        return (
                                            <div key={budget.id} className="group hover:bg-[#EDF2F7] p-2 rounded-lg transition-colors duration-150 flex items-center justify-between">
                                                <div className="flex-1 mr-4">
                                                    <div className="flex justify-between text-sm text-gray-800 mb-1">
                                                        <span>{budget.name} ({budget.category})</span>
                                                        <span>${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                                                    </div>
                                                    <div className="w-full bg-[#E2E8F0] rounded-full h-2.5">
                                                        <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedBudget(budget);
                                                            setEditBudget({ ...budget });
                                                            setShowEditBudgetModal(true);
                                                        }}
                                                        className="text-gray-500 hover:text-blue-600 p-1 rounded-md hover:bg-gray-100"
                                                        title="Редагувати"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBudget(budget)}
                                                        className="text-gray-500 hover:text-red-600 p-1 rounded-md hover:bg-gray-100"
                                                        title="Видалити"
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Цілі (накопичення) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col col-span-1 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Ваші цілі</h2>
                        {goals.length === 0 ? (
                            <p className="text-gray-500">Немає доданих цілей.</p>
                        ) : (
                            <div className="space-y-4">
                                {goals.map(goal => {
                                    const progress = (goal.currentProgress / goal.targetAmount) * 100;
                                    const remaining = goal.targetAmount - goal.currentProgress;
                                    const isAchieved = goal.currentProgress >= goal.targetAmount;
                                    return (
                                        <div key={goal.id} className="group hover:bg-[#EDF2F7] p-2 rounded-lg transition-colors duration-150">
                                            <div className="flex justify-between text-sm text-gray-800 mb-1">
                                                <span>{goal.name}</span>
                                                <span>
                                                    ${goal.currentProgress.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                                                    {isAchieved ? <span className="ml-2 text-[#38A169] font-semibold"> (Досягнуто!)</span> : ''}
                                                </span>
                                            </div>
                                            <div className="w-full bg-[#E2E8F0] rounded-full h-2.5">
                                                <div className="bg-[#4299E1] h-2.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
                                            </div>
                                            {!isAchieved && (
                                                <p className="text-xs text-gray-500 mt-1">Залишилось: ${remaining.toFixed(2)} до {goal.dueDate}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Нижня частина: Останні транзакції, Найбільші витрати, Популярні категорії --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Останні транзакції */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Останні транзакції</h2>
                        {latestTransactions.length === 0 ? (
                            <p className="text-gray-500">Немає останніх транзакцій.</p>
                        ) : (
                            <ul className="space-y-3">
                                {latestTransactions.map(t => (
                                    <li key={t.id} className="flex items-center justify-between text-sm text-gray-800 border-b pb-2 last:border-b-0 last:pb-0 group hover:bg-[#EDF2F7] px-2 -mx-2 rounded-lg transition-colors duration-150">
                                        <div className="flex items-center">
                                            {t.type === 'income' ? (
                                                <ArrowUpIcon className="h-4 w-4 text-[#38A169] mr-2" />
                                            ) : (
                                                <ArrowDownIcon className="h-4 w-4 text-[#E53E3E] mr-2" />
                                            )}
                                            <div>
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('uk-UA')}</p>
                                            </div>
                                        </div>
                                        <span className={`font-semibold ${t.type === 'income' ? 'text-[#38A169]' : 'text-[#E53E3E]'}`}>
                                            {t.type === 'income' ? '+' : '-'}{Math.abs(t.amount).toFixed(2)} ₴
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Найбільші витрати */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Найбільші витрати</h2>
                        {largestExpenses.length === 0 ? (
                            <p className="text-gray-500">Немає найбільших витрат.</p>
                        ) : (
                            <ul className="space-y-3">
                                {largestExpenses.map(t => (
                                    <li key={t.id} className="flex items-center justify-between text-sm text-gray-800 border-b pb-2 last:border-b-0 last:pb-0 group hover:bg-[#EDF2F7] px-2 -mx-2 rounded-lg transition-colors duration-150">
                                        <div className="flex items-center">
                                            <ArrowDownIcon className="h-4 w-4 text-[#E53E3E] mr-2" />
                                            <div>
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('uk-UA')} ({t.category})</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-[#E53E3E]">
                                            -{Math.abs(t.amount).toFixed(2)} ₴
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Популярні категорії (використовує Pie Chart) */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 lg:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Витрати за категоріями</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="relative h-56 w-56 md:w-1/2 flex items-center justify-center mb-4 md:mb-0">
                                <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                            <ul className="text-gray-700 text-sm space-y-2 w-full md:w-1/2 pl-0 md:pl-4">
                                {pieChartData.labels.map((label, index) => (
                                    <li key={label} className="flex items-center">
                                        <span
                                            className="inline-block w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index] }}
                                        ></span>
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Модальне вікно для створення нового бюджету */}
                {showCreateBudgetModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Створити новий бюджет</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="newBudgetName" className="block text-sm font-medium text-gray-700 mb-1">Назва бюджету</label>
                                    <input
                                        id="newBudgetName"
                                        type="text"
                                        placeholder="Напр. 'Продукти'"
                                        value={newBudget.name}
                                        onChange={e => setNewBudget({ ...newBudget, name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newBudgetLimit" className="block text-sm font-medium text-gray-700 mb-1">Ліміт бюджету</label>
                                    <input
                                        id="newBudgetLimit"
                                        type="number"
                                        placeholder="Напр. 500.00"
                                        value={newBudget.limit === 0 ? '' : newBudget.limit}
                                        onChange={e => setNewBudget({ ...newBudget, limit: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newBudgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        id="newBudgetCategory"
                                        type="text"
                                        placeholder="Напр. 'Їжа', 'Транспорт'"
                                        value={newBudget.category}
                                        onChange={e => setNewBudget({ ...newBudget, category: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setShowCreateBudgetModal(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleCreateBudget}
                                    className="px-6 py-2 bg-[#2C5282] text-white rounded-lg hover:bg-[#4299E1] transition-colors duration-200"
                                >
                                    Створити
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальне вікно для редагування бюджету */}
                {showEditBudgetModal && selectedBudget && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Редагувати бюджет</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="editBudgetName" className="block text-sm font-medium text-gray-700 mb-1">Назва</label>
                                    <input
                                        id="editBudgetName"
                                        type="text"
                                        value={editBudget.name}
                                        onChange={e => setEditBudget({ ...editBudget, name: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editBudgetSpent" className="block text-sm font-medium text-gray-700 mb-1">Витрачено</label>
                                    <input
                                        id="editBudgetSpent"
                                        type="number"
                                        value={editBudget.spent}
                                        onChange={e => setEditBudget({ ...editBudget, spent: parseFloat(e.target.value) || 0 })}
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editBudgetCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        id="editBudgetCategory"
                                        type="text"
                                        value={editBudget.category}
                                        onChange={e => setEditBudget({ ...editBudget, category: e.target.value })}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4299E1]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => { setShowEditBudgetModal(false); setSelectedBudget(null); }}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleEditBudget}
                                    className="px-6 py-2 bg-[#2C5282] text-white rounded-lg hover:bg-[#4299E1] transition-colors duration-200"
                                >
                                    Зберегти
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Модальне вікно підтвердження видалення */}
                {showDeleteBudgetConfirm && (
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
                                    onClick={cancelDeleteBudget}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={confirmDeleteBudget}
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

export default Dashboard;
