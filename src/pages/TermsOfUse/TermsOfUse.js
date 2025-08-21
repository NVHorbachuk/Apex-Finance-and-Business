import React from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon
} from '@heroicons/react/24/outline'; // Імпортуємо іконки

const logoUrl = "/image.png";

function TermsOfUse({ userId, userData }) {
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
                        <Link to="/privacy-policy" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Політика конфіденційності
                        </Link>
                        <Link to="/terms-of-use" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
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
                    <h1 className="text-3xl font-extrabold text-gray-900">Умови використання</h1>
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
                        Ласкаво просимо до APEX FINANCE! Ці Умови використання ("Умови", "Умови використання")
                        регулюють ваше використання нашого веб-сайту, розташованого за адресою [Ваш домен],
                        та будь-яких пов'язаних послуг, що надаються APEX FINANCE.
                    </p>
                    <p>
                        Використовуючи Сервіс, ви погоджуєтеся дотримуватися цих Умов. Якщо ви не згодні з
                        будь-якою частиною Умов, ви не можете отримати доступ до Сервісу.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Облікові записи</h2>
                    <p>
                        Коли ви створюєте обліковий запис у нас, ви повинні завжди надавати нам точну,
                        повну та актуальну інформацію. Невиконання цього є порушенням Умов, що може
                        призвести до негайного розірвання вашого облікового запису на нашому Сервісі.
                    </p>
                    <p>
                        Ви несете відповідальність за збереження пароля, який ви використовуєте для доступу
                        до Сервісу, а також за будь-які дії або дії під вашим паролем, незалежно від того,
                        чи ваш пароль використовується з нашим Сервісом чи стороннім сервісом.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Інтелектуальна власність</h2>
                    <p>
                        Сервіс та його оригінальний вміст, функції та функціональність є та залишатимуться
                        виключною власністю APEX FINANCE та її ліцензіарів. Сервіс захищений законами про
                        авторське право, торговельну марку та іншими законами як України, так і
                        зарубіжних країн.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Посилання на інші веб-сайти</h2>
                    <p>
                        Наш Сервіс може містити посилання на сторонні веб-сайти або послуги, які не
                        належать або не контролюються APEX FINANCE.
                    </p>
                    <p>
                        APEX FINANCE не контролює та не несе відповідальності за вміст, політику
                        конфіденційності або практику будь-яких сторонніх веб-сайтів чи послуг.
                        Ви також визнаєте та погоджуєтеся з тим, що APEX FINANCE не несе
                        відповідальності, прямо чи опосередковано, за будь-які збитки чи втрати,
                        спричинені або імовірно спричинені використанням або довірою до будь-якого
                        такого вмісту, товарів або послуг, доступних на таких веб-сайтах або через
                        них.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Припинення</h2>
                    <p>
                        Ми можемо припинити або призупинити ваш обліковий запис негайно, без попереднього
                        повідомлення або відповідальності, на нашу виключну розсуд, з будь-якої причини,
                        включаючи, без обмежень, порушення вами Умов.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Відмова від гарантій</h2>
                    <p>
                        Використання вами Сервісу здійснюється на ваш власний ризик. Сервіс надається на
                        умовах "ЯК Є" та "ЯК ДОСТУПНО". Сервіс надається без гарантій будь-якого роду,
                        будь то явні чи неявні, включаючи, але не обмежуючись, неявними гарантіями
                        товарної придатності, придатності для певної мети, непорушення прав або ходу
                        виконання.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Застосовне право</h2>
                    <p>
                        Ці Умови регулюються та тлумачаться відповідно до законів України, без урахування
                        її положень про колізійне право.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Зміни до Умов</h2>
                    <p>
                        Ми залишаємо за собою право на власний розсуд змінювати або замінювати ці Умови
                        в будь-який час. Якщо зміна є суттєвою, ми докладемо розумних зусиль, щоб надати
                        повідомлення принаймні за 30 днів до набрання чинності будь-якими новими умовами.
                        Що становить суттєву зміну, буде визначено на наш власний розсуд.
                    </p>
                    <p className="mt-4">
                        Ці Умови використання набувають чинності з [Поточна дата].
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TermsOfUse;
