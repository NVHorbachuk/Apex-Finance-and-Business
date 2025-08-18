import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler as FillerPlugin } from 'chart.js';
import { Link } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
    BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, ChartBarIcon
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';

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

function Dashboard({ db, auth, userId }) {
    // Стан для динамічних даних, отриманих з Firestore
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [currentAccount, setCurrentAccount] = useState(''); // Обраний рахунок
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Стан для даних графіків, які будуть генеруватися з транзакцій
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
    const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
    const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
    const [totalSpent, setTotalSpent] = useState(0);

    // Стан для форми додавання нового рахунку
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [addingAccount, setAddingAccount] = useState(false); // Стан для індикатора завантаження додавання

    // Стан для календаря
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [calendarDays, setCalendarDays] = useState([]);

    // Отримання ID додатку
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    // useCallback для функцій обробки даних, щоб уникнути зайвих ре-рендерів
    const processTransactionsForCharts = useCallback((txns) => {
        // Line Chart: Кумулятивний баланс або тренд витрат
        const dailyData = txns.reduce((acc, transaction) => {
            const date = new Date(transaction.date).toLocaleDateString('uk-UA'); // Використовуємо локальний формат дати
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += transaction.amount;
            return acc;
        }, {});

        const sortedDates = Object.keys(dailyData).sort((a, b) => {
            // Перетворення дати "ДД.ММ.РРРР" на формат "РРРР-ММ-ДД" для коректного порівняння
            const parseDate = (dateString) => {
                const parts = dateString.split('.');
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            };
            return parseDate(a) - parseDate(b);
        });
        let cumulativeBalance = 0;
        const lineLabels = [];
        const lineValues = [];
        sortedDates.forEach(date => {
            cumulativeBalance += dailyData[date];
            lineLabels.push(date);
            lineValues.push(cumulativeBalance);
        });

        setLineChartData({
            labels: lineLabels,
            datasets: [
                {
                    label: 'Кумулятивний баланс',
                    data: lineValues,
                    borderColor: 'rgba(128, 90, 213, 1)',
                    backgroundColor: 'rgba(128, 90, 213, 0.2)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
            ],
        });

        // Bar Chart: Кількість транзакцій за день
        const dailyTxnCount = txns.reduce((acc, transaction) => {
            const date = new Date(transaction.date).toLocaleDateString('uk-UA');
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += 1;
            return acc;
        }, {});

        const barLabels = Object.keys(dailyTxnCount).sort((a, b) => {
            const parseDate = (dateString) => {
                const parts = dateString.split('.');
                return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            };
            return parseDate(a) - parseDate(b);
        });
        const barValues = barLabels.map(label => dailyTxnCount[label]);

        setBarChartData({
            labels: barLabels,
            datasets: [
                {
                    label: 'Кількість транзакцій',
                    data: barValues,
                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                    borderRadius: 5,
                    barThickness: 10,
                },
            ],
        });

        // Pie Chart: Витрати за категоріями
        const categorySpending = txns.filter(t => t.type === 'expense').reduce((acc, transaction) => {
            const category = transaction.category || 'Без категорії';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += transaction.amount;
            return acc;
        }, {});

        const pieLabels = Object.keys(categorySpending);
        const pieValues = Object.values(categorySpending);

        setPieChartData({
            labels: pieLabels,
            datasets: [
                {
                    data: pieValues,
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900', '#A8DADC', '#F4D03F', '#6B5B95', '#88B04B'],
                    hoverOffset: 4,
                },
            ],
        });

        // Загальні витрати
        const total = txns.filter(t => t.type === 'expense').reduce((sum, txn) => sum + txn.amount, 0); // Обчислюємо лише витрати
        setTotalSpent(total);
    }, []);

    // Ефект для отримання облікових записів та транзакцій
    useEffect(() => {
        if (!db || !userId) {
            return;
        }

        setLoading(true);

        // 1. Отримання облікових записів (Accounts)
        const accountsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/accounts`);
        const unsubscribeAccounts = onSnapshot(accountsCollectionRef, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAccounts(fetchedAccounts);
            if (fetchedAccounts.length > 0 && !currentAccount) {
                setCurrentAccount(fetchedAccounts[0].id);
            }
        }, (err) => {
            console.error("Dashboard: Помилка отримання рахунків:", err);
            setError(err);
        });

        // 2. Отримання транзакцій
        let transactionsQuery = query(collection(db, `/artifacts/${appId}/users/${userId}/transactions`));

        if (currentAccount) {
            transactionsQuery = query(transactionsQuery, where('accountId', '==', currentAccount));
        }

        const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTransactions(fetchedTransactions);
            processTransactionsForCharts(fetchedTransactions);
            setLoading(false);
        }, (err) => {
            console.error("Dashboard: Помилка отримання транзакцій:", err);
            setError(err);
            setLoading(false);
        });

        return () => {
            unsubscribeAccounts();
            unsubscribeTransactions();
        };
    }, [db, userId, appId, currentAccount, processTransactionsForCharts]);

    // Функція для додавання нового рахунку
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
                createdAt: new Date().toISOString(), // Зберігаємо дату у форматі ISO 8601
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

    // Функція для генерування днів календаря
    const generateCalendarDays = useCallback((month, year) => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const numDays = lastDayOfMonth.getDate();
        const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Зробити понеділок першим днем (0-6)

        const days = [];
        // Додаємо порожні клітинки для зміщення
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }
        // Додаємо дні місяця
        for (let i = 1; i <= numDays; i++) {
            days.push(i);
        }
        setCalendarDays(days);
    }, []);

    // Ефект для оновлення календаря при зміні місяця/року
    useEffect(() => {
        generateCalendarDays(currentMonth, currentYear);
    }, [currentMonth, currentYear, generateCalendarDays]);

    // Обробники для навігації по місяцях
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
    const todayDay = today.getDate();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    // Опції графіків для візуальної відповідності
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { display: true, font: { size: 10 } }
            },
            y: {
                beginAtZero: true,
                grid: { display: true, color: 'rgba(200, 200, 200, 0.2)' },
                ticks: { stepSize: 100, font: { size: 10 } }
            },
        },
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 } }
            },
            y: {
                beginAtZero: true,
                grid: { display: false },
                ticks: { display: false },
            },
        },
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { boxWidth: 10, font: { size: 10 } }
            },
            tooltip: { enabled: true }
        },
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження даних...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-[#F7FAFC] font-['DM Sans']">
            {/* Бічна панель */}
            <aside className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-r-xl">
                <div>
                    {/* Логотип та назва додатку */}
                    <div className="flex items-center mb-10">
                        <img src={logoUrl} alt="Finance Manager Logo" className="w-8 h-8 mr-2 object-contain" />
                        <span className="text-xl font-bold text-gray-900">Finance Manager</span>
                    </div>

                    {/* Навігаційні посилання */}
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

            {/* Основна область контенту */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                {/* Верхній бар */}
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-end items-center mb-6">
                    <div className="flex items-center space-x-6">
                        {/* Вибір бюджету (залишився статичним, можна додати отримання з Firestore) */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                                // value={currentBudget} // Розкоментуйте, якщо будете реалізовувати
                                // onChange={(e) => setCurrentBudget(e.target.value)}
                            >
                                <option value="Budget 1">Budget 1</option>
                                <option value="Budget 2">Budget 2</option>
                            </select>
                            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600 pointer-events-none" />
                        </div>

                        {/* Іконка сповіщень */}
                        <BellIcon className="h-6 w-6 text-gray-500 cursor-pointer hover:text-blue-600" />

                        {/* Інформація про користувача */}
                        <div className="flex items-center space-x-2">
                            <UserCircleIcon className="h-8 w-8 text-blue-500" />
                            <div className="text-sm">
                                <p className="font-semibold text-gray-800">{auth.currentUser?.email || 'Користувач'}</p>
                                <p className="text-gray-500">{userId}</p> {/* Відображаємо userId */}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Головний заголовок дашборду */}
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Main Dashboard for
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

                {/* Форма для додавання нового рахунку */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Додати новий рахунок</h2>
                    <form onSubmit={handleAddAccount} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <input
                            type="text"
                            placeholder="Назва рахунку (напр. 'Готівка')"
                            value={newAccountName}
                            onChange={(e) => setNewAccountName(e.target.value)}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Початковий баланс (напр. 1000.00)"
                            value={newAccountBalance}
                            onChange={(e) => setNewAccountBalance(e.target.value)}
                            step="0.01"
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={addingAccount}
                        >
                            {addingAccount ? 'Додаємо...' : 'Додати рахунок'}
                        </button>
                    </form>
                </div>


                {/* Сітка вмісту дашборду */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Секція календаря та лінійного графіка */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        {/* Заголовок календаря */}
                        <div className="flex justify-between items-center mb-4">
                            {/* Навігація календарем */}
                            <div className="flex items-center text-lg font-semibold text-gray-800">
                                <ChevronLeftIcon className="h-5 w-5 text-gray-500 cursor-pointer mr-2" onClick={goToPreviousMonth} />
                                <span>{getMonthName(currentMonth)} {currentYear}</span>
                                <ChevronRightIcon className="h-5 w-5 text-gray-500 cursor-pointer ml-2" onClick={goToNextMonth} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <ChartBarIcon className="h-5 w-5 text-gray-400" />
                                <span className="text-xl font-bold text-gray-400 ml-2">...</span>
                            </div>
                        </div>

                        {/* Календар */}
                        <div className="calendar-month p-3 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => <span key={day}>{day}</span>)}
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                {calendarDays.map((day, index) => (
                                    <span
                                        key={`day-${index}`} // Використовуємо індекс, оскільки day може бути null
                                        className={`p-1 rounded-full ${
                                            day === null
                                                ? 'opacity-0 cursor-default' // Для порожніх клітинок
                                                : isCurrentMonth && day === todayDay
                                                    ? 'bg-blue-500 text-white font-bold' // Поточний день
                                                    : 'text-gray-800 hover:bg-gray-200 cursor-pointer' // Звичайні дні
                                        }`}
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Графік огляду балансу */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
                        <div className="flex justify-end items-center w-full mb-4">
                            <ChartBarIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-xl font-bold text-gray-400 ml-2">...</span>
                        </div>
                        <div className="relative h-48 w-full">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-5xl font-extrabold text-blue-600 mb-1">${totalSpent.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Загалом витрачено {/* Додайте динамічний розрахунок відсотка, якщо потрібно */} <span className="text-green-500 font-semibold">+X.XX%</span></p>
                            <p className="text-xs text-green-500">На шляху</p>
                        </div>
                    </div>

                    {/* Гістограма кількості транзакцій */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 lg:col-span-1">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Transactions quantity</h2>
                            <ChartBarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="relative h-48 w-full">
                            <Bar data={barChartData} options={barChartOptions} />
                        </div>
                    </div>

                    {/* Кругова діаграма популярних категорій */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 lg:col-span-1">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Popular categories</h2>
                        <div className="flex flex-col md:flex-row items-center justify-between">
                            <div className="relative h-56 w-56 md:w-1/2 flex items-center justify-center mb-4 md:mb-0">
                                <Pie data={pieChartData} options={pieChartOptions} />
                            </div>
                            {/* Список категорій під круговою діаграмою */}
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
            </div>
        </div>
    );
}

export default Dashboard;
