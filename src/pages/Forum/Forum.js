import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon, PlusIcon
} from '@heroicons/react/24/outline';

const logoUrl = "/image.png";

function Forum({ userId, userData }) {
    const [topics, setTopics] = useState([
        {
            id: 1,
            title: 'Найкращі стратегії бюджетування для початківців',
            author: 'Фінансовий Гуру',
            replies: 15,
            lastPost: '2 години тому',
            category: 'Бюджетування',
            content: `
                <p>Привіт усім! Хочу обговорити, які стратегії бюджетування ви вважаєте найефективнішими для тих, хто тільки починає свій шлях у фінансовому плануванні. Поділіться своїми думками!</p>
                <div class="mt-4 p-3 bg-gray-100 rounded-md">
                    <p class="font-semibold text-sm">Коментар від JaneDoe:</p>
                    <p class="text-sm">Мені дуже допомогло правило 50/30/20. Це просто і зрозуміло.</p>
                </div>
                 <div class="mt-2 p-3 bg-gray-100 rounded-md">
                    <p class="font-semibold text-sm">Коментар від JohnSmith:</p>
                    <p class="text-sm">Я використовую метод конвертів для готівки, дуже допомагає контролювати витрати на їжу.</p>
                </div>
            `
        },
        {
            id: 2,
            title: 'Як економити на комунальних послугах взимку?',
            author: 'Економний Олег',
            replies: 8,
            lastPost: 'Вчора',
            category: 'Економія',
            content: `
                <p>Зима завжди приносить збільшення рахунків за опалення. Які ваші перевірені методи економії на комунальних послугах? Поділіться лайфхаками!</p>
                <div class="mt-4 p-3 bg-gray-100 rounded-md">
                    <p class="font-semibold text-sm">Коментар від AnnaK:</p>
                    <p class="text-sm">Встановила програмований термостат, економія суттєва!</p>
                </div>
                 <div class="mt-2 p-3 bg-gray-100 rounded-md">
                    <p class="font-semibold text-sm">Коментар від KyivDweller:</p>
                    <p class="text-sm">Обов'язково утеплюйте вікна та двері, це базовий, але дуже ефективний крок.</p>
                </div>
            `
        },
        {
            id: 3,
            title: 'Поради щодо інвестування для молоді',
            author: 'Молодий Інвестор',
            replies: 22,
            lastPost: '3 дні тому',
            category: 'Інвестиції',
            content: `
                <p>Всім привіт! Я студент, і мені цікаво, з чого краще почати інвестувати, маючи невеликий стартовий капітал. Які є поради для молодих інвесторів?</p>
                <div class="mt-4 p-3 bg-gray-100 rounded-md">
                    <p class="font-semibold text-sm">Коментар від CryptoKing:</p>
                    <p class="text-sm">Почніть з ETF, вони дозволяють диверсифікувати ризики при малих вкладеннях.</p>
                </div>
                 <div class="mt-2 p-3 bg-gray-100 rounded-md">
                    <p class="font-semibold text-sm">Коментар від OldSchoolInvest:</p>
                    <p class="text-sm">Навчіться спочатку, потім інвестуйте. Читайте книжки про фінанси.</p>
                </div>
            `
        },
    ]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [newReply, setNewReply] = useState('');
    const [showNewTopicModal, setShowNewTopicModal] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicCategory, setNewTopicCategory] = useState('');
    const [newTopicContent, setNewTopicContent] = useState('');

    const handleAddReply = () => {
        if (newReply.trim() && selectedTopic) {
            
            const updatedTopics = topics.map(topic =>
                topic.id === selectedTopic.id
                    ? {
                        ...topic,
                        replies: topic.replies + 1,
                        lastPost: 'Щойно',
                        content: topic.content + `<div class="mt-4 p-3 bg-blue-50 rounded-md"><p class="font-semibold text-sm">Ваш коментар:</p><p class="text-sm">${newReply}</p></div>`
                    }
                    : topic
            );
            setTopics(updatedTopics);
            setNewReply('');
            setSelectedTopic(prev => ({ // Оновлюємо selectedTopic, щоб відобразився новий коментар
                ...prev,
                replies: prev.replies + 1,
                lastPost: 'Щойно',
                content: prev.content + `<div class="mt-4 p-3 bg-blue-50 rounded-md"><p class="font-semibold text-sm">Ваш коментар:</p><p class="text-sm">${newReply}</p></div>`
            }));
        }
    };

    const handleCreateNewTopic = () => {
        if (newTopicTitle.trim() && newTopicContent.trim()) {
            const newId = topics.length > 0 ? Math.max(...topics.map(t => t.id)) + 1 : 1;
            const newTopic = {
                id: newId,
                title: newTopicTitle.trim(),
                author: userData?.firstName || 'Анонім', // Використовуємо ім'я користувача, якщо доступне
                replies: 0,
                lastPost: 'Щойно',
                category: newTopicCategory.trim() || 'Загальне',
                content: `<p>${newTopicContent.trim()}</p>`
            };
            setTopics([newTopic, ...topics]); // Додаємо нову тему на початок
            setShowNewTopicModal(false);
            setNewTopicTitle('');
            setNewTopicCategory('');
            setNewTopicContent('');
            setSelectedTopic(newTopic); // Одразу відкриваємо нову тему
        }
    };

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
                        <Link to="/forum" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
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
                    <h1 className="text-3xl font-extrabold text-gray-900">Форум спільноти</h1>
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
                    {selectedTopic ? (
                        // Відображення повної теми
                        <div className="mb-8">
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className="mb-4 text-blue-600 hover:underline flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Назад до всіх тем
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedTopic.title}</h1>
                            <p className="text-sm text-gray-500 mb-4">Автор: {selectedTopic.author} | Категорія: {selectedTopic.category}</p>
                            <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedTopic.content }}></div>

                            <div className="mt-8">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4">Додати відповідь</h3>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
                                    rows="4"
                                    placeholder="Напишіть свою відповідь..."
                                    value={newReply}
                                    onChange={(e) => setNewReply(e.target.value)}
                                ></textarea>
                                <button
                                    onClick={handleAddReply}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition"
                                >
                                    Відправити відповідь
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Відображення списку тем
                        <>
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={() => setShowNewTopicModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-md transition"
                                >
                                    <PlusIcon className="h-5 w-5 mr-2" /> Створити нову тему
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тема</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Автор</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категорія</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Відповіді</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Останній допис</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {topics.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">Поки що немає тем. Будьте першим, хто створить тему!</td>
                                            </tr>
                                        ) : (
                                            topics.map(topic => (
                                                <tr key={topic.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTopic(topic)}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">{topic.title}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{topic.author}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{topic.category}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{topic.replies}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{topic.lastPost}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal for creating a new topic */}
                {showNewTopicModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Створити нову тему</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="newTopicTitle" className="block text-sm font-medium text-gray-700 mb-1">Заголовок теми</label>
                                    <input
                                        type="text"
                                        id="newTopicTitle"
                                        value={newTopicTitle}
                                        onChange={(e) => setNewTopicTitle(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newTopicCategory" className="block text-sm font-medium text-gray-700 mb-1">Категорія</label>
                                    <input
                                        type="text"
                                        id="newTopicCategory"
                                        value={newTopicCategory}
                                        onChange={(e) => setNewTopicCategory(e.target.value)}
                                        placeholder="Напр. 'Фінанси', 'Питання'"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newTopicContent" className="block text-sm font-medium text-gray-700 mb-1">Зміст теми</label>
                                    <textarea
                                        id="newTopicContent"
                                        value={newTopicContent}
                                        onChange={(e) => setNewTopicContent(e.target.value)}
                                        rows="6"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setShowNewTopicModal(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={handleCreateNewTopic}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Створити тему
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Forum;
