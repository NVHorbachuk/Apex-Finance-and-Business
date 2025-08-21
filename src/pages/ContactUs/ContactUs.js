import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon, PhoneIcon, EnvelopeIcon, MapPinIcon
} from '@heroicons/react/24/outline'; // Імпортуємо іконки

const logoUrl = "/image.png";

function ContactUs({ userId, userData }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');
        setSubmitError('');

        // Simulate API call
        try {
            // В ідеалі тут була б логіка відправки форми на бекенд (наприклад, Firebase Functions, EmailJS тощо)
            // fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });
            await new Promise(resolve => setTimeout(resolve, 1500)); // Затримка для імітації відправки

            console.log('Дані форми:', formData);
            setSubmitMessage('Ваше повідомлення успішно відправлено! Ми зв\'яжемося з вами найближчим часом.');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Очистити форму
        } catch (error) {
            console.error('Помилка відправки форми:', error);
            setSubmitError('Виникла помилка під час відправлення вашого повідомлення. Спробуйте ще раз пізніше.');
        } finally {
            setIsSubmitting(false);
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
                        <Link to="/contact-us" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
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
                    <h1 className="text-3xl font-extrabold text-gray-900">Зв'яжіться з нами</h1>
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

                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-8">
                    <div className="md:w-1/2">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Надішліть нам повідомлення</h2>
                        {submitMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{submitMessage}</div>}
                        {submitError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{submitError}</div>}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ваше ім'я</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Ваш Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Тема</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Повідомлення</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-md transition disabled:opacity-50"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Відправлення...' : 'Відправити повідомлення'}
                            </button>
                        </form>
                    </div>

                    <div className="md:w-1/2 mt-8 md:mt-0">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Наші контакти</h2>
                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-center">
                                <MapPinIcon className="h-6 w-6 text-gray-600 mr-3" />
                                <div>
                                    <p className="font-semibold">Адреса:</p>
                                    <p>вул. Українська, 10, м. Львів, Україна</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <PhoneIcon className="h-6 w-6 text-gray-600 mr-3" />
                                <div>
                                    <p className="font-semibold">Телефон:</p>
                                    <p>+380 98 123 4567</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <EnvelopeIcon className="h-6 w-6 text-gray-600 mr-3" />
                                <div>
                                    <p className="font-semibold">Email:</p>
                                    <p><a href="mailto:info@apexfinance.com" className="text-blue-600 hover:underline">info@apexfinance.com</a></p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-700 mb-3 mt-8">Графік роботи:</h3>
                        <p className="text-gray-700">Понеділок - П'ятниця: 9:00 - 18:00</p>
                        <p className="text-gray-700">Субота - Неділя: Вихідні</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;
