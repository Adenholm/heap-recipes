import { FormEvent, useContext, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/service/apiClient';
import { ModalContext } from '@/context/modal';
import './style.css';

const AddUserModal = ({ onAdded }: { onAdded: () => Promise<void> }) => {
    const { closeModal } = useContext(ModalContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await api.post('/auth/register', { username, password, role });
            closeModal();
            await onAdded();
        } catch (requestError) {
            setError(isAxiosError(requestError) && typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Unable to add user. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
            {error && <p className="user-management-error" role="alert">{error}</p>}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding user...' : 'Add user'}
            </button>
        </form>
    );
};

export default AddUserModal;
