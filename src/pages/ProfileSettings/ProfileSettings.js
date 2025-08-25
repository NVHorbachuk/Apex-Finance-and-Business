import React, { useState, useEffect } from 'react';
import { onSnapshot, doc, setDoc } from 'firebase/firestore';
import {
    UserCircleIcon, HomeIcon, BanknotesIcon, CreditCardIcon, ListBulletIcon, ClipboardDocumentListIcon, UsersIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// Assuming logoUrl is a valid public URL or handled by the environment.
// For demonstration, using a placeholder if no image is provided or path is invalid.
const logoUrl = "/image.png";

function ProfileSettings({ db, auth, userId, userData, setGlobalUserData }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false); // New state for success message

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
        spouseOccupation: '',
        spouseIncome: '', // Initialize as empty string to allow placeholder in input
        spouseIncomeFrequency: 'Monthly'
    });

    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const userProfileRef = doc(db, `/artifacts/${appId}/public/data/user_profiles`, userId);

        // Subscribe to real-time updates for the user's profile
        const unsubscribe = onSnapshot(userProfileRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.data();
                setProfileData({
                    firstName: fetchedData.firstName || '',
                    lastName: fetchedData.lastName || '',
                    email: fetchedData.email || auth.currentUser?.email || '', // Fallback to auth email
                    workplace: fetchedData.workplace || '',
                    residence: fetchedData.residence || '',
                    spouseFirstName: fetchedData.spouseFirstName || '',
                    spouseLastName: fetchedData.spouseLastName || '',
                    spouseEmail: fetchedData.spouseEmail || '',
                    spousePhone: fetchedData.spousePhone || '',
                    spouseOccupation: fetchedData.spouseOccupation || '',
                    // Convert stored number to string for input value; display empty if 0 or undefined/null
                    spouseIncome: fetchedData.spouseIncome !== undefined && fetchedData.spouseIncome !== null ? String(fetchedData.spouseIncome) : '',
                    spouseIncomeFrequency: fetchedData.spouseIncomeFrequency || 'Monthly'
                });
            } else {
                // Initialize with default empty values if no profile exists
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
                    spouseOccupation: '',
                    spouseIncome: '',
                    spouseIncomeFrequency: 'Monthly'
                });
            }
            setLoading(false);
        }, (err) => {
            console.error("ProfileSettings: Помилка отримання даних профілю:", err);
            setError(err);
            setLoading(false);
        });

        // Clean up the subscription on component unmount
        return () => unsubscribe();
    }, [db, userId, appId, auth]); // Dependencies for useEffect

    // Handle input changes for all form fields
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            // For number inputs, convert to float or set to empty string if input is cleared
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    // Handle saving the profile data to Firestore
    const handleSaveProfile = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!db || !userId) {
            console.error("Firebase або ID користувача недоступні.");
            setError(new Error("Firebase або ID користувача недоступні."));
            return;
        }

        setIsSaving(true);
        setError(null);
        setSaveSuccess(false); // Reset success message on new save attempt

        try {
            const userProfileRef = doc(db, `/artifacts/${appId}/public/data/user_profiles`, userId);

            // Prepare data to save, ensuring spouseIncome is a number (0 if empty)
            const dataToSave = {
                ...profileData,
                email: auth.currentUser?.email || profileData.email,
                userId: userId,
                updatedAt: new Date().toISOString(),
                spouseIncome: profileData.spouseIncome === '' ? 0 : parseFloat(profileData.spouseIncome)
            };

            await setDoc(userProfileRef, dataToSave, { merge: true });

            // Update global user data if the prop is provided
            if (setGlobalUserData) {
                setGlobalUserData(prevUserData => ({
                    ...prevUserData,
                    ...dataToSave,
                    email: auth.currentUser?.email || profileData.email
                }));
            }

            console.log("Дані профілю успішно збережено!");
            setSaveSuccess(true); // Show success message
            // Hide success message after 5 seconds
            setTimeout(() => setSaveSuccess(false), 5000);

        } catch (err) {
            console.error("Помилка збереження профілю:", err);
            setError(new Error(`Помилка збереження профілю: ${err.message}`));
        } finally {
            setIsSaving(false);
        }
    };

    // Common Tailwind CSS classes for consistent input styling
    const commonInputClasses = "mt-1 block w-full border border-gray-300 p-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out sm:text-sm";
    const readOnlyInputClasses = "mt-1 block w-full border border-gray-200 p-2 rounded-lg bg-gray-100 cursor-not-allowed shadow-sm sm:text-sm";
    const labelClasses = "block text-sm font-medium text-gray-700";

    // Loading and error states UI
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-['Inter'] text-lg text-gray-700">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Завантаження налаштувань профілю...
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 font-['Inter'] text-red-700 p-6 rounded-lg shadow-lg m-4">
            <span className="font-bold mr-2 text-xl">Помилка:</span> <span className="text-lg">{error.message}</span>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-['Inter']">
            {/* Бічна панель */}
            <aside className="w-full md:w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-b-xl md:rounded-r-xl md:rounded-b-none z-10">
                <div>
                    <div className="flex items-center mb-10 pb-4 border-b border-gray-200">
                        {/* Image with fallback placeholder */}
                        <img 
                            src={logoUrl} 
                            alt="Finance Manager Logo" 
                            className="w-10 h-10 mr-3 object-contain rounded-full border border-gray-200 p-1" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40/cbd5e1/4a5568?text=FM"; }} 
                        />
                        <span className="text-2xl font-extrabold text-gray-900">Finance Manager</span>
                    </div>
                    <nav className="space-y-3">
                        {/* Navigation Links */}
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
                        {/* Active Link for Profile Settings */}
                        <Link to="/profile-settings" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg shadow-sm transition-colors duration-200 font-semibold">
                            <UserCircleIcon className="h-5 w-5 mr-3" /> Налаштування профілю
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Main content area for profile settings */}
            <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
                <header className="bg-white p-4 sm:p-6 rounded-xl shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2 sm:mb-0">Налаштування профілю</h1>
                    <span className="text-sm text-gray-500">Ваш ID користувача: <strong className="text-gray-700">{userId}</strong></span>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-md flex-1">
                    {/* Error message display */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                            <span className="block sm:inline font-semibold">Помилка: </span>
                            <span className="block sm:inline">{error.message}</span>
                        </div>
                    )}
                    {/* Success message display */}
                    {saveSuccess && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4" role="status">
                            <span className="block sm:inline font-semibold">Успіх! </span>
                            <span className="block sm:inline">Дані профілю успішно збережено.</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className="space-y-8">
                        {/* Section: Personal Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Особисті дані</h2>
                                <div className="space-y-4">
                                    <label className={labelClasses}>
                                        <span>Ім'я:</span>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={profileData.firstName}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Ваше ім'я"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Прізвище:</span>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={profileData.lastName}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Ваше прізвище"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Email (не редагується):</span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            readOnly
                                            className={readOnlyInputClasses}
                                            placeholder="Ваш email"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Місце роботи:</span>
                                        <input
                                            type="text"
                                            name="workplace"
                                            value={profileData.workplace}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Назва вашої компанії"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Місце проживання:</span>
                                        <input
                                            type="text"
                                            name="residence"
                                            value={profileData.residence}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Ваша адреса"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Section: Spouse's Data */}
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3 border-gray-200">Дані про дружину/чоловіка</h2>
                                <div className="space-y-4">
                                    <label className={labelClasses}>
                                        <span>Ім'я:</span>
                                        <input
                                            type="text"
                                            name="spouseFirstName"
                                            value={profileData.spouseFirstName}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Ім'я дружини/чоловіка"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Прізвище:</span>
                                        <input
                                            type="text"
                                            name="spouseLastName"
                                            value={profileData.spouseLastName}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Прізвище дружини/чоловіка"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Email:</span>
                                        <input
                                            type="email"
                                            name="spouseEmail"
                                            value={profileData.spouseEmail}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Email дружини/чоловіка"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Телефон:</span>
                                        <input
                                            type="tel"
                                            name="spousePhone"
                                            value={profileData.spousePhone}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Телефон дружини/чоловіка"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Професія:</span>
                                        <input
                                            type="text"
                                            name="spouseOccupation"
                                            value={profileData.spouseOccupation}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
                                            placeholder="Професія дружини/чоловіка"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Дохід:</span>
                                        <input
                                            type="number"
                                            name="spouseIncome"
                                            value={profileData.spouseIncome} // Correctly initialized as '' for placeholder
                                            onChange={handleInputChange}
                                            step="0.01"
                                            className={commonInputClasses}
                                            placeholder="Дохід дружини/чоловіка"
                                        />
                                    </label>
                                    <label className={labelClasses}>
                                        <span>Періодичність доходу:</span>
                                        <select
                                            name="spouseIncomeFrequency"
                                            value={profileData.spouseIncomeFrequency}
                                            onChange={handleInputChange}
                                            className={commonInputClasses}
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
                        </div>

                        {/* Save button with loading spinner */}
                        <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center shadow-md transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Зберігаємо...
                                    </>
                                ) : 'Зберегти зміни'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileSettings;
