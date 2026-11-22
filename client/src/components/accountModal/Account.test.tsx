import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, AuthContext } from '../../context/auth';
import { ModalProvider } from '../../context/modal';
import api from '../../service/apiClient';
import AccountModal from './Account';

vi.mock('../../service/apiClient', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
  },
}));

const renderAccount = () => render(
  <AuthProvider>
    <ModalProvider>
      <AccountModal />
      <AuthContext.Consumer>{auth => <span data-testid="token">{auth.token}</span>}</AuthContext.Consumer>
    </ModalProvider>
  </AuthProvider>,
);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(api.get).mockResolvedValue({ data: { username: 'old-name' } });
});

describe('account settings', () => {
  it('updates username without changing password and stores the refreshed token', async () => {
    const user = userEvent.setup();
    vi.mocked(api.put).mockResolvedValue({ data: { token: 'new-token' } });
    renderAccount();
    const username = await screen.findByLabelText('Username:');
    await user.clear(username);
    await user.type(username, 'new-name');
    await user.type(screen.getByLabelText('Current password:'), 'old-password');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(api.put).toHaveBeenCalledWith('/auth/me', {
      username: 'new-name', currentPassword: 'old-password', newPassword: null,
    }));
    await waitFor(() => expect(localStorage.getItem('token')).toBe('new-token'));
    expect(screen.getByTestId('token')).toHaveTextContent('new-token');
  });

  it('validates password confirmation and displays server errors without losing input', async () => {
    const user = userEvent.setup();
    vi.mocked(api.put).mockRejectedValue({
      isAxiosError: true, response: { data: 'Current password is incorrect.' },
    });
    renderAccount();
    await screen.findByLabelText('Username:');
    await user.type(screen.getByLabelText('Current password:'), 'wrong');
    await user.type(screen.getByLabelText('New password (optional):'), 'new-secret');
    await user.type(screen.getByLabelText('Confirm new password:'), 'different');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(screen.getByRole('alert')).toHaveTextContent('New passwords do not match.');
    expect(api.put).not.toHaveBeenCalled();
    await user.clear(screen.getByLabelText('Confirm new password:'));
    await user.type(screen.getByLabelText('Confirm new password:'), 'new-secret');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Current password is incorrect.');
    expect(screen.getByLabelText('Username:')).toHaveValue('old-name');
    expect(api.put).toHaveBeenCalledWith('/auth/me', {
      username: 'old-name', currentPassword: 'wrong', newPassword: 'new-secret',
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('shows an error when account details cannot be loaded', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Network error'));
    renderAccount();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load account settings');
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });
});
