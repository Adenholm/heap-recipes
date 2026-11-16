import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../context/auth';
import { ModalContext, ModalProvider } from '../../context/modal';
import Header from './Header';

describe('user menu', () => {
    it('opens account settings from the user menu', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <AuthContext.Provider value={{
                    token: 'token', isAuthenticated: true, onLogin: vi.fn(),
                    onLogout: vi.fn(), onRegister: vi.fn(), onUpdateAccount: vi.fn(),
                }}>
                    <ModalProvider>
                        <Header />
                        <ModalContext.Consumer>
                            {modal => <span>{modal.isOpen ? modal.modalHeader : ''}</span>}
                        </ModalContext.Consumer>
                    </ModalProvider>
                </AuthContext.Provider>
            </BrowserRouter>,
        );
        await user.click(screen.getByRole('button', { name: 'User menu' }));
        await user.click(screen.getByRole('button', { name: 'Account settings' }));
        expect(screen.getByText('Account settings')).toBeVisible();
        expect(screen.getByRole('button', { name: 'User menu' })).toHaveAttribute('aria-expanded', 'false');
    });
});
