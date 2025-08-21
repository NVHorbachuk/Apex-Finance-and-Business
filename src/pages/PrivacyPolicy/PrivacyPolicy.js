import React from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon
} from '@heroicons/react/24/outline'; // Імпортуємо іконки

const logoUrl = "/image.png";

function PrivacyPolicy({ userId, userData }) {
    // Визначення імені для відображення
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';

    // Визначення URL фото профілю, якщо воно є в userData
    const profileImageUrl = userData?.profileImageUrl || 'https://placehold.co/40x40/aabbcc/ffffff?text=NP';

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
                        <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
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
                        {userId === "CawE33GEkZhLFsapAdBr3saDV3F3" && (
                            <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                                <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                            </Link>
                        )}
                        <Link to="/profile-settings" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                        <hr className="my-4 border-gray-200" />
                        {/* Додаткові статичні посилання */}
                        <Link to="/about-us" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Про нас
                        </Link>
                        <Link to="/careers" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Кар'єра
                        </Link>
                        <Link to="/contact-us" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Контакти
                        </Link>
                        <Link to="/blog" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Блог
                        </Link>
                        <Link to="/forum" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Форум
                        </Link>
                        <Link to="/privacy-policy" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                            Політика конфіденційності
                        </Link>
                        <Link to="/terms-of-use" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Умови використання
                        </Link>
                        <Link to="/cookie-policy" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Політика файлів cookie
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основний вміст сторінки */}
            <div className="flex-1 flex flex-col p-8 max-w-[1400px] mx-auto">
                {/* Хедер */}
                <header className="bg-white p-5 rounded-2xl shadow-lg flex justify-between items-center mb-8 border border-gray-100">
                    <h1 className="text-3xl font-extrabold text-gray-900">Політика конфіденційності</h1>
                    <div className="flex items-center space-x-6">
                        <BellIcon className="h-7 w-7 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors duration-200" />
                        <div className="flex items-center space-x-3">
                            {profileImageUrl ? (
                                <img src={profileImageUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/40x40/aabbcc/ffffff?text=NP'; }} />
                            ) : (
                                <UserCircleIcon className="h-10 w-10 text-blue-500 rounded-full bg-blue-100 p-1" />
                            )}
                            <div className="text-base">
                                <p className="font-semibold text-gray-800">{displayName}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col prose max-w-none">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Вступ</h2>
                    <p>
                        Ця Політика конфіденційності описує, як APEX FINANCE (далі "ми", "нас" або "наш")
                        збирає, використовує та розкриває вашу особисту інформацію, коли ви користуєтеся нашим
                        веб-сайтом та послугами (далі "Сервіс").
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Збір інформації</h2>
                    <p>Ми збираємо різні типи інформації для різних цілей, щоб надавати та покращувати наш Сервіс:</p>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Особисті дані</h3>
                    <p>
                        Під час використання нашого Сервісу ми можемо попросити вас надати нам певну
                        особисту інформацію, яка може бути використана для зв'язку або ідентифікації вас
                        ("Особисті дані"). Особисті дані можуть включати, але не обмежуються:
                    </p>
                    <ul className="list-disc list-inside">
                        <li>Ім'я та прізвище</li>
                        <li>Адреса електронної пошти</li>
                        <li>Номер телефону</li>
                        <li>Адреса</li>
                        <li>Дані про фінансові транзакції</li>
                        <li>Дані про рахунки та бюджети</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-gray-700 mb-2 mt-4">Дані використання</h3>
                    <p>
                        Ми також можемо збирати інформацію про те, як Сервіс доступний та використовується
                        ("Дані використання"). Ці Дані використання можуть включати таку інформацію, як
                        адреса Інтернет-протоколу вашого комп'ютера (наприклад, IP-адреса), тип браузера,
                        версія браузера, сторінки нашого Сервісу, які ви відвідуєте, час і дата вашого
                        відвідування, час, проведений на цих сторінках, унікальні ідентифікатори пристроїв
                        та інші діагностичні дані.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Використання інформації</h2>
                    <p>APEX FINANCE використовує зібрані дані для різних цілей:</p>
                    <ul className="list-disc list-inside">
                        <li>Надання та підтримка нашого Сервісу</li>
                        <li>Повідомлення вам про зміни в нашому Сервісі</li>
                        <li>Дозвіл вам брати участь в інтерактивних функціях нашого Сервісу, коли ви вирішите це зробити</li>
                        <li>Надання підтримки клієнтам</li>
                        <li>Моніторинг використання Сервісу</li>
                        <li>Виявлення, запобігання та вирішення технічних проблем</li>
                        <li>Аналіз та вдосконалення наших послуг</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Розкриття інформації</h2>
                    <p>
                        Ми можемо розкривати вашу особисту інформацію лише у випадках, коли це необхідно
                        для дотримання закону, захисту наших прав або забезпечення безпеки наших користувачів.
                        Ми не продаємо та не передаємо вашу особисту інформацію третім сторонам для їхніх
                        маркетингових цілей без вашої згоди.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Безпека даних</h2>
                    <p>
                        Безпека ваших даних є важливою для нас, але пам'ятайте, що жоден метод передачі через
                        Інтернет або метод електронного зберігання не є 100% безпечним. Хоча ми прагнемо
                        використовувати комерційно прийнятні засоби для захисту ваших Особистих даних, ми
                        не можемо гарантувати їхню абсолютну безпеку.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Зміни до цієї Політики конфіденційності</h2>
                    <p>
                        Ми можемо час від часу оновлювати нашу Політику конфіденційності. Ми повідомимо вас про
                        будь-які зміни, опублікувавши нову Політику конфіденційності на цій сторінці.
                    </p>
                    <p className="mt-4">
                        Ця Політика конфіденційності набуває чинності з [Поточна дата].
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrivacyPolicy;
