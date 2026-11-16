import { FormEvent, useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import ReactModal from 'react-modal';
import api from '@/service/apiClient';
import modalStyle from '@/components/modal/style.js';
import '@/components/modal/style.css';
import '@/pages/userManagementpage/style.css';
// @ts-ignore: missing type declaration for SVG import
import closeIcon from '@/assets/images/close-black.svg';

interface ManagedUser {
    id: number;
    username: string;
    role: string | null;
}

const UserManagementPage = () => {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formError, setFormError] = useState('');

    const closeModal = () => {
        setIsModalOpen(false);
        setFormError('');
    };

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

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError('');
        setSuccess('');
        setIsSubmitting(true);

        try {
            await api.post('/auth/register', { username, password, role });
            setUsername('');
            setPassword('');
            setRole('User');
            setSuccess('User added successfully.');
            setIsModalOpen(false);
            await loadUsers();
        } catch (requestError) {
            const message = isAxiosError(requestError) && typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Unable to add user. Please try again.';
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="user-management container">
            <div className="user-management-header">
                <h1>Manage users</h1>
                <button 
                    type="button" 
                    onClick={() => { setSuccess(''); setIsModalOpen(true); }}
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
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.role ?? 'User'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {success && <p className="user-management-success" role="status">{success}</p>}
            <ReactModal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                style={modalStyle}
                appElement={document.getElementById('root') ?? undefined}
                ariaHideApp={!!document.getElementById('root')}
            >
                <div className="modal-body">
                    <section className="modal-header border-bottom">
                        <h2>Add a user</h2>
                        <button type="button" className="modal-close" onClick={closeModal} aria-label="Close modal">
                            <img src={closeIcon} alt="" />
                        </button>
                    </section>
                    <form onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="new-username">Username</label>
                            <input
                                id="new-username"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={event => setUsername(event.target.value)}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="new-password">Password</label>
                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label htmlFor="new-role">Role</label>
                            <select id="new-role" value={role} onChange={event => setRole(event.target.value)}>
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                        {formError && <p className="user-management-error" role="alert">{formError}</p>}
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Adding user...' : 'Add user'}
                        </button>
                    </form>
                </div>
            </ReactModal>
        </main>
    );
};

export default UserManagementPage;
