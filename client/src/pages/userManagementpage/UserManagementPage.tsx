import { useCallback, useContext, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/service/apiClient';
import { AuthContext } from '@/context/auth';
import { ModalContext } from '@/context/modal';
import '@/pages/userManagementpage/style.css';
// @ts-ignore: missing type declaration for SVG import
import deleteIcon from '@/assets/images/delete-white.svg';
import AddUserModal from './AddUserModal';
import DeleteUserModal, { type ManagedUser } from './DeleteUserModal';

const UserManagementPage = () => {
    const currentUserId = useContext(AuthContext)?.user?.id;
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { openModal, setModal, closeModal } = useContext(ModalContext);

    const loadUsers = useCallback(async () => {
        setError('');
        try {
            const response = await api.get<ManagedUser[]>('/auth/users');
            setUsers([...response.data].sort((a, b) =>
                Number(b.role === 'Admin') - Number(a.role === 'Admin') ||
                a.username.localeCompare(b.username, undefined, { sensitivity: 'base' })
            ));
        } catch (requestError) {
            const message = isAxiosError(requestError) && typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Unable to load users. Please try again.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    const showAddUserModal = () => {
        setSuccess('');
        setModal('Add a user', <AddUserModal onAdded={async () => {
            setSuccess('User added successfully.');
            await loadUsers();
        }} />);
        openModal();
    };

    const showDeleteUserModal = (user: ManagedUser) => {
        setSuccess('');
        setModal('Delete user', <DeleteUserModal
            user={user}
            onCancel={() => {
                closeModal();
            }}
            onDeleted={async () => {
                setSuccess(`User ${user.username} deleted.`);
                await loadUsers();
            }}
        />);
        openModal();
    };

    return (
        <main className="user-management container">
            <div className="user-management-header">
                <h1>Manage users</h1>
                <button 
                    type="button" 
                    onClick={showAddUserModal}
                >
                    Add user
                </button>
            </div>
            <hr />
            <section aria-labelledby="users-heading">
                {error && <p className="user-management-error" role="alert">{error}</p>}
                {isLoading ? (
                    <p>Loading users...</p>
                ) : users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <div className="user-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th scope="col">Username</th>
                                    <th scope="col">Role</th>
                                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.role ?? 'User'}</td>
                                        <td className="user-actions">
                                            {user.id !== currentUserId && (
                                                <button
                                                    type="button"
                                                    className="delete-user-button"
                                                    aria-label={`Delete ${user.username}`}
                                                    onClick={() => showDeleteUserModal(user)}
                                                >
                                                    <img src={deleteIcon} alt="" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {success && <p className="user-management-success" role="status">{success}</p>}
        </main>
    );
};

export default UserManagementPage;
