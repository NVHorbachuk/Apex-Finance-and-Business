import React, { useState, useEffect, useCallback } from 'react';
import {
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon,
    ChevronDownIcon, BanknotesIcon, CreditCardIcon, ListBulletIcon, UsersIcon,
    PencilIcon, TrashIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon
} from '@heroicons/react/24/outline';
import { collection, doc, getDocs, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const logoUrl = "/image.png";

// Фактичний userId адміністратора з вашої Firebase Authentication Горбачук Назарій - CawE33GEkZhLFsapAdBr3saDV3F3
const ADMIN_USER_ID = "CawE33GEkZhLFsapAdBr3saDV3F3";

function AdminPanel({ db, auth, userId, userData }) {
    const [allUsersData, setAllUsersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        currency: 'UAH'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const navigate = useNavigate();
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    // Доступні валюти для вибору (скопійовано з ProfileSettings.js)
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

    // Перевірка доступу адміністратора
    useEffect(() => {
        // userId може бути null або undefined на початку, тому чекаємо, поки він буде встановлений
        if (userId !== null && userId !== undefined && userId !== ADMIN_USER_ID) {
            navigate('/dashboard'); // Перенаправити, якщо користувач не є адміністратором
        }
    }, [userId, navigate]);

    // Функція для отримання всіх користувачів
    const fetchAllUsers = useCallback(async () => {
        if (!db) {
            setError(new Error("База даних не доступна."));
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const usersRef = collection(db, `/artifacts/${appId}/users`);
            const querySnapshot = await getDocs(usersRef);
            const usersList = [];

            // Проходимо по кожному документу, який представляє userId
            for (const docSnapshot of querySnapshot.docs) {
                const userUid = docSnapshot.id; // Це userId
                const profileDocRef = doc(db, `/artifacts/${appId}/users/${userUid}/profile`, 'details');
                const profileDocSnap = await getDoc(profileDocRef);

                let userData = { id: userUid, email: 'Невідомо', firstName: '', lastName: '', phone: '', address: '', city: '', country: '', currency: 'UAH' };

                if (profileDocSnap.exists()) {
                    userData = { ...userData, ...profileDocSnap.data() };
                } else {
                    console.warn(`Profile details not found for user: ${userUid}`);
                }
                usersList.push(userData);
            }
            setAllUsersData(usersList);
            setLoading(false);
        } catch (err) {
            console.error("Помилка отримання даних користувачів:", err);
            setError(new Error(`Помилка завантаження користувачів: ${err.message}`));
            setLoading(false);
        }
    }, [db, appId]);

    useEffect(() => {
        // Завантажуємо користувачів, лише якщо userId є ADMIN_USER_ID
        if (userId === ADMIN_USER_ID) {
            fetchAllUsers();
        } else if (userId !== null && userId !== undefined) {
            // Якщо userId встановлено, але це не ADMIN_USER_ID, зупиняємо завантаження
            setLoading(false);
        }
    }, [userId, fetchAllUsers]);

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '', // Email, як правило, не редагується, але може відображатися
            phone: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || '',
            currency: user.currency || 'UAH'
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setEditFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', country: '', currency: 'UAH' });
        setSaveSuccess(false); // Скинути стан успіху при закритті
    };

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        if (!db || !selectedUser) {
            setError(new Error("База даних або вибраний користувач недоступні."));
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const userProfileDocRef = doc(db, `/artifacts/${appId}/users/${selectedUser.id}/profile`, 'details');
            await updateDoc(userProfileDocRef, {
                firstName: editFormData.firstName.trim(),
                lastName: editFormData.lastName.trim(),
                phone: editFormData.phone.trim(),
                address: editFormData.address.trim(),
                city: editFormData.city.trim(),
                country: editFormData.country.trim(),
                currency: editFormData.currency,
                updatedAt: new Date().toISOString()
            });
            setSaveSuccess(true);
            setError(null);
            console.log(`Профіль користувача ${selectedUser.id} успішно оновлено!`);
            fetchAllUsers(); // Оновити список після збереження
            setTimeout(() => {
                setSaveSuccess(false);
                closeEditModal();
            }, 1500); // Закрити модальне вікно через 1.5 секунди після успіху
        } catch (err) {
            console.error("Помилка оновлення профілю користувача:", err);
            setError(new Error(`Помилка оновлення профілю: ${err.message}`));
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteConfirm = (user) => {
        setSelectedUser(user);
        setIsDeleteConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setSelectedUser(null);
        setError(null); // Скинути помилку при закритті
    };

    const confirmDeleteUser = async () => {
        if (!db || !selectedUser) {
            setError(new Error("База даних або вибраний користувач недоступні."));
            return;
        }

        setIsSaving(true); // Використовуємо isSaving для індикатора видалення
        try {
            // Видалення всіх підколекцій користувача (транзакції, бюджети, цілі, рахунки, профайл)
            const subcollections = ['transactions', 'budgets', 'goals', 'accounts']; // Додано 'accounts'
            for (const sub of subcollections) {
                const subColRef = collection(db, `/artifacts/${appId}/users/${selectedUser.id}/${sub}`);
                const subDocs = await getDocs(subColRef);
                for (const d of subDocs.docs) { // Перейменовано змінну 'doc' на 'd' щоб уникнути конфлікту
                    await deleteDoc(d.ref);
                }
            }
            // Видалення профілю користувача
            const profileDocRef = doc(db, `/artifacts/${appId}/users/${selectedUser.id}/profile`, 'details');
            const profileDocSnap = await getDoc(profileDocRef);
            if (profileDocSnap.exists()) { // Перевірка існування перед видаленням
                await deleteDoc(profileDocRef);
            }

            // Видалення основного документа користувача
            const userDocRef = doc(db, `/artifacts/${appId}/users`, selectedUser.id);
            await deleteDoc(userDocRef);

            setError(null);
            console.log(`Користувача ${selectedUser.id} та всі його дані успішно видалено!`);
            fetchAllUsers(); // Оновити список після видалення
            closeDeleteConfirm();
        } catch (err) {
            console.error("Помилка видалення користувача:", err);
            setError(new Error(`Помилка видалення користувача: ${err.message}`));
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

    // Визначення імені для відображення
    const getDisplayName = (user) => {
        if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
        if (user.email) return user.email;
        return user.id || 'Невідомий користувач';
    };

    // Визначення імені для відображення поточного адміністратора
    const currentAdminDisplayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : auth.currentUser?.email || 'Адміністратор';


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans'] text-lg text-blue-700">Завантаження панелі адміністратора...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans'] text-lg text-red-500">Помилка: {error.message}</div>;

    // Якщо користувач не є адміністратором, ми вже перенаправили його через useEffect
    if (userId !== ADMIN_USER_ID) {
        return null; // або можна повернути `<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans'] text-lg text-gray-700">Доступ заборонено.</div>`;
    }

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
                        <Link to="/admin" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                        <Link to="/profile-settings" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 p-8 max-w-[1400px] mx-auto">
                {/* Header */}
                <header className="bg-white p-5 rounded-2xl shadow-lg flex justify-between items-center mb-8 border border-gray-100">
                    <h1 className="text-3xl font-extrabold text-gray-900">Панель адміністратора</h1>
                    <div className="flex items-center space-x-6">
                        <BellIcon className="h-7 w-7 text-gray-500 cursor-pointer hover:text-blue-600 transition-colors duration-200" />
                        <div className="flex items-center space-x-3">
                            <UserCircleIcon className="h-10 w-10 text-blue-500 rounded-full bg-blue-100 p-1" />
                            <div className="text-base">
                                <p className="font-semibold text-gray-800">{currentAdminDisplayName}</p>
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
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Керування користувачами</h2>
                    {allUsersData.length === 0 && !loading ? (
                        <p className="text-gray-500 text-base">Користувачів не знайдено.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID користувача</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ім'я</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прізвище</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Електронна пошта</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Валюта</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Дії</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {allUsersData.map(user => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.firstName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.lastName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.currency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors duration-200"
                                                >
                                                    <PencilIcon className="h-5 w-5 inline" />
                                                </button>
                                                {/* Заборонити адміністратору видаляти самого себе */}
                                                {user.id !== ADMIN_USER_ID && (
                                                    <button
                                                        onClick={() => openDeleteConfirm(user)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors duration-200 ml-2"
                                                    >
                                                        <TrashIcon className="h-5 w-5 inline" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Edit User Modal */}
                {isEditModalOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-7 rounded-2xl shadow-xl w-full max-w-lg relative">
                            <button
                                onClick={closeEditModal}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5">Редагувати користувача: {getDisplayName(selectedUser)}</h2>
                            <form onSubmit={handleEditUserSubmit} className="space-y-4">
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Ім'я:</span>
                                    <input type="text" value={editFormData.firstName} onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })} className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Прізвище:</span>
                                    <input type="text" value={editFormData.lastName} onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })} className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Електронна пошта (нередагована):</span>
                                    <input type="email" value={editFormData.email} disabled className="mt-1 block w-full border border-gray-300 p-3 rounded-lg bg-gray-100 cursor-not-allowed text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Телефон:</span>
                                    <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Адреса:</span>
                                    <input type="text" value={editFormData.address} onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Місто:</span>
                                    <input type="text" value={editFormData.city} onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })} className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Країна:</span>
                                    <input type="text" value={editFormData.country} onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })} className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Валюта:</span>
                                    <select
                                        value={editFormData.currency}
                                        onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
                                    >
                                        {availableCurrencies.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.name} ({c.symbol})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                {saveSuccess && (
                                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-base" role="alert">
                                        <InformationCircleIcon className="h-5 w-5 inline mr-2" />
                                        <span className="block sm:inline">Зміни успішно збережено!</span>
                                    </div>
                                )}
                                {error && (
                                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-base" role="alert">
                                        <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                                        <span className="block sm:inline">{error.message}</span>
                                    </div>
                                )}
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 text-base font-semibold"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Зберігаємо...' : 'Зберегти зміни'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeEditModal}
                                        className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-base font-semibold"
                                    >
                                        Скасувати
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete User Confirmation Modal */}
                {isDeleteConfirmOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-7 rounded-2xl shadow-xl w-full max-w-lg relative">
                            <button
                                onClick={closeDeleteConfirm}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5">Підтвердити видалення користувача</h2>
                            <p className="text-gray-700 text-base mb-6">
                                Ви впевнені, що хочете видалити користувача "<span className="font-semibold">{getDisplayName(selectedUser)}</span>"?
                                Усі дані цього користувача (профіль, транзакції, бюджети, цілі, рахунки) будуть остаточно видалені. Цю дію не можна скасувати.
                            </p>
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-base mb-4" role="alert">
                                    <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" />
                                    <span className="block sm:inline">{error.message}</span>
                                </div>
                            )}
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={confirmDeleteUser}
                                    className="bg-red-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 hover:bg-red-700 transition-colors duration-200 text-base font-semibold"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Видаляємо...' : 'Видалити'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeDeleteConfirm}
                                    className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-base font-semibold"
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
