import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, WalletIcon, CreditCardIcon, BanknotesIcon } from '@heroicons/react/24/outline';

// Дані-заглушки для рахунків
const dummyAccounts = [
  {
    id: 'acc1',
    name: 'Основний Чековий Рахунок',
    type: 'Checking',
    balance: 15230.50,
    currency: 'UAH',
    icon: <WalletIcon className="h-6 w-6 text-blue-500" />,
  },
  {
    id: 'acc2',
    name: 'Ощадний Рахунок',
    type: 'Savings',
    balance: 87500.00,
    currency: 'UAH',
    icon: <BanknotesIcon className="h-6 w-6 text-green-500" />,
  },
  {
    id: 'acc3',
    name: 'Кредитна Картка',
    type: 'Credit Card',
    balance: -1250.75, // Негативний баланс для кредитки
    currency: 'UAH',
    icon: <CreditCardIcon className="h-6 w-6 text-red-500" />,
  },
  {
    id: 'acc4',
    name: 'Інвестиційний Портфель',
    type: 'Investment',
    balance: 55000.00,
    currency: 'USD',
    icon: <BanknotesIcon className="h-6 w-6 text-purple-500" />, // Можна використовувати BanknotesIcon для інвестицій
  },
];

// ВИПРАВЛЕНО: Використання export default function для уникнення подвійного оголошення
export default function Accounts() {
  const [accounts, setAccounts] = useState(dummyAccounts);

  // Функція для додавання нового рахунку (заглушка)
  const handleAddAccount = () => {
    // ВАЖЛИВО: Не використовуйте alert() у виробничих додатках React.
    // Замість цього реалізуйте модальне вікно або інший елемент UI для сповіщень.
    console.log('Функціонал додавання рахунку ще не реалізовано.');
    alert('Функціонал додавання рахунку ще не реалізовано.');
    // Тут буде логіка для відкриття форми додавання рахунку
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-[#F7FAFC] font-['DM Sans'] min-h-screen">
      <div className="max-w-[1184px] mx-auto w-full"> {/* Обмежуємо ширину контенту */}
        {/* Заголовок сторінки */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
          <span>Мої Рахунки</span>
          <button
            onClick={handleAddAccount}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Додати Рахунок
          </button>
        </h1>

        {/* Список рахунків */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 transition-transform duration-200 hover:scale-[1.02]">
              <div className="p-3 rounded-full bg-gray-100">
                {account.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">{account.type}</p>
              </div>
              <div className={`text-right ${account.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                <p className="text-xl font-bold">{account.balance.toLocaleString('uk-UA', { style: 'currency', currency: account.currency })}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Повідомлення, якщо рахунків немає */}
        {accounts.length === 0 && (
          <div className="mt-10 text-center text-gray-500">
            <p>У вас ще немає доданих рахунків.</p>
            <button onClick={handleAddAccount} className="mt-4 text-blue-600 hover:underline">
              Натисніть тут, щоб додати перший рахунок!
            </button>
          </div>
        )}

        {/* Заповнювач для майбутніх елементів або аналітичних даних */}
        {/* <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Аналітика рахунків</h2>
          <p className="text-gray-600">Тут будуть відображатися графіки та зведення по вашим рахункам.</p>
        </div> */}
      </div>
    </div>
  );
}
