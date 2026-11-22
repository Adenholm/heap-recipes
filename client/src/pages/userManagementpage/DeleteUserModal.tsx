import { useContext, useState } from 'react';
import { isAxiosError } from 'axios';
import api from '@/service/apiClient';
import { ModalContext } from '@/context/modal';
import './style.css';
import '@/components/deleteModal/style.css';

export interface ManagedUser {
    id: number;
    username: string;
    role: string | null;
}

const DeleteUserModal = ({
    user,
    onDeleted,
    onCancel,
}: {
    user: ManagedUser;
    onDeleted: () => Promise<void>;
    onCancel: () => void;
}) => {
    const { closeModal } = useContext(ModalContext);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');
        try {
            await api.delete(`/auth/users/${user.id}`);
            closeModal();
            await onDeleted();
        } catch (requestError) {
            setError(isAxiosError(requestError) && typeof requestError.response?.data === 'string'
                ? requestError.response.data
                : 'Unable to delete user. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <p>Are you sure you want to delete {user.username}?</p>
            {error && <p className="user-management-error" role="alert">{error}</p>}
            <div className="modal-buttons">
                <button type="button" onClick={onCancel}>Cancel</button>
                <button type="button" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </>
    );
};

export default DeleteUserModal;
