import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon, NewspaperIcon
} from '@heroicons/react/24/outline'; // Імпортуємо іконки

const logoUrl = "/image.png";

function Blog({ userId, userData }) {
    // Фіктивні дані для блогу
    const [blogPosts] = useState([
        {
            id: 1,
            title: '5 порад для ефективного управління бюджетом',
            author: 'Назарій Горбачук',
            date: '21 серпня 2025',
            summary: 'Дізнайтеся, як краще планувати свої фінанси та уникати непотрібних витрат за допомогою цих простих порад.',
            imageUrl: 'https://placehold.co/600x400/add8e6/000000?text=Budgeting+Tips',
            content: `
                <p>Ефективне управління бюджетом є ключем до фінансової стабільності та досягнення довгострокових цілей. Ось п'ять перевірених порад, які допоможуть вам контролювати свої гроші:</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">1. Створіть реалістичний бюджет</h3>
                <p>Першим кроком є чітке розуміння ваших доходів та витрат. Використовуйте програми для обліку фінансів, щоб відстежувати, куди йдуть ваші гроші. Розподіліть свої доходи за категоріями, такими як житло, транспорт, їжа, розваги тощо.</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">2. Визначте свої пріоритети</h3>
                <p>Вирішіть, які витрати є необхідними, а які можна скоротити. Розгляньте "правило 50/30/20": 50% доходу на потреби, 30% на бажання, 20% на заощадження та погашення боргів.</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">3. Регулярно переглядайте свій бюджет</h3>
                <p>Життя змінюється, і ваш бюджет також має бути гнучким. Регулярно, наприклад, раз на місяць, переглядайте свої витрати та коригуйте бюджет відповідно до поточних обставин.</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">4. Створюйте фонд надзвичайних ситуацій</h3>
                <p>Непередбачені витрати можуть зруйнувати будь-який бюджет. Наявність фінансової "подушки безпеки" на 3-6 місяців ваших витрат забезпечить вам спокій та стабільність.</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">5. Використовуйте технології</h3>
                <p>Існує безліч мобільних додатків та онлайн-сервісів (як наш APEX FINANCE!), які можуть автоматизувати відстеження витрат, надсилати нагадування про платежі та допомагати аналізувати ваші фінансові звички.</p>
            `,
        },
        {
            id: 2,
            title: 'Інвестування для початківців: З чого почати?',
            author: 'Назарій Горбачук',
            date: '20 серпня 2025',
            summary: 'Перші кроки у світ інвестицій. Розберіться з основними поняттями та стратегіями.',
            imageUrl: 'https://placehold.co/600x400/c7f0d0/000000?text=Investing+Basics',
            content: `
                <p>Світ інвестицій може здатися складним, але розпочати його не так важко, як здається. Цей посібник допоможе вам зробити перші кроки.</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">Що таке інвестиції?</h3>
                <p>Інвестиції – це вкладення грошей з метою отримання прибутку в майбутньому. Це може бути покупка акцій, облігацій, нерухомості або інших активів.</p>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">Основні поняття</h3>
                <ul class="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Акції:</strong> Частки власності в компанії.</li>
                    <li><strong>Облігації:</strong> Позики, які ви надаєте уряду або компанії.</li>
                    <li><strong>Взаємні фонди/ETF:</strong> Кошики різних інвестицій, керовані професіоналами.</li>
                    <li><strong>Диверсифікація:</strong> Розподіл інвестицій між різними активами для зменшення ризику.</li>
                </ul>
                <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">З чого почати?</h3>
                <ol class="list-decimal list-inside text-gray-700 space-y-1">
                    <li>Створіть фонд надзвичайних ситуацій.</li>
                    <li>Визначте свої фінансові цілі (пенсія, покупка будинку тощо).</li>
                    <li>Оберіть брокера або інвестиційну платформу.</li>
                    <li>Почніть з невеликих, але регулярних інвестицій.</li>
                    <li>Продовжуйте вчитися та адаптувати свою стратегію.</li>
                </ol>
                <p class="mt-4">Пам'ятайте, інвестування завжди пов'язане з ризиком. Перед прийняттям рішень проконсультуйтеся з фінансовим радником.</p>
            `,
        },
    ]);

    const [selectedPost, setSelectedPost] = useState(null);

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
                        <Link to="/blog" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                            Блог
                        </Link>
                        <Link to="/forum" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            Форум
                        </Link>
                        <Link to="/privacy-policy" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
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
                    <h1 className="text-3xl font-extrabold text-gray-900">Блог</h1>
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

                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <NewspaperIcon className="h-6 w-6 text-gray-600 mr-2" /> Наші останні статті
                    </h2>

                    {selectedPost ? (
                        // Відображення повної статті
                        <div className="mb-8">
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="mb-4 text-blue-600 hover:underline flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Назад до всіх статей
                            </button>
                            <img src={selectedPost.imageUrl} alt={selectedPost.title} className="w-full h-80 object-cover rounded-lg mb-4 shadow-md" />
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedPost.title}</h1>
                            <p className="text-sm text-gray-500 mb-4">Автор: {selectedPost.author} | Дата: {selectedPost.date}</p>
                            <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedPost.content }}></div>
                        </div>
                    ) : (
                        // Відображення списку статей
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {blogPosts.map(post => (
                                <div key={post.id} className="border border-gray-200 rounded-lg shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer" onClick={() => setSelectedPost(post)}>
                                    <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{post.title}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{post.summary}</p>
                                        <p className="text-xs text-gray-500">Автор: {post.author} | {post.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Blog;
