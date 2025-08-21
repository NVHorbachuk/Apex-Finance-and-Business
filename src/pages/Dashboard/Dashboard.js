import React, { useState, useEffect, useCallback } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, Filler as FillerPlugin } from 'chart.js';
import { Link, useNavigate } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
    BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon, ChartBarIcon,
    PencilIcon, TrashIcon, ExclamationTriangleIcon, PlusIcon, CurrencyDollarIcon,
    UserGroupIcon, BriefcaseIcon // Змінено FamilyIcon на UserGroupIcon
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// Реєстрація компонентів Chart.js та FillerPlugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, FillerPlugin);

// URL для логотипу (посилається на файл у папці public)
const logoUrl = "/image.png";

// ====================================================================================
// ВАЖЛИВО: ЗАМІНІТЬ ЦЕ НА ВАШ АКТУАЛЬНИЙ ADMIN USER ID з Firebase Authentication.
// Це userId облікового запису, який має доступ до адмін-панелі.
// ====================================================================================
const ADMIN_USER_ID = "CawE33GEkZhLFsapAdBr3saDV3F3";

// Функція для отримання назви місяця українською
const getMonthName = (monthIndex) => {
    const months = [
        'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    return months[monthIndex];
};

function Dashboard({ db, auth, userId, userData }) { // Додано userData
    // Стан для динамічних даних, отриманих з Firestore
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [goals, setGoals] = useState([]); // Стан для цілей
    const [budgets, setBudgets] = useState([]); // Стан для бюджетів
    const [currentAccount, setCurrentAccount] = useState('');
    const [currentSelectedBudgetId, setCurrentSelectedBudgetId] = useState(''); // New state for selected budget
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Додано лічильник завантажених джерел даних для більш надійного зняття loading
    const [loadedSourcesCount, setLoadedSourcesCount] = useState(0);

    // Стан для даних графіків та зведень
    const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
    const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] }); // Now used in JSX
    const [overallBalance, setOverallBalance] = useState(0); // Загальний баланс
    const [latestTransactions, setLatestTransactions] = useState([]); // Now used in JSX
    const [largestExpenses, setLargestExpenses] = useState([]); // Now used in JSX
    // Новий стан для зведення фінансових даних за днями
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
    const [newBudget, setNewBudget] = useState({ name: '', limit: 0, spent: 0, category: '' }); // Додано limit, spent, category
    const [editBudget, setEditBudget] = useState({ name: '', limit: 0, spent: 0, category: '' }); // Додано limit, spent, category

    // Стан для календаря
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    // Стан для днів обох місяців календаря
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

        // Агрегація даних за днями для календаря
        const dailySummary = {};
        fetchedTransactions.forEach(t => {
            const dateObj = new Date(t.date);
            if (isNaN(dateObj.getTime())) {
                console.warn(`Некоректна дата транзакції: ${t.date}`);
                return;
            }
            const dateKey = dateObj.toISOString().substring(0, 10); // Використовуємо YYYY-MM-DD як ключ

            if (!dailySummary[dateKey]) {
                dailySummary[dateKey] = { income: 0, expense: 0, count: 0, categories: {} };
            }
            if (t.type === 'income') {
                dailySummary[dateKey].income += t.amount;
            } else { // expense
                dailySummary[dateKey].expense += Math.abs(t.amount); // Переконайтеся, що витрати додаються як позитивні числа для відображення
            }
            dailySummary[dateKey].count += 1;
            const category = t.category || 'Без категорії';
            dailySummary[dateKey].categories[category] = (dailySummary[dateKey].categories[category] || 0) + Math.abs(t.amount);
        });
        setDailyFinancialSummary(dailySummary);


        const dailyDataForLineChart = fetchedTransactions.reduce((acc, transaction) => {
            const transactionDate = new Date(transaction.date);
            if (isNaN(transactionDate.getTime())) return acc;
            const dateKey = transactionDate.toLocaleDateString('uk-UA'); // Використовуємо локальний формат дати
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
                    borderColor: '#4A5568', // Темно-сірий для більш ділового вигляду
                    backgroundColor: 'rgba(74, 85, 104, 0.2)', // Напівпрозорий темно-сірий
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                },
            ],
        });

        // Pie Chart: Витрати за категоріями
        const categorySpending = fetchedTransactions.filter(t => t.type === 'expense').reduce((acc, transaction) => {
            const category = transaction.category || 'Без категорії';
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += Math.abs(transaction.amount); // Витрати завжди позитивні для пирога
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

        // Нові обчислення для дашборду:
        // Загальний баланс по рахунках
        const totalOverallBalance = fetchedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        setOverallBalance(totalOverallBalance);

        // Останні 5 транзакцій
        const sortedTransactions = [...fetchedTransactions].sort((a, b) => {
            const dateA = parseDateStringForSort(a.date);
            const dateB = parseDateStringForSort(b.date);
            return dateB - dateA; // Сортування за спаданням дати
        });
        setLatestTransactions(sortedTransactions.slice(0, 5));

        // Найбільші 5 витрат
        const expenses = fetchedTransactions.filter(t => t.type === 'expense');
        const sortedExpenses = [...expenses].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
        setLargestExpenses(sortedExpenses.slice(0, 5));

    }, []);

    // Ефект для отримання облікових записів, транзакцій, цілей та бюджетів
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true); // Завжди встановлюємо loading на true при початку цього ефекту
        setLoadedSourcesCount(0); // Скидаємо лічильник завантажених джерел

        const unsubscribes = [];

        const incrementLoadedCount = () => {
            setLoadedSourcesCount(prev => prev + 1);
        };

        // 1. Отримання облікових записів (Accounts)
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
            incrementLoadedCount(); // Збільшуємо лічильник навіть при помилці, щоб зняти екран завантаження
        }));

        // 2. Отримання транзакцій
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
            incrementLoadedCount(); // Збільшуємо лічильник навіть при помилці
        }));

        // 3. Отримання цілей (Goals)
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

        // 4. Отримання бюджетів (Budgets) - ВЖЕ ІСНУЄ, але тепер інтегрується з UI
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
    }, [db, userId, appId, currentAccount, currentSelectedBudgetId]); // currentAccount залишається тут, оскільки він впливає на запит транзакцій

    // Ефект для зняття екрану завантаження після завантаження всіх джерел даних
    useEffect(() => {
        const totalExpectedSources = 4; // Accounts, Transactions, Goals, Budgets
        if (loadedSourcesCount >= totalExpectedSources) {
            setLoading(false);
        }
    }, [loadedSourcesCount]);

    // Ефект для обробки даних після їх завантаження або зміни
    // Цей ефект запуститься лише тоді, коли `loading` стане `false`
    useEffect(() => {
        if (!loading) {
            // Перевіряємо, чи є хоч якісь дані або ж усі джерела порожні
            const hasData = accounts.length > 0 || transactions.length > 0 || goals.length > 0 || budgets.length > 0;
            if (hasData || loadedSourcesCount === 4) { // Обробляємо дані, якщо вони є, або якщо всі джерела завантажені (навіть якщо порожні)
                processFinancialData(transactions, accounts);
            } else if (!hasData && loadedSourcesCount < 4) {
                 // Ще не всі джерела завантажені або даних немає, але це не фінальний стан.
                 // Нічого не робити, чекати повного завантаження.
            }
        }
    }, [transactions, accounts, goals, budgets, loading, processFinancialData, loadedSourcesCount]);


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

    // --- Функції управління бюджетами (інтегровані) ---
    const handleCreateBudget = async () => {
        if (!db || !userId || !newBudget.name.trim() || isNaN(parseFloat(newBudget.limit))) {
            setError(new Error("Будь ласка, заповніть назву бюджету та ліміт."));
            return;
        }

        try {
            const budgetsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/budgets`);
            await addDoc(budgetsCollectionRef, {
                name: newBudget.name.trim(),
                limit: parseFloat(newBudget.limit),
                spent: 0, // Початкові витрати 0
                category: newBudget.category.trim(), // Додано категорію
                createdAt: new Date().toISOString(),
                userId: userId
            });
            setNewBudget({ name: '', limit: 0, spent: 0, category: '' });
            setShowCreateBudgetModal(false);
            setError(null); // Clear any previous errors
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
                category: editBudget.category.trim(), // Оновлення категорії
            });
            setSelectedBudget(null);
            setShowEditBudgetModal(false);
            setError(null); // Clear any previous errors
            console.log("Бюджет успішно оновлено!");
        } catch (err) {
            console.error("Помилка оновлення бюджету:", err);
            setError(new Error(`Помилка оновлення бюджету: ${err.message}`));
        }
    };

    const handleDeleteBudget = (budget) => {
        setSelectedBudget(budget); // Зберігаємо бюджет для підтвердження видалення
        setShowDeleteBudgetConfirm(true);
    };

    const confirmDeleteBudget = async () => {
        if (selectedBudget && db && userId) {
            try {
                await deleteDoc(doc(db, `/artifacts/${appId}/users/${userId}/budgets`, selectedBudget.id));
                setError(null); // Clear any previous errors
                console.log("Бюджет успішно видалено!");
            } catch (err) {
                console.error("Помилка видалення бюджету:", err);
                setError(new Error(`Помилка видалення бюджету: ${err.message}`));
            } finally {
                setShowDeleteBudgetConfirm(false);
                setSelectedBudget(null);
            }
        }
    };

    const cancelDeleteBudget = () => {
        setShowDeleteBudgetConfirm(false);
        setSelectedBudget(null);
    };
    // --- Кінець функцій управління бюджетами ---

    // Функція для генерування днів календаря
    const generateDaysArray = useCallback((month, year) => {
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
        return days;
    }, []);

    // Ефект для оновлення календаря при зміні місяця/року
    useEffect(() => {
        setCalendarDaysFirstMonth(generateDaysArray(currentMonth, currentYear));
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        setCalendarDaysSecondMonth(generateDaysArray(nextMonth, nextYear));
    }, [currentMonth, currentYear, generateDaysArray]);

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

    const todayDate = new Date(); // Змінено ім'я змінної, щоб уникнути конфлікту та попередження ESLint
    // Функція для визначення, чи є день поточним
    const isTodayFn = useCallback((day, month, year) => {
        return day === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();
    }, [todayDate]);


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

    // Опції графіків для візуальної відповідності
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

    const pieChartOptions = { // Тепер використовується в JSX
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

    // Визначення URL фото профілю, якщо воно є в userData
    // Примітка: profileImageUrl має бути прямою URL-адресою зображення (наприклад, з Google Photos, Imgur тощо),
    // а не URL-адресою сторінки, яка містить зображення.
    const profileImageUrl = userData?.profileImageUrl || 'https://placehold.co/40x40/aabbcc/ffffff?text=NP'; // Використовуйте заглушку, якщо немає зображення

    // Фіктивні дані для сімейних акаунтів та доходів
    const familyAccounts = userData?.familyAccounts || [
        { name: 'Дружина', balance: 1500.00 },
        { name: 'Дитина 1', balance: 250.00 },
    ];

    const incomeSources = userData?.incomeSources || [
        { name: 'Зарплата', amount: 3000.00, frequency: 'Щомісячно' },
        { name: 'Фріланс', amount: 500.00, frequency: 'Нерегулярно' },
    ];


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження даних...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans']">
            {/* Бічна панель */}
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
                        {/* Categories link removed as per request */}
                        {userId === ADMIN_USER_ID && ( // Conditional rendering for Admin Panel link
                            <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                                <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                            </Link>
                        )}
                        {/* Profile Settings link is now always visible */}
                        <Link to="/profile-settings" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
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
                            {profileImageUrl ? (
                                <img src={profileImageUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/aabbcc/ffffff?text=NP'; }} />
                            ) : (
                                <UserCircleIcon className="h-10 w-10 text-blue-500 rounded-full bg-blue-100 p-1" />
                            )}
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
                            className="w-full p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
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

                {/* New Section: Family Accounts and Income Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Family Accounts */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <UserGroupIcon className="h-6 w-6 text-gray-600 mr-2" /> Сімейні акаунти
                        </h2>
                        {familyAccounts.length === 0 ? (
                            <p className="text-gray-500 text-base">Немає доданих сімейних акаунтів.</p>
                        ) : (
                            <ul className="space-y-3">
                                {familyAccounts.map((famAcc, index) => (
                                    <li key={index} className="flex justify-between items-center text-gray-800 text-base border-b border-gray-100 pb-2">
                                        <span className="font-medium">{famAcc.name}</span>
                                        <span className="font-semibold text-blue-700">${famAcc.balance.toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Income Sources */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                            <BriefcaseIcon className="h-6 w-6 text-gray-600 mr-2" /> Джерела доходу
                        </h2>
                        {incomeSources.length === 0 ? (
                            <p className="text-gray-500 text-base">Немає доданих джерел доходу.</p>
                        ) : (
                            <ul className="space-y-3">
                                {incomeSources.map((income, index) => (
                                    <li key={index} className="flex justify-between items-center text-gray-800 text-base border-b border-gray-100 pb-2">
                                        <span className="font-medium">{income.name}</span>
                                        <span className="font-semibold text-green-700">${income.amount.toFixed(2)} ({income.frequency})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>


                {/* --- Middle: Financial Trends, Budgets, Goals --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Calendar section with financial data */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                        {/* Calendar header and navigation */}
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center text-2xl font-semibold text-gray-800">
                                <ChevronLeftIcon className="h-6 w-6 text-gray-600 cursor-pointer mr-3 hover:text-blue-600 transition-colors duration-200" onClick={goToPreviousMonth} />
                                <span>{getMonthName(currentMonth)} {currentYear}</span>
                                <ChevronRightIcon className="h-6 w-6 text-gray-600 cursor-pointer ml-3 hover:text-blue-600 transition-colors duration-200" onClick={goToNextMonth} />
                            </div>
                        </div>

                        {/* Calendars (two side-by-side) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* First month */}
                            <div className="calendar-month p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-2">
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
                                                    ${isToday ? 'bg-blue-600 text-white font-bold shadow-md' : (day !== null ? 'hover:bg-blue-100 cursor-pointer' : '')}
                                                `}
                                                style={{ minHeight: '65px' }}
                                            >
                                                {day}
                                                {daySummary && (daySummary.expense > 0 || daySummary.income > 0) && (
                                                    <div className="text-xs mt-1">
                                                        {daySummary.expense > 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-red-600'} font-semibold block`}>
                                                                -${daySummary.expense.toFixed(0)}
                                                            </span>
                                                        )}
                                                        {daySummary.income > 0 && daySummary.expense === 0 && ( // Only show income if no expense for that day
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-green-600'} font-semibold block`}>
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
                            <div className="calendar-month p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="flex justify-between items-center text-lg font-semibold mb-3">
                                    <span>{getMonthName(currentMonth === 11 ? 0 : currentMonth + 1)} {currentMonth === 11 ? currentYear + 1 : currentYear}</span>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600 mb-2">
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
                                                    ${isToday ? 'bg-blue-600 text-white font-bold shadow-md' : (day !== null ? 'hover:bg-blue-100 cursor-pointer' : '')}
                                                `}
                                                style={{ minHeight: '65px' }}
                                            >
                                                {day}
                                                {daySummary && (daySummary.expense > 0 || daySummary.income > 0) && (
                                                    <div className="text-xs mt-1">
                                                        {daySummary.expense > 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-red-600'} font-semibold block`}>
                                                                -${daySummary.expense.toFixed(0)}
                                                            </span>
                                                        )}
                                                        {daySummary.income > 0 && daySummary.expense === 0 && (
                                                            <span className={`${isToday ? 'text-blue-100' : 'text-green-600'} font-semibold block`}>
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

                    {/* Chart: Net Balance Trend */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Тенденція чистого балансу (Доходи vs Витрати)</h2>
                            <ChartBarIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="relative h-60 w-full">
                            <Line data={lineChartData} options={lineChartOptions} />
                        </div>
                    </div>

                    {/* NEW SECTION: Expenses by Category (Pie Chart) */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between col-span-1 lg:col-span-1">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Витрати за категоріями</h2>
                            <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div className="relative h-60 w-full flex items-center justify-center">
                            {pieChartData.labels.length > 0 ? (
                                <Pie data={pieChartData} options={pieChartOptions} />
                            ) : (
                                <p className="text-gray-500 text-base">Немає даних про витрати для відображення діаграми.</p>
                            )}
                        </div>
                    </div>

                    {/* NEW SECTION: Latest Transactions & Largest Expenses */}
                    <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between col-span-1 lg:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Останні транзакції та найбільші витрати</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Останні транзакції</h3>
                                {latestTransactions.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Немає останніх транзакцій.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {latestTransactions.map(t => (
                                            <li key={t.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-800">{t.description}</span>
                                                <span className={`${t.type === 'income' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                                                    {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Найбільші витрати</h3>
                                {largestExpenses.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Немає найбільших витрат.</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {largestExpenses.map(t => (
                                            <li key={t.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-800">{t.description}</span>
                                                <span className="text-red-600 font-semibold">-${Math.abs(t.amount).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Budgets (progress bars and management) */}
                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col mb-8 transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Ваші бюджети</h2>
                    <div className="flex justify-end mb-4"> {/* Added button here */}
                        <button
                            onClick={() => setShowCreateBudgetModal(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200 flex items-center"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" /> Додати новий бюджет
                        </button>
                    </div>
                    {budgets.length === 0 ? (
                        <p className="text-gray-500 text-base">Немає доданих бюджетів.</p>
                    ) : (
                        <div className="space-y-4">
                            {budgets.map(budget => {
                                const progress = (budget.spent / budget.limit) * 100;
                                const progressColor = progress > 100 ? 'bg-red-500' : 'bg-green-500';
                                return (
                                    <div key={budget.id} className="group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-150 flex items-center justify-between border border-blue-100">
                                        <div className="flex-1 mr-4">
                                            <div className="flex justify-between text-base text-gray-800 mb-1 font-semibold">
                                                <span>{budget.name} ({budget.category})</span>
                                                <span>${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div className={`${progressColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, progress)}%` }}></div>
                                            </div>
                                            {progress > 100 && (
                                                <p className="text-xs text-red-600 mt-1">Перевищено бюджет на ${Math.abs(budget.limit - budget.spent).toFixed(2)}!</p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedBudget(budget);
                                                    setEditBudget({ ...budget });
                                                    setShowEditBudgetModal(true);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-2 rounded-md hover:bg-indigo-50"
                                                title="Редагувати"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteBudget(budget)}
                                                className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-md hover:bg-red-50 ml-2"
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

                {/* Goals (savings goals) */}
                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col transform transition-transform duration-300 hover:scale-[1.005]">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Ваші цілі</h2>
                    {goals.length === 0 ? (
                        <p className="text-gray-500 text-base">Немає доданих цілей.</p>
                    ) : (
                        <div className="space-y-4">
                            {goals.map(goal => {
                                const progress = (goal.currentProgress / goal.targetAmount) * 100;
                                const remaining = goal.targetAmount - goal.currentProgress;
                                const isAchieved = goal.currentProgress >= goal.targetAmount;
                                return (
                                    <div key={goal.id} className="group hover:bg-blue-50 p-3 rounded-lg transition-colors duration-150 border border-blue-100">
                                        <div className="flex justify-between text-base text-gray-800 mb-1 font-semibold">
                                            <span>{goal.name}</span>
                                            <span>
                                                ${goal.currentProgress.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                                                {isAchieved ? <span className="ml-2 text-green-600 font-semibold"> (Досягнуто!)</span> : ''}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }}></div>
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
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
