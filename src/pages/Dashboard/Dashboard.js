import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend } from 'chart.js';
// ДОДАНО: Імпорт FillerPlugin
import { Filler as FillerPlugin } from 'chart.js';
import { Link } from 'react-router-dom'; // ДОДАНО: Імпорт Link для навігації
import {
  HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
  ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
  BanknotesIcon, CreditCardIcon, WalletIcon, // CreditCardIcon вже імпортована
  ChartBarIcon, ListBulletIcon, Squares2X2Icon
} from '@heroicons/react/24/outline'; // Імпорт іконок

// Реєстрація компонентів Chart.js та ДОДАНО FillerPlugin
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend, FillerPlugin);

// URL для логотипу (тепер посилається на файл у папці public)
const logoUrl = "/image.png";

// Дані-заглушки (будуть замінені фактичними викликами API)
const dummyChartData = {
  labels: ['1.5', '2.5', '3.5', '4.5'], // Приклад міток для лінійного графіка
  datasets: [
    {
      label: 'Транзакції',
      data: [300, 200, 450, 250], // Приклад даних для лінійного графіка
      borderColor: 'rgba(128, 90, 213, 1)', // Фіолетовий колір для лінії
      backgroundColor: 'rgba(128, 90, 213, 0.2)',
      fill: true, // Залишити fill: true
      tension: 0.5,
      pointRadius: 0, // Прибрати точки на лінії
    },
    {
        label: 'Бюджет', // Друга лінія
        data: [250, 180, 400, 200], // Приклад даних для другої лінії
        borderColor: 'rgba(128, 90, 213, 0.5)', // Світліший фіолетовий
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.5,
        pointRadius: 0,
    }
  ],
};

const dummyBarChartData = {
  labels: ['27.4', '28.4', '29.4', '30.4', '1.5', '2.5', '3.5', '4.5'],
  datasets: [
    {
      label: 'Кількість транзакцій',
      data: [100, 150, 200, 120, 180, 220, 190, 140],
      backgroundColor: 'rgba(99, 102, 241, 0.6)', // Синій колір для стовпців
      borderRadius: 5, // Заокруглені кути стовпців
      barThickness: 10, // Товщина стовпців
    },
  ],
};

const dummyPieChartData = {
  labels: ['sZlw - 1', 'DASO - 1', 'Dog - 2', 'test test 123 456 - 2', 'Category 1 - 3', 'Categoryyyyyy - 9'],
  datasets: [
    {
      data: [30, 20, 15, 10, 10, 15],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9900'],
      hoverOffset: 4,
    },
  ],
};

// Дані календаря (статичне представлення для дизайну)
const monthsData = [
    { name: 'Квітень 2023', days: Array.from({ length: 30 }, (_, i) => i + 1), offset: 6, highlighted: [27,28,29,30]}, // Починається з Суботи
    { name: 'Травень 2023', days: Array.from({ length: 31 }, (_, i) => i + 1), offset: 1, highlighted: []} // Починається з Понеділка
];

