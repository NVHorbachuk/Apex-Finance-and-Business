import React from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon, CurrencyDollarIcon, PresentationChartLineIcon, CheckBadgeIcon,
    UserCircleIcon, BellIcon, ClipboardDocumentListIcon // Додано відсутні іконки
} from '@heroicons/react/24/outline'; // Додаткові іконки

const logoUrl = "/image.png"; // Переконайтеся, що шлях до логотипу правильний

function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Навігаційна панель */}
            <header className="py-4 px-6 bg-white shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={logoUrl} alt="APEX Finance Logo" className="h-10 w-10 mr-3 rounded-full" />
                        <span className="text-2xl font-bold text-gray-900">APEX FINANCE</span>
                    </div>
                    <nav className="space-x-6">
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Увійти</Link>
                        <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">Зареєструватися</Link>
                    </nav>
                </div>
            </header>

            {/* Секція Героя */}
            <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {/* Приклад фонових елементів */}
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                    <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-indigo-500 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-1/4 left-1/2 w-80 h-80 bg-purple-500 opacity-20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                        Єдиний додаток, який приведе ваші фінанси в порядок
                    </h1>
                    <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
                        Керуйте грошима на ходу. Отримайте повний контроль над своїми фінансами за допомогою APEX FINANCE.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <a href="#features" className="bg-white text-blue-700 px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-gray-100 transition duration-300">
                            Дізнатися більше
                        </a>
                        <Link to="/register" className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-700 transition duration-300">
                            Почати зараз
                        </Link>
                    </div>
                    <div className="mt-12">
                        {/* Зображення, схоже на скріншоти додатку */}
                        <img
                            src="https://placehold.co/800x450/E0E7FF/3B82F6?text=Інтерфейс+APEX+FINANCE"
                            alt="APEX Finance App Interface"
                            className="mx-auto rounded-xl shadow-2xl border-4 border-blue-500"
                        />
                        <div className="flex justify-center mt-6 space-x-6">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-10 cursor-pointer" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" className="h-10 cursor-pointer" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Секція "Як привести фінанси в порядок" */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12">
                        Як APEX FINANCE приведе ваші гроші в порядок?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-8 rounded-lg shadow-lg bg-blue-50">
                            <HomeIcon className="h-12 w-12 text-blue-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Ідеальний контроль</h3>
                            <p className="text-gray-700">Отримайте повний контроль над усіма своїми грошовими витратами, банківськими рахунками, кредитними картками та іншими активами в одному місці.</p>
                        </div>
                        <div className="p-8 rounded-lg shadow-lg bg-green-50">
                            <PresentationChartLineIcon className="h-12 w-12 text-green-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Швидкий огляд</h3>
                            <p className="text-gray-700">Отримайте швидкий огляд ваших загальних доходів та витрат, а також того, куди йдуть ваші гроші, і все це в одному місці.</p>
                        </div>
                        <div className="p-8 rounded-lg shadow-lg bg-purple-50">
                            <CheckBadgeIcon className="h-12 w-12 text-purple-600 mx-auto mb-6" />
                            <h3 className="text-2xl font-semibold mb-4 text-gray-900">Розумні бюджети</h3>
                            <p className="text-gray-700">Використовуйте наші розумні бюджети, щоб заощадити гроші на новий автомобіль, мрійливу відпустку або іншу велику покупку.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Секція "Кроки" */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-16">
                        Прості кроки до фінансової свободи
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {/* Крок 1 */}
                        <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md bg-white">
                            <span className="text-5xl font-extrabold text-blue-600 mb-4">1</span>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Відстежуйте свій грошовий потік</h3>
                            <ul className="text-left text-gray-700 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Підключіть свої банківські рахунки, і всі ваші транзакції автоматично імпортуватимуться.
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Підключіть свій криптогаманець та електронний гаманець для повного огляду вашого грошового потоку.
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Додайте свої грошові витрати вручну.
                                </li>
                            </ul>
                            <img
                                src="https://placehold.co/300x200/F0F4F8/3B82F6?text=Рахунки+та+Баланси"
                                alt="Accounts and Balances"
                                className="mt-8 rounded-lg shadow-sm"
                            />
                        </div>

                        {/* Крок 2 */}
                        <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md bg-white">
                            <span className="text-5xl font-extrabold text-green-600 mb-4">2</span>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Зрозумійте свої фінансові звички</h3>
                            <ul className="text-left text-gray-700 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Аналізуйте свої фінанси за допомогою красивих, простих у використанні та зрозумілих графіків. Немає потреби у складних Excel-таблицях.
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Подивіться, куди йдуть ваші гроші та де вони надходять щомісяця.
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Подивіться, чи витрачаєте ви менше, ніж хочете, в одному місці і за 1 клік.
                                </li>
                            </ul>
                            <img
                                src="https://placehold.co/300x200/F0F4F8/38A169?text=Графік+Витрат"
                                alt="Spending Graph"
                                className="mt-8 rounded-lg shadow-sm"
                            />
                        </div>

                        {/* Крок 3 */}
                        <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-md bg-white">
                            <span className="text-5xl font-extrabold text-purple-600 mb-4">3</span>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Зробіть свої витрати безстресовими</h3>
                            <ul className="text-left text-gray-700 space-y-2">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Встановіть розумні бюджети, щоб не перевитрачати кошти у вибраній категорії.
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✔</span> Зберігайте гроші на свої майбутні мрії.
                                </li>
                            </ul>
                            <img
                                src="https://placehold.co/300x200/F0F4F8/805AD5?text=Бюджети+та+Цілі"
                                alt="Budgets and Goals"
                                className="mt-8 rounded-lg shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Секція "Функції, які люблять наші користувачі" */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12">
                        Функції, які люблять наші користувачі
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                        <div className="p-6 rounded-lg shadow-sm bg-blue-50 flex items-start">
                            <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mr-4 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Спільні гаманці</h3>
                                <p className="text-gray-700">Популярні серед пар, сімей та сусідів по кімнаті, які керують своїми фінансами разом.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-lg shadow-sm bg-green-50 flex items-start">
                            <HomeIcon className="h-8 w-8 text-green-600 mr-4 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Підключення банківських рахунків</h3>
                                <p className="text-gray-700">Spendee є бажаним додатком для людей, які платять переважно карткою.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-lg shadow-sm bg-purple-50 flex items-start">
                            <UserCircleIcon className="h-8 w-8 text-purple-600 mr-4 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Налаштуйте APEX FINANCE</h3>
                                <p className="text-gray-700">Налаштуйте свої категорії, додайте зображення або місце розташування до кожного витрати.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-lg shadow-sm bg-yellow-50 flex items-start">
                            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600 mr-4 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Кілька валют</h3>
                                <p className="text-gray-700">Чудово підходить для мандрівників та цифрових кочівників, які керують грошима у кількох валютах.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-lg shadow-sm bg-red-50 flex items-start">
                            <BellIcon className="h-8 w-8 text-red-600 mr-4 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Сповіщення та нагадування</h3>
                                <p className="text-gray-700">Будуть сповіщати вас, щоб ви не перевитрачали кошти у бюджеті.</p>
                            </div>
                        </div>
                        <div className="p-6 rounded-lg shadow-sm bg-blue-100 flex items-start">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-blue-800 mr-4 mt-1" />
                            <div>
                                <h3 className="text-xl font-semibold mb-2">Синхронізація та резервне копіювання</h3>
                                <p className="text-gray-700">Є цінною функцією для всіх, хто використовує APEX FINANCE на кількох пристроях і ділиться з іншими.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Секція "Про нас пишуть" (залишаємо заглушки) */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-12">
                        Про нас писали
                    </h2>
                    <div className="flex justify-center flex-wrap gap-8 items-center">
                        <img src="https://placehold.co/150x50/E2E8F0/A0AEC0?text=THE+VERGE" alt="The Verge Logo" className="h-10 opacity-75 grayscale hover:grayscale-0 transition-all duration-300" />
                        <img src="https://placehold.co/150x50/E2E8F0/A0AEC0?text=BUSINESS+INSIDER" alt="Business Insider Logo" className="h-10 opacity-75 grayscale hover:grayscale-0 transition-all duration-300" />
                        <img src="https://placehold.co/150x50/E2E8F0/A0AEC0?text=THE+WALL+STREET+JOURNAL" alt="The Wall Street Journal Logo" className="h-10 opacity-75 grayscale hover:grayscale-0 transition-all duration-300" />
                        <img src="https://placehold.co/150x50/E2E8F0/A0AEC0?text=LIFEHACKER" alt="Lifehacker Logo" className="h-10 opacity-75 grayscale hover:grayscale-0 transition-all duration-300" />
                        <img src="https://placehold.co/150x50/E2E8F0/A0AEC0?text=NBC+NEWS" alt="NBC News Logo" className="h-10 opacity-75 grayscale hover:grayscale-0 transition-all duration-300" />
                    </div>
                </div>
            </section>

            {/* Секція CTA */}
            <section className="bg-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Отримуйте щомісячні поради щодо грошей і будьте в курсі своїх фінансів
                    </h2>
                    <p className="text-lg opacity-90 mb-8">
                        Підпишіться на нашу розсилку, щоб отримувати ексклюзивні поради та новини.
                    </p>
                    <form className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <input
                            type="email"
                            placeholder="Ваш email"
                            className="w-full sm:w-80 p-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-300 shadow-md"
                        >
                            Підписатися
                        </button>
                    </form>
                    <p className="text-sm opacity-80 mt-4">
                        Я прочитав і згоден з <Link to="/terms-of-use" className="underline hover:text-white">Умовами та положеннями</Link>
                    </p>
                </div>
            </section>

            {/* Футер */}
            <footer className="bg-gray-900 text-gray-300 py-10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="font-bold text-gray-100 mb-4">APEX FINANCE</h4>
                        <ul className="space-y-2">
                            <li><Link to="/about-us" className="hover:text-white">Про нас</Link></li>
                            <li><Link to="/careers" className="hover:text-white">Кар'єра</Link></li>
                            <li><Link to="/contact-us" className="hover:text-white">Контакти</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-100 mb-4">Спільнота</h4>
                        <ul className="space-y-2">
                            <li><Link to="/blog" className="hover:text-white">Блог</Link></li>
                            <li><Link to="/forum" className="hover:text-white">Форум</Link></li>
                            <li><Link to="/faq" className="hover:text-white">Поширені запитання</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-100 mb-4">Юридичні</h4>
                        <ul className="space-y-2">
                            <li><Link to="/privacy-policy" className="hover:text-white">Політика конфіденційності</Link></li>
                            <li><Link to="/terms-of-use" className="hover:text-white">Умови використання</Link></li>
                            <li><Link to="/cookie-policy" className="hover:text-white">Політика файлів cookie</Link></li>
                        </ul>
                    </div>
                    <div className="text-right md:text-left">
                        <h4 className="font-bold text-gray-100 mb-4">Завантажте додаток</h4>
                        <div className="space-y-3">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/2560px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-10 cursor-pointer mx-auto md:mx-0" />
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" className="h-10 cursor-pointer mx-auto md:mx-0" />
                        </div>
                        <div className="flex justify-center md:justify-start space-x-4 mt-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.505 1.492-3.899 3.777-3.899 1.094 0 2.238.195 2.238.195v2.46h-1.262c-1.226 0-1.628.767-1.628 1.563V12h2.773l-.443 2.89h-2.33V22C18.343 21.128 22 16.991 22 12z" /></svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.793 1.968 4.904 4.859.062 1.266.077 1.646.077 4.85s-.015 3.584-.077 4.85c-.111 2.891-1.652 4.711-4.904 4.859-1.266.058-1.646.073-4.85.073s-3.584-.015-4.85-.073c-3.252-.148-4.793-1.968-4.904-4.859-.062-1.266-.077-1.646-.077-4.85s.015-3.584.077-4.85c.111-2.891 1.652-4.711 4.904-4.859 1.266-.058 1.646-.073 4.85-.073zm0 1.837c-3.266 0-3.64.014-4.872.073-2.891.132-3.951 1.463-4.043 4.043-.059 1.232-.073 1.606-.073 4.872s.014 3.64.073 4.872c.092 2.58 1.152 3.911 4.043 4.043 1.232.059 1.606.073 4.872.073s3.64-.014 4.872-.073c2.891-.132 3.951-1.463 4.043-4.043.059-1.232.073-1.606.073-4.872s-.014-3.64-.073-4.872c-.092-2.58-1.152-3.911-4.043-4.043-1.232-.059-1.606-.073-4.872-.073zm0 3.65a3.65 3.65 0 100 7.3a3.65 3.65 0 000-7.3zm0 1.837a1.813 1.813 0 110 3.626 1.813 1.813 0 010-3.626zM18.326 5.86a.913.913 0 11-1.826 0 .913.913 0 011.826 0z" /></svg>
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.43 8.87 8 9.8V15H8v-3h2v-2.2c0-2.72 1.66-4.2 4.05-4.2.96 0 1.86.17 2.1.2v2.16h-1.28c-1.13 0-1.35.53-1.35 1.32V12h2.69l-.45 3h-2.24v6.79c4.57-.93 8-4.96 8-9.8C22 6.48 17.52 2 12 2z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} APEX FINANCE. Всі права захищені.</p>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
