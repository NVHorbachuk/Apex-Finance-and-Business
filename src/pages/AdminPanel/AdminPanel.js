import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc, getDocs } from 'firebase/firestore';
import {
    UsersIcon, TrashIcon, ExclamationTriangleIcon, // Іконки для AdminPanel
    HomeIcon, BanknotesIcon, CreditCardIcon, Squares2X2Icon, ListBulletIcon, ClipboardDocumentListIcon // Іконки для бічної панелі з Dashboard
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

// URL для логотипу (визначено тут для AdminPanel)
const logoUrl = "/image.png";

function AdminPanel({ db, auth, userId }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    // Get the application ID
    const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

    useEffect(() => {
        if (!db || !userId) {
            setLoading(false);
            return;
        }

        const userProfilesCollectionRef = collection(db, `/artifacts/${appId}/public/data/user_profiles`);

        const unsubscribe = onSnapshot(userProfilesCollectionRef, (snapshot) => {
            const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);
            setLoading(false);
        }, (err) => {
            console.error("AdminPanel: Error fetching users:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [db, userId, appId]);

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (userToDelete && db) {
            try {
                // This is a placeholder for actual user deletion logic.
                // In a real Firebase application, you would typically call a Cloud Function
                // or a backend API to delete a user from Firebase Authentication
                // and clean up their associated data (accounts, transactions, etc.).
                // Directly deleting users via client-side Firestore SDK is NOT secure
                // and does not delete the user from Firebase Authentication.

                // Example placeholder: Delete user's profile document
                await deleteDoc(doc(db, `/artifacts/${appId}/public/data/user_profiles`, userToDelete.id));

                console.warn(`Attempted to delete user data for userId: ${userToDelete.id}.
                In a real app, this would involve deleting their private collections
                like /artifacts/${appId}/users/${userToDelete.id}/accounts, /transactions, etc.,
                usually via a secure backend function.`);

                console.log(`User ${userToDelete.email || userToDelete.id} (profile only) deleted successfully.`);
            } catch (err) {
                console.error("Error deleting user:", err);
                setError(new Error(`Failed to delete user: ${err.message}`));
            } finally {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans']">Завантаження панелі адміністратора...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] font-['DM Sans'] text-red-500">Помилка: {error.message}</div>;

    return (
        <div className="flex min-h-screen bg-[#F7FAFC] font-['DM Sans']">
            {/* Бічна панель */}
            <aside className="w-64 bg-white p-6 shadow-xl flex flex-col justify-between rounded-r-xl">
                <div>
                    <div className="flex items-center mb-10">
                        <img src={logoUrl} alt="Finance Manager Logo" className="w-8 h-8 mr-2 object-contain" />
                        <span className="text-xl font-bold text-gray-900">Finance Manager</span>
                    </div>
                    <nav className="space-y-4">
                        <Link to="/" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <HomeIcon className="h-5 w-5 mr-3" /> Home
                        </Link>
                        <Link to="/budgets" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <BanknotesIcon className="h-5 w-5 mr-3" /> Budgets
                        </Link>
                        <Link to="/goals" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ListBulletIcon className="h-5 w-5 mr-3" /> Goals
                        </Link>
                        <Link to="/accounts" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <CreditCardIcon className="h-5 w-5 mr-3" /> Accounts
                        </Link>
                        <Link to="/transactions" className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <ClipboardDocumentListIcon className="h-5 w-5 mr-3" /> Transactions
                        </Link>
                        {/* Current active link for Admin Panel */}
                        <Link to="/admin" className="flex items-center text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-200">
                            <UsersIcon className="h-5 w-5 mr-3" /> Admin Panel
                        </Link>
                    </nav>
                </div>
            </aside>

            {/* Основна область контенту для панелі адміністратора */}
            <div className="flex-1 flex flex-col p-6 max-w-[1184px] mx-auto">
                <header className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Панель адміністратора</h1>
                </header>

                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <UsersIcon className="h-6 w-6 mr-3 text-[#2C5282]" /> Усі користувачі
                    </h2>
                    {users.length === 0 ? (
                        <p className="text-gray-500">Немає зареєстрованих користувачів (або не вдалося завантажити).</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-[#F0F4F8]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            ID користувача
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Email (якщо є)
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                            Дії
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#EBF8FF] transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {user.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-800 transition-colors duration-200 p-2 rounded-md hover:bg-red-50"
                                                    title="Видалити користувача"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Модальне вікно підтвердження видалення */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                            <div className="flex items-center text-red-500 mb-4">
                                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                                <h3 className="text-lg font-bold text-gray-800">Підтвердити видалення</h3>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Ви впевнені, що хочете видалити користувача <span className="font-semibold">{userToDelete?.email || userToDelete?.id}</span>?
                                Це дія незворотна і видалить їх профіль (але не дані аутентифікації Firebase).
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-[#E2E8F0] text-gray-800 rounded-lg hover:bg-[#CBD5E0] transition-colors duration-200"
                                >
                                    Скасувати
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                    Видалити
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