function Dashboard() {
  // Стани для динамічних даних (наразі використовуються дані-заглушки)
  const [currentAccount, setCurrentAccount] = useState('Account 1'); // Для вибору рахунку
  const [currentBudget, setCurrentBudget] = useState('Budget 1'); // Для вибору бюджету

  // useEffect використовується для ініціалізації даних графіків (незважаючи на попередження ESLint)
  useEffect(() => {
    // Тут може бути логіка для завантаження даних з API
    // Наразі використовуємо dummyChartData, dummyBarChartData, dummyPieChartData
  }, []);

  // Опції графіків для візуальної відповідності
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Приховати легенду для мінімалізму
      },
      tooltip: {
        enabled: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false, // Приховати сітку по осі X
        },
        ticks: {
          display: true, // Показати мітки осі X
          font: {
            size: 10 // Менший розмір шрифту для міток осі X
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true, // Показати сітку по осі Y
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          stepSize: 100, // Крок міток на осі Y
          font: {
            size: 10 // Менший розмір шрифту для міток осі Y
          }
        }
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Приховати легенду
      },
      tooltip: {
        enabled: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10 // Менший розмір шрифту для міток осі X
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
            display: false, // Приховати сітку по осі Y
        },
        ticks: {
            display: false, // Приховати мітки по осі Y
        }
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Розташувати легенду праворуч
        labels: {
          boxWidth: 10, // Розмір кольорових квадратів
          font: {
            size: 10 // Розмір шрифту легенди
          }
        }
      },
      tooltip: {
        enabled: true,
      }
    },
  };


  return (
    // Головний контейнер з повною висотою екрану, фоном F7FAFC та шрифтом DM Sans
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
            {/* Оновлено: використання Link замість a */}
            <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
              <HomeIcon className="h-5 w-5 mr-3" /> Home
            </Link>
            <Link to="/budgets" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
              <BanknotesIcon className="h-5 w-5 mr-3" /> Budgets
            </Link>
            <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
              <ListBulletIcon className="h-5 w-5 mr-3" /> Goals
            </Link>
            {/* Додано перехід на сторінку Accounts */}
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

        {/* Заповнювач для майбутніх елементів знизу, якщо такі будуть */}
        {/* <div className="mt-auto">...</div> */}
      </aside>

      {/* Основна область контенту */}
      {/* Максимальна ширина встановлена для дизайну 1440px, враховуючи ширину бічної панелі (1440 - 256 = 1184px) */}
      <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
        {/* Верхній бар */}
        <header className="bg-white p-4 rounded-xl shadow-md flex justify-end items-center mb-6">
          <div className="flex items-center space-x-6">
            {/* Вибір бюджету */}
            <div className="relative">
              <select
                className="appearance-none bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={currentBudget}
                onChange={(e) => setCurrentBudget(e.target.value)}
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
                <p className="font-semibold text-gray-800">Test123</p>
                <p className="text-gray-500">test@npm.ua</p>
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
              <option value="Account 1">Account 1</option>
              <option value="Account 2">Account 2</option>
              <option value="Account 3">Account 3</option>
            </select>
            <ChevronDownIcon className="absolute right-0 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
          </span>
        </h1>


        {/* Сітка вмісту дашборду */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Секція календаря та лінійного графіка */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
            {/* Заголовок календаря */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">04/27/2023 - 05/04/2023</h2>
                <div className="flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-gray-400" />
                    {/* Заповнювач для точок меню */}
                    <span className="text-xl font-bold text-gray-400 ml-2">...</span>
                </div>
            </div>

            {/* Календарі */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monthsData.map((month, monthIdx) => (
                    <div key={monthIdx} className="calendar-month p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center text-sm font-medium mb-3">
                            <ChevronLeftIcon className="h-4 w-4 text-gray-500 cursor-pointer" />
                            <span>{month.name}</span>
                            <ChevronRightIcon className="h-4 w-4 text-gray-500 cursor-pointer" />
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => <span key={day}>{day}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm">
                            {Array.from({ length: month.offset }).map((_, i) => ( // Порожні клітинки для зміщення
                                <span key={`empty-${monthIdx}-${i}`} className="p-1"></span>
                            ))}
                            {month.days.map(day => (
                                <span
                                    key={`day-${monthIdx}-${day}`}
                                    className={`p-1 rounded-full ${
                                        month.highlighted.includes(day)
                                            ? 'bg-purple-200 text-purple-800 font-bold' // Виділені дати
                                            : 'text-gray-800'
                                    }`}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Графік огляду балансу */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col justify-between">
            <div className="flex justify-end items-center w-full mb-4">
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
                {/* Заповнювач для точок меню */}
                <span className="text-xl font-bold text-gray-400 ml-2">...</span>
            </div>
            <div className="relative h-48 w-full">
              <Line data={dummyChartData} options={lineChartOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-5xl font-extrabold text-blue-600 mb-1">$37.5K</p>
              <p className="text-sm text-gray-600">Total spent <span className="text-green-500 font-semibold">+2.58%</span></p>
              <p className="text-xs text-green-500">On track</p>
            </div>
          </div>

          {/* Гістограма кількості транзакцій */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Transactions quantity</h2>
              <ChartBarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="relative h-48 w-full">
              <Bar data={dummyBarChartData} options={barChartOptions} />
            </div>
          </div>

          {/* Кругова діаграма популярних категорій */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 col-span-1 lg:col-span-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Popular categories</h2>
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="relative h-56 w-56 md:w-1/2 flex items-center justify-center mb-4 md:mb-0">
                <Pie data={dummyPieChartData} options={pieChartOptions} />
              </div>
              {/* Список категорій під круговою діаграмою */}
              <ul className="text-gray-700 text-sm space-y-2 w-full md:w-1/2 pl-0 md:pl-4">
                {dummyPieChartData.labels.map((label, index) => (
                  <li key={label} className="flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: dummyPieChartData.datasets[0].backgroundColor[index] }}
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
