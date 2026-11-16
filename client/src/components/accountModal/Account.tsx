import { useContext, useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/auth';
import { ModalContext } from '../../context/modal';
import api from '../../service/apiClient';
import '../loginModal/style.css';

const AccountModal = () => {
  const { closeModal } = useContext(ModalContext);
  const { onUpdateAccount } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get<{ username: string }>('/auth/me')
      .then(({ data }) => {
        if (active) setUsername(data.username);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onUpdateAccount(username, currentPassword, newPassword || null);
      closeModal();
    } catch (error) {
      setError(axios.isAxiosError(error) && typeof error.response?.data === 'string'
        ? error.response.data
        : 'Unable to save account settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading account settings...</p>;
  if (loadFailed) return <p role="alert">Unable to load account settings. Please close and try again.</p>;

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="account-username">Username:</label>
        <input id="account-username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="current-password">Current password:</label>
        <input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required />
      </div>
      <div>
        <label htmlFor="new-password">New password (optional):</label>
        <input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} />
      </div>
      <div>
        <label htmlFor="confirm-password">Confirm new password:</label>
        <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
      </div>
      {error && <div role="alert" style={{ color: 'red' }}>{error}</div>}
      <button type="submit" className="login-button" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
    </form>
  );
};

export default AccountModal;
