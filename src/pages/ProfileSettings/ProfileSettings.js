import React, { useState, useEffect } from 'react';
import {
    UserCircleIcon, HomeIcon, ClipboardDocumentListIcon, BellIcon,
    ChevronDownIcon, BanknotesIcon, CreditCardIcon, UsersIcon, ListBulletIcon
} from '@heroicons/react/24/outline'; // Видалено Squares2X2Icon
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Змінено updateDoc на setDoc
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const logoUrl = "/image.png"; // Переконайтеся, що шлях до логотипу правильний

// ====================================================================================
// ВАЖЛИВО: ЗАМІНІТЬ ЦЕ НА ВАШ АКТУАЛЬНИЙ ADMIN USER ID з Firebase Authentication.
// Це userId облікового запису, який має доступ до адмін-панелі.
// ====================================================================================
const ADMIN_USER_ID = "CawE33GEkZhLFsapAdBr3saDV3F3"; // <<<--- ЗМІНЕНО!

function ProfileSettings({ db, auth, userId }) {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState(''); // Email може бути змінений, якщо Firebase це дозволяє, або просто для відображення
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [currency, setCurrency] = useState('UAH'); // Додано для збереження валюти користувача
    const [profileImageUrl, setProfileImageUrl] = useState(''); // Додано стан для URL фото профілю

    const navigate = useNavigate();
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';


    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/profile`, 'details');
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setUserData(data);
                    setFirstName(data.firstName || '');
                    setLastName(data.lastName || '');
                    setEmail(auth.currentUser?.email || data.email || ''); // Використовувати email з Auth, якщо доступний
                    setPhone(data.phone || '');
                    setAddress(data.address || '');
                    setCity(data.city || '');
                    setCountry(data.country || '');
                    setCurrency(data.currency || 'UAH'); // Встановити збережену валюту
                    setProfileImageUrl(data.profileImageUrl || ''); // Завантажити URL фото профілю
                } else {
                    console.log("Документ профілю не існує, використовуються значення за замовчуванням.");
                    setEmail(auth.currentUser?.email || '');
                    // Якщо документа немає, встановлюємо початкове фото профілю, якщо потрібно
                    // setProfileImageUrl(defaultImageUrl); // наприклад
                }
            } catch (err) {
                console.error("Помилка отримання даних користувача:", err);
                setError(new Error(`Помилка отримання даних профілю: ${err.message}`));
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [db, userId, appId, auth]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!db || !userId) {
            setError(new Error("Немає підключення до бази даних або ID користувача."));
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        const profileData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            // Email не змінюється через профіль, він береться з Auth
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            country: country.trim(),
            currency: currency, // Зберігаємо обрану валюту
            profileImageUrl: profileImageUrl, // Зберігаємо URL фото профілю
            updatedAt: new Date().toISOString(),
        };

        try {
            const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/profile`, 'details');
            // Змінено updateDoc на setDoc з merge: true
            await setDoc(userDocRef, profileData, { merge: true });
            setSaveSuccess(true);
            setError(null);
            console.log("Профіль успішно оновлено!");
            setTimeout(() => setSaveSuccess(false), 3000); // Сховати повідомлення про успіх через 3 секунди
        } catch (err) {
            console.error("Помилка оновлення профілю:", err);
            setError(new Error(`Помилка оновлення профілю: ${err.message}`));
        } finally {
            setIsSaving(false);
        }
    };

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

    // Доступні валюти для вибору (розширений список)
    const availableCurrencies = [
        { code: 'USD', name: 'United States Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'UAH', name: 'Українська гривня', symbol: '₴' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
        { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
    ];

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження профілю...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans']">
            {/* Sidebar (copied from Dashboard for consistency) */}
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
                        {/* Видалено посилання на Categories */}
                        {/* <Link to="/categories" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-3" /> Categories
                        </Link> */}
                        {userId === ADMIN_USER_ID && ( // Умовний рендеринг: відображати посилання, якщо користувач є адміністратором
                            <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                                <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                            </Link>
                        )}
                        <Link to="/profile-settings" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 p-8 max-w-[1400px] mx-auto">
                {/* Header (copied from Dashboard for consistency) */}
                <header className="bg-white p-5 rounded-2xl shadow-lg flex justify-between items-center mb-8 border border-gray-100">
                    <h1 className="text-3xl font-extrabold text-gray-900">Налаштування профілю</h1>
                    <div className="flex items-center space-x-6">
                        {/* Dummy Budget Selector for consistent header */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-gray-100 text-gray-800 font-semibold py-2.5 px-5 rounded-xl pr-10 cursor-pointer text-base focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200 hover:bg-gray-200"
                            >
                                <option value="Budget 1">Budget 1</option>
                                <option value="Budget 2">Budget 2</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 pointer-events-none" />
                        </div>
                        <BellIcon className="h-7 w-7 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors duration-200" />
                        <div className="flex items-center space-x-3">
                            {profileImageUrl ? (
                                <img src={profileImageUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" />
                            ) : (
                                <UserCircleIcon className="h-10 w-10 text-blue-500 rounded-full bg-blue-100 p-1" />
                            )}
                            <div className="text-base">
                                <p className="font-semibold text-gray-800">{userData?.firstName || auth.currentUser?.email || 'Користувач'}</p>
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

                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Особиста інформація</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="firstName" className="block text-gray-700 text-base font-medium mb-2">Ім'я:</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-gray-700 text-base font-medium mb-2">Прізвище:</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-2">Електронна пошта:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Дозволяє користувачеві вводити, але не зберігається
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none cursor-not-allowed text-base"
                                disabled // Електронна пошта зазвичай не змінюється напряму
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-gray-700 text-base font-medium mb-2">Телефон:</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className="block text-gray-700 text-base font-medium mb-2">Адреса:</label>
                            <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="city" className="block text-gray-700 text-base font-medium mb-2">Місто:</label>
                                <input
                                    type="text"
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-gray-700 text-base font-medium mb-2">Країна:</label>
                                <input
                                    type="text"
                                    id="country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                />
                            </div>
                        </div>

                        {/* Поле для вибору валюти */}
                        <div>
                            <label htmlFor="currency" className="block text-gray-700 text-base font-medium mb-2">Основна валюта:</label>
                            <select
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
                            >
                                {availableCurrencies.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name} ({c.symbol})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Можливість додати фото профілю */}
                        <div>
                            <label htmlFor="profilePhoto" className="block text-gray-700 text-base font-medium mb-2">Фото профілю (URL):</label>
                            <div className="flex items-center space-x-4">
                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt="Profile Preview" className="h-20 w-20 rounded-full object-cover border-2 border-blue-300" />
                                ) : (
                                    <UserCircleIcon className="h-20 w-20 text-gray-400 rounded-full bg-gray-100 p-2" />
                                )}
                                <input
                                    type="text"
                                    id="profilePhoto"
                                    placeholder="Вставте URL зображення профілю"
                                    value={profileImageUrl}
                                    onChange={(e) => setProfileImageUrl(e.target.value)}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Ви можете вставити пряме посилання на зображення (наприклад, з Imgur, Google Photos тощо).</p>
                        </div>


                        {saveSuccess && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-base" role="alert">
                                <span className="block sm:inline">Профіль успішно збережено!</span>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-base" role="alert">
                                <span className="block sm:inline">{error.message}</span>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Зберігаємо...' : 'Зберегти зміни'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileSettings;
