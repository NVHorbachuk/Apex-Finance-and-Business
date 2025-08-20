import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler as FillerPlugin } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
    BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, ChartBarIcon,
    ArrowUpIcon, ArrowDownIcon, UsersIcon, CurrencyDollarIcon
} from '@heroicons/react/24/outline';

// Import Firestore functions
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Register Chart.js components and FillerPlugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, FillerPlugin);

// URL for the logo (points to a file in the public folder)
const logoUrl = "/image.png";

// Function to get the month name in Ukrainian
const getMonthName = (monthIndex) => {
    const months = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    return months[monthIndex];
};

function Dashboard({ db, auth, userId, userData }) {
    // State for dynamic data fetched from Firestore
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]); // State for goals
    const [budgets, setBudgets] = useState([]); // State for budgets
    const [currentAccount, setCurrentAccount] = useState('');
    const [currentSelectedBudgetId, setCurrentSelectedBudgetId] = useState(''); // New state for selected budget
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Added a counter for loaded data sources for more reliable loading state management
    const [loadedSourcesCount, setLoadedSourcesCount] = useState(0);

    // State for chart data and summaries
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
    const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
    const [overallBalance, setOverallBalance] = useState(0);
    const [latestTransactions, setLatestTransactions] = useState([]);
    const [largestExpenses, setLargestExpenses] = useState([]);
    // New state for daily financial data summary
    const [dailyFinancialSummary, setDailyFinancialSummary] = useState({});

    // State for adding a new account form
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [addingAccount, setAddingAccount] = useState(false);

    // State for the calendar
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    // State for the days of both calendar months
    const [calendarDaysFirstMonth, setCalendarDaysFirstMonth] = useState([]);
    const [calendarDaysSecondMonth, setCalendarDaysSecondMonth] = useState([]);


    // Get app ID
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    const navigate = useNavigate();

    // Callback to process financial data and update charts/summaries
    const processFinancialData = useCallback((fetchedTransactions, fetchedAccounts) => {
        const parseDateStringForSort = (dateString) => {
            if (!dateString) return new Date(0);
            const parts = dateString.split('.');
            if (parts.length === 3) { // DD.MM.YYYY
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            return new Date(dateString); // YYYY-MM-DD
        };

        // Aggregate daily data for the calendar
        const dailySummary = {};
        fetchedTransactions.forEach(t => {
            const dateObj = new Date(t.date);
            if (isNaN(dateObj.getTime())) {
                console.warn(`Invalid transaction date: ${t.date}`);
                return;
            }
            const dateKey = dateObj.toISOString().substring(0, 10); // Use YYYY-MM-DD as key

            if (!dailySummary[dateKey]) {
                dailySummary[dateKey] = { income: 0, expense: 0, count: 0, categories: {} };
            }
            if (t.type === 'income') {
                dailySummary[dateKey].income += t.amount;
            } else { // expense
                dailySummary[dateKey].expense += Math.abs(t.amount); // Ensure expenses are added as positive numbers for display
            }
            dailySummary[dateKey].count += 1;
            const category = t.category || 'Без категорії';
            dailySummary[dateKey].categories[category] = (dailySummary[dateKey].categories[category] || 0) + Math.abs(t.amount);
        });
        setDailyFinancialSummary(dailySummary);


        // --- Reverted to Line Chart: Cumulative Balance (matching image) ---
        const dailyDataForLineChart = fetchedTransactions.reduce((acc, transaction) => {
            const transactionDate = new Date(transaction.date);
            if (isNaN(transactionDate.getTime())) return acc;
            const dateKey = transactionDate.toLocaleDateString('uk-UA'); // Use local date format
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
                    borderColor: '#4A5568', // Dark grey for a more business-like look
                    backgroundColor: 'rgba(74, 85, 104, 0.2)', // Semi-transparent dark grey
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
            ],
        });
        // --- End of reverted Line Chart update ---


        // Bar Chart: Number of transactions per day (remains unchanged)
        const dailyTxnCount = fetchedTransactions.reduce((acc, transaction) => {
            const transactionDate = new Date(transaction.date);
            if (isNaN(transactionDate.getTime())) return acc;
            const dateKey = transactionDate.toLocaleDateString('uk-UA');
            if (!acc[dateKey]) {
                acc[dateKey] = 0;
            }
            acc[dateKey] += 1;
            return acc;
        }, {});

        const barLabels = Object.keys(dailyTxnCount).sort((a, b) => parseDateStringForSort(a) - parseDateStringForSort(b));
        const barValues = barLabels.map(label => dailyTxnCount[label]);

        // This barChartData is for a separate "Number of Transactions" chart, not the Income/Expense one.
        // It's currently not used in the JSX, but the data processing remains in case it's needed later.
        // Removed setBarChartData as it's not directly used in the current Dashboard JSX for this component
        // setBarChartData({
        //     labels: barLabels,
        //     datasets: [
        //         {
        //             label: 'Кількість транзакцій',
        //             data: barValues,
        //             backgroundColor: '#3182CE',
        //             borderRadius: 5,
        //             barThickness: 10,
        //         },
        //     ],
        // });

        // Pie Chart: Expenses by category
        const categorySpending = fetchedTransactions.filter(t => t.type === 'expense').reduce((acc, transaction) => {
            const category = transaction.category || 'Без категорії';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += Math.abs(transaction.amount); // Expenses are always positive for the pie chart
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
                        '#2C5282', // Darker Blue
                        '#4299E1', // Primary Blue
                        '#38B2AC', // Teal
                        '#48BB78', // Medium Green
                        '#ECC94B', // Yellow/Gold
                        '#ED8936', // Orange
                        '#E53E3E', // Red
                        '#805AD5', // Purple
                        '#667EEA', // Indigo
                        '#A0AEC0', // Light Gray-Blue
                        '#A78BFA', // Light Purple
                        '#F6AD55', // Peach
                        '#2D3748', // Dark Gray
                        '#C05621', // Dark Orange
                        '#319795', // Dark Teal
                        '#2C7A7B', // Very Dark Teal
                        '#B794F4', // Lighter Purple
                        '#CBD5E0', // Lightest Gray
                        '#9F7AEA', // Medium Purple
                        '#D53F8C', // Pink-Purple
                        '#00A3C4'  // Cyan
                    ],
                    hoverOffset: 4,
                },
            ],
        });

        // New calculations for the dashboard:
        // Overall balance across accounts
        const totalOverallBalance = fetchedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        setOverallBalance(totalOverallBalance);

        // Latest 5 transactions
        const sortedTransactions = [...fetchedTransactions].sort((a, b) => {
            const dateA = parseDateStringForSort(a.date);
            const dateB = parseDateStringForSort(b.date);
            return dateB - dateA; // Sort by date descending
        });
        setLatestTransactions(sortedTransactions.slice(0, 5));

        // Largest 5 expenses
        const expenses = fetchedTransactions.filter(t => t.type === 'expense');
        const sortedExpenses = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        setLargestExpenses(sortedExpenses.slice(0, 5));

    }, []);

    // Effect to fetch initial data
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true); // Always set loading to true when this effect starts
        setLoadedSourcesCount(0); // Reset the loaded sources counter

        const unsubscribes = [];

        const incrementLoadedCount = () => {
            setLoadedSourcesCount(prev => prev + 1);
        };

        // 1. Fetch Accounts
        const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
        unsubscribes.push(onSnapshot(accountsCollectionRef, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0 && !currentAccount) {
                setCurrentAccount(fetchedAccounts[0].id);
            }
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Error fetching accounts:", err);
            setError(err);
            incrementLoadedCount(); // Increment counter even on error to dismiss loading screen
        }));

        // 2. Fetch Transactions
        let transactionsQueryRef = collection(db, `/artifacts/${appId}/users/${userId}/transactions`);
        if (currentAccount) {
            transactionsQueryRef = query(transactionsQueryRef, where('accountId', '==', currentAccount));
        }
        unsubscribes.push(onSnapshot(transactionsQueryRef, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(fetchedTransactions);
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Error fetching transactions:", err);
            setError(err);
            incrementLoadedCount(); // Increment counter even on error
        }));

        // 3. Fetch Goals
        const goalsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/goals`);
        unsubscribes.push(onSnapshot(goalsCollectionRef, (snapshot) => {
            const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGoals(fetchedGoals);
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Error fetching goals:", err);
            setError(err);
            incrementLoadedCount();
        }));

        // 4. Fetch Budgets
        const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
        unsubscribes.push(onSnapshot(budgetsCollectionRef, (snapshot) => {
            const fetchedBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setBudgets(fetchedBudgets);
            if (fetchedBudgets.length > 0 && !currentSelectedBudgetId) {
                setCurrentSelectedBudgetId(fetchedBudgets[0].id);
            }
            incrementLoadedCount();
        }, (err) => {
            console.error("Dashboard: Error fetching budgets:", err);
            setError(err);
            incrementLoadedCount();
        }));

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [db, userId, appId, currentAccount, currentSelectedBudgetId]);

    // Effect to dismiss the loading screen after all data sources are loaded
    useEffect(() => {
        const totalExpectedSources = 4; // Accounts, Transactions, Goals, Budgets
        if (loadedSourcesCount >= totalExpectedSources) {
            setLoading(false);
        }
    }, [loadedSourcesCount]);

    // Effect to process data once loaded or changed
    // This effect will only run when `loading` becomes `false`
    useEffect(() => {
        if (!loading) {
            // Check if there's any data or if all sources are empty
            const hasData = accounts.length > 0 || transactions.length > 0 || goals.length > 0 || budgets.length > 0;
            if (hasData || loadedSourcesCount === 4) { // Process data if it exists, or if all sources are loaded (even if empty)
                processFinancialData(transactions, accounts);
            } else if (!hasData && loadedSourcesCount < 4) {
                 // Not all sources loaded yet, or no data yet, but not final state.
                 // Do nothing, wait for full load.
            }
        }
    }, [transactions, accounts, goals, budgets, loading, processFinancialData, loadedSourcesCount]);


    // Function to add a new account
    const handleAddAccount = async (e) => {
        e.preventDefault();
        if (!db || !userId || !newAccountName.trim() || isNaN(parseFloat(newAccountBalance))) {
            console.error("Error: Required account data is missing or invalid.");
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
            console.log("Account successfully added!");
        } catch (err) {
            console.error("Error adding account:", err);
            setError(err);
        } finally {
            setAddingAccount(false);
        }
    };

    // Function to generate calendar days
    const generateDaysArray = useCallback((month, year) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const numDays = lastDayOfMonth.getDate();
        const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Make Monday the first day (0-6)

        const days = [];
        // Add empty cells for offset
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        // Add days of the month
        for (let i = 1; i <= numDays; i++) {
            days.push(i);
        }
        return days;
    }, []);

    // Effect to update the calendar when month/year changes
    useEffect(() => {
        setCalendarDaysFirstMonth(generateDaysArray(currentMonth, currentYear));
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        setCalendarDaysSecondMonth(generateDaysArray(nextMonth, nextYear));
    }, [currentMonth, currentYear, generateDaysArray]);

    // Handlers for month navigation
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

    const today = new Date();
    // Function to determine if a day is today
    const isTodayFn = useCallback((day, month, year) => {
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    }, [today]);


    // Function to log out
    const handleLogout = async () => {
        if (!auth) {
            console.error("Firebase Auth is not available.");
            return;
        }
        try {
            await signOut(auth);
            console.log("User successfully logged out.");
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            setError(new Error(`Logout error: ${error.message}`));
        }
    };

    // Chart options for visual consistency
    const lineChartOptions = { // These options are now for the cumulative balance line chart
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, // No legend for single line
            tooltip: { enabled: true }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    display: true,
                    font: { size: 9 }
                }
            },
            y: {
                beginAtZero: true,
                grid: { display: true, color: 'rgba(200, 200, 200, 0.2)' },
                ticks: {
                    font: { size: 9 }
                }
            },
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

    // Determine the display name (copied from Dashboard.js for consistency)
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження даних...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans']">
            {/* Sidebar */}
            <aside className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-r-3xl border-r border-gray-100">
                <div>
                    <div className="flex items-center mb-10 px-2">
                        <img src={logoUrl} alt="APEX FINANCE Logo" className="w-10 h-10 mr-3 object-contain rounded-full shadow-sm" />
                        <span className="text-2xl font-extrabold text-gray-900">APEX FINANCE</span>
                    </div>
                    <nav className="space-y-3">
                        <Link to="/dashboard" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                            <HomeIcon className="h-5 w-5 mr-3" /> Dashboard
                        </Link>
                        <Link to="/budgets" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Budgets
                        </Link>
                        <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Goals
                        </Link>
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Accounts
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Transactions
                        </Link>
                        <Link to="/categories" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-3" /> Categories
                        </Link>
                        <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                        {/* Налаштування профілю було видалено, оскільки його немає на знімку екрана */}
                        {/* <Link to="/profile-settings" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link> */}
                    </nav>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col p-8 max-w-[1400px] mx-auto">
                {/* Top bar */}
                <header className="bg-white p-5 rounded-2xl shadow-lg flex justify-between items-center mb-8 border border-gray-100">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Огляд фінансів для
                        <span className="relative inline-block ml-3">
                            <select
                                className="appearance-none bg-gray-100 text-blue-700 font-bold py-2.5 px-5 rounded-xl pr-10 cursor-pointer text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 hover:bg-gray-200"
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
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
                        </span>
                    </h1>
                    <div className="flex items-center space-x-6">
                        {/* Вибір бюджету */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-100 text-gray-800 font-semibold py-2.5 px-5 rounded-xl pr-10 cursor-pointer text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 hover:bg-gray-200"
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
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
                        </div>
                        <BellIcon className="h-7 w-7 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors duration-200" />
                        <div className="flex items-center space-x-3">
                            <UserCircleIcon className="h-10 w-10 text-blue-500 rounded-full bg-blue-100 p-1" />
                            <div className="text-base">
                                <p className="font-semibold text-gray-800">{displayName}</p>
                                {/* <p className="text-gray-500 text-sm">{userId}</p> */} {/* User ID is often not shown directly */}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2.5 px-5 rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md text-base"
                            >
                                Вийти
                            </button>
                        </div>
                    </div>
                </header>

                {/* --- Top block: Overall Balance and Account Balances --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Overall Balance */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 col-span-1 md:col-span-1 flex flex-col justify-between transform transition-transform duration-300 hover:scale-[1.02]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Загальний баланс</h2>
                        <p className="text-5xl font-extrabold text-blue-800">${overallBalance.toFixed(2)}</p>
                    </div>

                    {/* Account Balances */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 col-span-1 md:col-span-2 transform transition-transform duration-300 hover:scale-[1.02]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Баланс по рахунках</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.length === 0 ? (
                                <p className="text-gray-500 col-span-full text-base">Немає доданих рахунків. Додайте свій перший рахунок!</p>
                            ) : (
                                accounts.map(account => (
                                    <div key={account.id} className="flex items-center bg-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100">
                                        <CreditCardIcon className="h-7 w-7 text-blue-600 mr-4" />
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">{account.name}</p>
                                            <p className="text-md text-gray-600">${account.balance.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Form for adding a new account */}
                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 mb-8 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-5">Додати новий рахунок</h2>
                    <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                        <input
                            type="text"
                            placeholder="Назва рахунку (напр. 'Готівка')"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Початковий баланс (напр. 1000.00)"
                            value={newAccountBalance}
                            onChange={(e) => setNewAccountBalance(e.target.value)}
                            step="0.01"
                            className="p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-bold py-3.5 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-base"
                            disabled={addingAccount}
                        >
                            {addingAccount ? 'Додаємо...' : 'Додати рахунок'}
                        </button>
                    </form>
                </div>

                {/* --- New Section: Simple steps to financial freedom --- */}
                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 mb-8 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Прості кроки до фінансової свободи</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center p-4">
                            <span className="text-blue-600 font-bold text-4xl mb-3">1</span>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Підтверджуйте ваш грошовий потік</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Перегляньте свої банківські рахунки і кредитівки, а також будь-який інвестиційний дохід. Дізнайтеся, куди йдуть ваші гроші.
                            </p>
                            <Link to="/accounts" className="bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors duration-200 shadow-sm">
                                Рахунки та Баланси
                            </Link>
                        </div>
                        <div className="flex flex-col items-center p-4">
                            <span className="text-blue-600 font-bold text-4xl mb-3">2</span>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Зрозумійте ваш фінансовий стан</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Використовуйте свої транзакції та категорії для створення візуалізацій та отримання уявлення про ваші доходи та витрати.
                            </p>
                            <Link to="/transactions" className="bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors duration-200 shadow-sm">
                                Графік Витрат
                            </Link>
                        </div>
                        <div className="flex flex-col items-center p-4">
                            <span className="text-blue-600 font-bold text-4xl mb-3">3</span>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Зробіть свої витрати безстресовими</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Встановіть бюджети, щоб контролювати свої витрати, і цілі, щоб залишатися мотивованими на шляху до своїх фінансових мрій.
                            </p>
                            <Link to="/budgets" className="bg-blue-100 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-200 transition-colors duration-200 shadow-sm">
                                Бюджети та Цілі
                            </Link>
                        </div>
                    </div>
                </div>

                {/* --- Middle: Calendar, Income/Expense Chart, Budgets, Goals --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Calendar section with financial data */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col transform transition-transform duration-300 hover:scale-[1.005]">
                        {/* Calendar header and navigation */}
                        <div className="flex justify-between items-center mb-5">
                            <div className="flex items-center text-lg font-semibold text-gray-800">
                                <ChevronLeftIcon className="h-6 w-6 text-gray-600 cursor-pointer mr-3" onClick={goToPreviousMonth} />
                                <span>{getMonthName(currentMonth)} {currentYear}</span>
                                <ChevronRightIcon className="h-6 w-6 text-gray-600 cursor-pointer ml-3" onClick={goToNextMonth} />
                            </div>
                        </div>

                        {/* Calendars (two side-by-side) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* First month */}
                            <div className="calendar-month p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-3">
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
                                                className={`p-1.5 rounded-full flex flex-col items-center justify-start text-center relative transition-colors duration-200
                                                    ${day === null ? 'opacity-0 cursor-default' : 'text-gray-800'}
                                                    ${isToday ? 'bg-blue-600 text-white font-bold shadow-md' : (day !== null ? 'hover:bg-blue-100 cursor-pointer' : '')}
                                                `}
                                                style={{ minHeight: '65px' }}
                                            >
                                                <span className="text-sm font-medium">{day}</span>
                                                {daySummary && (daySummary.expense > 0 || daySummary.income > 0) && (
                                                    <div className="text-[0.65rem] mt-1.5 font-medium">
                                                        {daySummary.expense > 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-red-600'} block`}>
                                                                -${daySummary.expense.toFixed(0)}
                                                            </span>
                                                        )}
                                                        {daySummary.income > 0 && daySummary.expense === 0 && ( // Show income if no expenses on this day
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-green-600'} block`}>
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

                            {/* Second month */}
                            <div className="calendar-month p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center text-base font-semibold mb-3">
                                    <span>{getMonthName(currentMonth === 11 ? 0 : currentMonth + 1)} {currentMonth === 11 ? currentYear + 1 : currentYear}</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-3">
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
                                                className={`p-1.5 rounded-full flex flex-col items-center justify-start text-center relative transition-colors duration-200
                                                    ${day === null ? 'opacity-0 cursor-default' : 'text-gray-800'}
                                                    ${isToday ? 'bg-blue-600 text-white font-bold shadow-md' : (day !== null ? 'hover:bg-blue-100 cursor-pointer' : '')}
                                                `}
                                                style={{ minHeight: '65px' }}
                                            >
                                                <span className="text-sm font-medium">{day}</span>
                                                {daySummary && (daySummary.expense > 0 || daySummary.income > 0) && (
                                                    <div className="text-[0.65rem] mt-1.5 font-medium">
                                                        {daySummary.expense > 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-red-600'} block`}>
                                                                -${daySummary.expense.toFixed(0)}
                                                            </span>
                                                        )}
                                                        {daySummary.income > 0 && daySummary.expense === 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-green-600'} block`}>
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
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between transform transition-transform duration-300 hover:scale-[1.005]">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-semibold text-gray-700">Тенденція чистого балансу (Доходи vs Витрати)</h2>
                            <ChartBarIcon className="h-7 w-7 text-gray-600" />
                        </div>
                        <div className="relative h-56 w-full">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* Ваші витрати - Mock-up з зображення */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col col-span-1 lg:col-span-2 transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Ваші витрати</h2>
                        <div className="flex items-center bg-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-blue-100">
                            <CurrencyDollarIcon className="h-7 w-7 text-blue-600 mr-4" />
                            <div>
                                <p className="font-bold text-gray-800 text-lg">Buying car</p>
                                <p className="text-md text-gray-600">Найдешевші ціни</p>
                            </div>
                            <span className="ml-auto font-semibold text-red-600 text-lg">
                                - $128300.00
                            </span>
                        </div>
                    </div>


                    {/* Бюджети (прогрес бари) */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Ваші бюджети</h2>
                        {budgets.length === 0 ? (
                            <p className="text-gray-500 text-base">Немає доданих бюджетів.</p>
                        ) : (
                            <div className="space-y-4">
                                {budgets.map(budget => {
                                    const progress = (budget.spent / budget.limit) * 100;
                                    const progressColor = progress > 100 ? 'bg-red-600' : 'bg-green-600';
                                    return (
                                        <div key={budget.id} className="group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-100">
                                            <div className="flex justify-between text-base text-gray-800 mb-1">
                                                <span className="font-medium">{budget.name}</span>
                                                <span className="font-semibold">${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className={`${progressColor} h-2.5 rounded-full`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Цілі (накопичення) */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Ваші цілі</h2>
                        {goals.length === 0 ? (
                            <p className="text-gray-500 text-base">Немає доданих цілей.</p>
                        ) : (
                            <div className="space-y-4">
                                {goals.map(goal => {
                                    const progress = (goal.currentProgress / goal.targetAmount) * 100;
                                    const remaining = goal.targetAmount - goal.currentProgress;
                                    const isAchieved = goal.currentProgress >= goal.targetAmount;
                                    return (
                                        <div key={goal.id} className="group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-150 border border-transparent hover:border-blue-100">
                                            <div className="flex justify-between text-base text-gray-800 mb-1">
                                                <span className="font-medium">{goal.name}</span>
                                                <span className="font-semibold">
                                                    ${goal.currentProgress.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                                                    {isAchieved ? <span className="ml-2 text-green-600 font-semibold"> (Досягнуто!)</span> : ''}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
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

                    {/* Останні транзакції */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Останні транзакції</h2>
                        {latestTransactions.length === 0 ? (
                            <p className="text-gray-500 text-base">Немає останніх транзакцій.</p>
                        ) : (
                            <ul className="space-y-3">
                                {latestTransactions.map(t => (
                                    <li key={t.id} className="flex items-center justify-between text-base text-gray-800 border-b pb-3 last:border-b-0 last:pb-0 group hover:bg-blue-50 px-2 -mx-2 rounded-lg transition-colors duration-150">
                                        <div className="flex items-center">
                                            {t.type === 'income' ? (
                                                <ArrowUpIcon className="h-5 w-5 text-green-600 mr-3" />
                                            ) : (
                                                <ArrowDownIcon className="h-5 w-5 text-red-600 mr-3" />
                                            )}
                                            <div>
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('uk-UA')}</p>
                                            </div>
                                        </div>
                                        <span className={`font-semibold text-base ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {t.type === 'income' ? '+' : '-'}{Math.abs(t.amount).toFixed(2)} ₴
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Найбільші витрати */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Найбільші витрати</h2>
                        {largestExpenses.length === 0 ? (
                            <p className="text-gray-500 text-base">Немає найбільших витрат.</p>
                        ) : (
                            <ul className="space-y-3">
                                {largestExpenses.map(t => (
                                    <li key={t.id} className="flex items-center justify-between text-base text-gray-800 border-b pb-3 last:border-b-0 last:pb-0 group hover:bg-blue-50 px-2 -mx-2 rounded-lg transition-colors duration-150">
                                        <div className="flex items-center">
                                            <ArrowDownIcon className="h-5 w-5 text-red-600 mr-3" />
                                            <div>
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-sm text-gray-500">{new Date(t.date).toLocaleDateString('uk-UA')} ({t.category})</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-base text-red-600">
                                            -{Math.abs(t.amount).toFixed(2)} ₴
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Популярні категорії (використовує Pie Chart) */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 col-span-1 lg:col-span-2 transform transition-transform duration-300 hover:scale-[1.005]">
                        <h2 className="text-xl font-semibold text-gray-700 mb-5">Витрати за категоріями</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="relative h-60 w-60 md:w-1/2 flex items-center justify-center mb-6 md:mb-0">
                                <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                            <ul className="text-gray-700 text-base space-y-2 w-full md:w-1/2 pl-0 md:pl-6">
                                {pieChartData.labels.map((label, index) => (
                                    <li key={label} className="flex items-center">
                                        <span
                                            className="inline-block w-3.5 h-3.5 rounded-full mr-3"
                                            style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index] }}
                                        ></span>
                                        {label}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
