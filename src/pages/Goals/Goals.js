import React, { useState, useEffect } from 'react';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    FlagIcon, // Можна використовувати для іконок цілей
    XMarkIcon, // Для закриття модального вікна
    HomeIcon, ClipboardDocumentListIcon, BellIcon, UserCircleIcon, ChevronDownIcon, BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, UsersIcon
} from '@heroicons/react/24/outline';

// Імпорт функцій Firestore
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
// Імпорт функції signOut з Firebase Auth
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

// Імпорт компонентів бічної панелі та хедера
import { Link } from 'react-router-dom';

// URL для логотипу (посилається на файл у папці public)
const logoUrl = "/image.png";

function Goals({ db, auth, userId, userData }) { // Додано userData
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null); // Для редагування
    const [isSaving, setIsSaving] = useState(false);

    // Стан для форми додавання/редагування
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [currentProgress, setCurrentProgress] = useState('');
    const [dueDate, setDueDate] = useState('');

    // Отримання ID додатку
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    const navigate = useNavigate();

    // Завантаження цілей з Firestore
    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const goalsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/goals`);
        const unsubscribe = onSnapshot(goalsCollectionRef, (snapshot) => {
            const fetchedGoals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setGoals(fetchedGoals);
            setLoading(false);
        }, (err) => {
            console.error("Goals: Помилка отримання цілей:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, appId]);

    // Функції відкриття/закриття модального вікна
    const openModal = (goal = null) => {
        setCurrentGoal(goal);
        setGoalName(goal ? goal.name : '');
        setTargetAmount(goal ? goal.targetAmount : '');
        setCurrentProgress(goal ? goal.currentProgress : '');
        setDueDate(goal ? goal.dueDate : ''); // Дата має бути у форматі YYYY-MM-DD
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentGoal(null);
        setGoalName('');
        setTargetAmount('');
        setCurrentProgress('');
        setDueDate('');
    };

    // Обробник збереження цілі (додавання або оновлення)
    const handleSaveGoal = async (e) => {
        e.preventDefault();
        if (!db || !userId || !goalName.trim() || isNaN(parseFloat(targetAmount)) || isNaN(parseFloat(currentProgress))) {
            console.error("Помилка: Необхідні дані для цілі відсутні або некоректні.");
            return;
        }

        setIsSaving(true);
        const goalData = {
            name: goalName.trim(),
            targetAmount: parseFloat(targetAmount),
            currentProgress: parseFloat(currentProgress),
            dueDate: dueDate, // Дата у форматі YYYY-MM-DD
            userId: userId,
            updatedAt: new Date().toISOString(),
            createdAt: currentGoal?.createdAt || new Date().toISOString()
        };

        try {
            if (currentGoal) {
                // Оновлення існуючої цілі
                const goalRef = doc(db, `/artifacts/${appId}/users/${userId}/goals`, currentGoal.id);
                await updateDoc(goalRef, goalData);
                console.log("Ціль успішно оновлено!");
            } else {
                // Додавання нової цілі
                const goalsCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/goals`);
                await addDoc(goalsCollectionRef, goalData);
                console.log("Ціль успішно додано!");
            }
            closeModal();
        } catch (err) {
            console.error("Помилка збереження цілі:", err);
            setError(new Error(`Помилка збереження цілі: ${err.message || err}`));
        } finally {
            setIsSaving(false);
        }
    };

    // Обробник видалення цілі
    const handleDeleteGoal = async (goalId) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю ціль?')) {
            if (!db || !userId) {
                console.error("Firebase або ID користувача недоступні.");
                return;
            }

            setIsSaving(true);
            try {
                const goalRef = doc(db, `/artifacts/${appId}/users/${userId}/goals`, goalId);
                await deleteDoc(goalRef);
                console.log("Ціль успішно видалено!");
            } catch (err) {
                console.error("Помилка видалення цілі:", err);
                setError(new Error(`Помилка видалення цілі: ${err.message || err}`));
            } finally {
                setIsSaving(false);
            }
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

    // Determine the display name (copied from Dashboard.js for consistency)
    const displayName = (userData && userData.firstName && userData.lastName)
        ? `${userData.firstName} ${userData.lastName}`
        : userData?.email || 'Користувач';


    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження даних...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-['DM Sans']">
            {/* Бічна панель (скопійована з Dashboard для послідовності) */}
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
                        <Link to="/goals" className="flex items-center text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Goals
                        </Link>
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Accounts
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Transactions
                        </Link>
                        <Link to="/categories" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <Squares2X2Icon className="h-5 w-5 mr-3" /> Categories
                        </Link>
                        <Link to="/admin" className="flex items-center text-gray-700 hover:text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-colors duration-200">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основний контент сторінки Цілей */}
            <div className="flex-1 p-8 max-w-[1400px] mx-auto">
                {/* Хедер (скопійований з Dashboard для послідовності) */}
                <header className="bg-white p-5 rounded-2xl shadow-lg flex justify-between items-center mb-8 border border-gray-100">
                    <h1 className="text-3xl font-extrabold text-gray-900">Ваші фінансові цілі</h1>
                    <div className="flex items-center space-x-6">
                        {/* Вибір бюджету (залишився статичним) */}
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
                            <UserCircleIcon className="h-10 w-10 text-blue-500 rounded-full bg-blue-100 p-1" />
                            <div className="text-base">
                                <p className="font-semibold text-gray-800">{displayName}</p>
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

                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => openModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center shadow-md transition-all duration-200 text-base"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" /> Додати ціль
                    </button>
                </div>

                {/* Список цілей */}
                <div className="bg-white p-7 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-5">Список цілей</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Назва</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цільова сума</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Прогрес</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата завершення</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Дії</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {goals.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500 text-base">Цілей не знайдено.</td>
                                    </tr>
                                ) : (
                                    goals.map((goal) => (
                                        <tr key={goal.id}>
                                            <td className="px-6 py-4 text-base font-medium text-gray-900 flex items-center">
                                                <FlagIcon className="h-5 w-5 mr-2 text-blue-600" />
                                                {goal.name}
                                            </td>
                                            <td className="px-6 py-4 text-base text-gray-900">{goal.targetAmount.toFixed(2)} ₴</td>
                                            <td className="px-6 py-4 text-base text-gray-900">
                                                {goal.currentProgress.toFixed(2)} ₴ ({( (goal.currentProgress / goal.targetAmount) * 100).toFixed(1)}%)
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
                                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(goal.currentProgress / goal.targetAmount) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-base text-gray-900">{goal.dueDate}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => openModal(goal)} className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-blue-50 transition-colors duration-200">
                                                    <PencilIcon className="h-5 w-5 inline" />
                                                </button>
                                                <button onClick={() => handleDeleteGoal(goal.id)} className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50 transition-colors duration-200">
                                                    <TrashIcon className="h-5 w-5 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal для додавання/редагування цілі */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
                        <div className="bg-white p-7 rounded-2xl shadow-xl w-full max-w-lg relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <XMarkIcon className="h-7 w-7" />
                            </button>
                            <h2 className="text-2xl font-bold text-gray-800 mb-5">{currentGoal ? 'Редагувати' : 'Нова'} ціль</h2>
                            <form onSubmit={handleSaveGoal} className="space-y-4">
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Назва цілі:</span>
                                    <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} required className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Цільова сума:</span>
                                    <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Поточний прогрес:</span>
                                    <input type="number" step="0.01" value={currentProgress} onChange={(e) => setCurrentProgress(e.target.value)} required className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <label className="block">
                                    <span className="text-gray-700 font-medium text-base">Дата завершення:</span>
                                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="mt-1 block w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                                </label>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-2.5 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200 text-base font-semibold"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Зберігаємо...' : 'Зберегти'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-base font-semibold"
                                    >
                                        Скасувати
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Goals;
