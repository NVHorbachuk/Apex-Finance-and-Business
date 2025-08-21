import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import {
    UserCircleIcon, HomeIcon, BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, ClipboardDocumentListIcon, UsersIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const logoUrl = "/image.png";

function ProfileSettings({ db, auth, userId, userData, setGlobalUserData }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        workplace: '',
        residence: '',
        spouseFirstName: '',
        spouseLastName: '',
        spouseEmail: '',
        spousePhone: '',
        spouseOccupation: '', // NEW: Spouse's Occupation
        spouseIncome: 0,       // NEW: Spouse's Income
        spouseIncomeFrequency: 'Monthly' // NEW: Spouse's Income Frequency (Default)
    });

    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const userProfileRef = doc(db, `/artifacts/${appId}/public/data/user_profiles`, userId);

        const unsubscribe = onSnapshot(userProfileRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.data();
                setProfileData({
                    firstName: fetchedData.firstName || '',
                    lastName: fetchedData.lastName || '',
                    email: fetchedData.email || auth.currentUser?.email || '',
                    workplace: fetchedData.workplace || '',
                    residence: fetchedData.residence || '',
                    spouseFirstName: fetchedData.spouseFirstName || '',
                    spouseLastName: fetchedData.spouseLastName || '',
                    spouseEmail: fetchedData.spouseEmail || '',
                    spousePhone: fetchedData.spousePhone || '',
                    spouseOccupation: fetchedData.spouseOccupation || '', // Fetch new field
                    spouseIncome: fetchedData.spouseIncome || 0,       // Fetch new field
                    spouseIncomeFrequency: fetchedData.spouseIncomeFrequency || 'Monthly' // Fetch new field
                });
            } else {
                setProfileData({
                    firstName: '',
                    lastName: '',
                    email: auth.currentUser?.email || '',
                    workplace: '',
                    residence: '',
                    spouseFirstName: '',
                    spouseLastName: '',
                    spouseEmail: '',
                    spousePhone: '',
                    spouseOccupation: '', // Initialize new field
                    spouseIncome: 0,       // Initialize new field
                    spouseIncomeFrequency: 'Monthly' // Initialize new field
                });
            }
            setLoading(false);
        }, (err) => {
            console.error("ProfileSettings: Помилка отримання даних профілю:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, appId, auth]);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!db || !userId) {
            console.error("Firebase або ID користувача недоступні.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const userProfileRef = doc(db, `/artifacts/${appId}/public/data/user_profiles`, userId);
            await setDoc(userProfileRef, {
                ...profileData,
                email: auth.currentUser?.email || profileData.email,
                userId: userId,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            if (setGlobalUserData) {
                setGlobalUserData(prevUserData => ({
                    ...prevUserData,
                    ...profileData,
                    email: auth.currentUser?.email || profileData.email
                }));
            }

            console.log("Дані профілю успішно збережено!");
        } catch (err) {
            console.error("Помилка збереження профілю:", err);
            setError(new Error(`Помилка збереження профілю: ${err.message}`));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження налаштувань профілю...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Бічна панель */}
            <aside className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-r-xl">
                <div>
                    <div className="flex items-center mb-10">
                        <img src={logoUrl} alt="Finance Manager Logo" className="w-8 h-8 mr-2 object-contain" />
                        <span className="text-xl font-bold text-gray-900">Finance Manager</span>
                    </div>
                    <nav className="space-y-4">
                        {/* Посилання на Dashboard (раніше Home) */}
                        <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <HomeIcon className="h-5 w-5 mr-3" /> Інформаційна панель
                        </Link>
                        <Link to="/budgets" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Бюджети
                        </Link>
                        <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Наші цілі
                        </Link>
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Рахунки
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Транзакції
                        </Link>
                        <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                        <Link to="/profile-settings" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основний контент сторінки налаштувань профілю */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8">
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Налаштування профілю</h1>
                </header>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error.message}</span>
                        </div>
                    )}
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                        {/* Розділ "Особисті дані" */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Особисті дані</h2>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Ім'я:</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={profileData.firstName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Прізвище:</span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={profileData.lastName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Email (не редагується):</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        readOnly
                                        className="mt-1 block w-full border p-2 rounded-lg bg-gray-100 cursor-not-allowed"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Місце роботи:</span>
                                    <input
                                        type="text"
                                        name="workplace"
                                        value={profileData.workplace}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Місце проживання:</span>
                                    <input
                                        type="text"
                                        name="residence"
                                        value={profileData.residence}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            {/* Розділ "Дані про дружину/чоловіка" */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">Дані про дружину/чоловіка</h2>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Ім'я:</span>
                                    <input
                                        type="text"
                                        name="spouseFirstName"
                                        value={profileData.spouseFirstName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Прізвище:</span>
                                    <input
                                        type="text"
                                        name="spouseLastName"
                                        value={profileData.spouseLastName}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Email:</span>
                                    <input
                                        type="email"
                                        name="spouseEmail"
                                        value={profileData.spouseEmail}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block mb-3">
                                    <span className="text-gray-700">Телефон:</span>
                                    <input
                                        type="tel"
                                        name="spousePhone"
                                        value={profileData.spousePhone}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                {/* NEW: Spouse's Occupation */}
                                <label className="block mb-3">
                                    <span className="text-gray-700">Професія:</span>
                                    <input
                                        type="text"
                                        name="spouseOccupation"
                                        value={profileData.spouseOccupation}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                {/* NEW: Spouse's Income */}
                                <label className="block mb-3">
                                    <span className="text-gray-700">Дохід:</span>
                                    <input
                                        type="number"
                                        name="spouseIncome"
                                        value={profileData.spouseIncome === 0 ? '' : profileData.spouseIncome} // Display empty if 0
                                        onChange={handleInputChange}
                                        step="0.01"
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                {/* NEW: Spouse's Income Frequency */}
                                <label className="block mb-3">
                                    <span className="text-gray-700">Періодичність доходу:</span>
                                    <select
                                        name="spouseIncomeFrequency"
                                        value={profileData.spouseIncomeFrequency}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Monthly">Щомісячно</option>
                                        <option value="Weekly">Щотижня</option>
                                        <option value="Bi-Weekly">Раз на два тижні</option>
                                        <option value="Annually">Щорічно</option>
                                        <option value="Other">Інше</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
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
