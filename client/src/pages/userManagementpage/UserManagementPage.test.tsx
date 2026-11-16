import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import UserManagementPage from '@/pages/userManagementpage/UserManagementPage';
import api from '@/service/apiClient';

vi.mock('@/service/apiClient', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const apiMock = vi.mocked(api);

describe('UserManagementPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        apiMock.get.mockResolvedValue({
            data: [{ id: 1, username: 'admin', role: 'Admin' }],
        } as never);
    });

    it('lists users and adds a user', async () => {
        const user = userEvent.setup();
        render(<UserManagementPage />);

        expect(await screen.findByText('admin')).toBeVisible();
        expect(screen.getByText('Admin')).toBeVisible();

        await user.click(screen.getByRole('button', { name: 'Add user' }));
        await user.type(await screen.findByLabelText('Username'), 'new-user');
        await user.type(screen.getByLabelText('Password'), 'secret');
        await user.selectOptions(screen.getByLabelText('Role'), 'Admin');
        const dialog = await screen.findByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: 'Add user' }));

        await waitFor(() => {
            expect(apiMock.post).toHaveBeenCalledWith('/auth/register', {
                username: 'new-user',
                password: 'secret',
                role: 'Admin',
            });
        });
        expect(await screen.findByRole('status')).toHaveTextContent('User added successfully.');
        expect(apiMock.get).toHaveBeenCalledWith('/auth/users');
    });

    it('shows an error when the user list cannot be loaded', async () => {
        apiMock.get.mockRejectedValueOnce(new Error('network failure'));
        render(<UserManagementPage />);

        expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load users.');
    });
});
