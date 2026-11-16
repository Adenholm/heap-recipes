import { useContext, useState } from 'react';
import '@/layout/header/Header.css';

import ramen from '@/assets/images/ramen.svg';
import login from '@/assets/images/login.svg';
import account from '@/assets/images/account.svg';
import accountDark from '@/assets/images/account-dark.svg';
import addRecipe from '@/assets/images/add-recipe.svg';
import tagIcon from '@/assets/images/tag.svg';
import logout from '@/assets/images/logout.svg';
import { Link } from 'react-router-dom';
import { ModalContext } from '@/context/modal';
import LoginModal from '@/components/loginModal/Login';
import { AuthContext } from '@/context/auth';
import AccountModal from '@/components/accountModal/Account';

const Header = () => {
    const { openModal, setModal } = useContext(ModalContext);
    const { isAuthenticated, onLogout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

    const showLoginModal = () => {
        setMenuOpen(false);
        setModal('Login', <LoginModal/>);
        openModal();
    };

    const showAccountModal = () => {
        setMenuOpen(false);
        setModal('Account settings', <AccountModal />);
        openModal();
    };

    const Menu = ({ onLogout }: { onLogout: () => void }) => {
        interface MenuItem {
            label: string;
            icon: string;
            onClick: () => void;
            to?: string;
        }
        const items: MenuItem[] = [
            { label: 'Edit tags', icon: tagIcon, onClick: () => setMenuOpen(false), to: '/edit-tags' },
            { label: 'Account settings', icon: accountDark, onClick: showAccountModal },
            { label: 'Log out', icon: logout, onClick: onLogout }
        ];
        return (
            <nav className="menu" aria-label="User menu">
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>
                            {item.to ? (
                                <Link to={item.to} onClick={item.onClick}>
                                    <img src={item.icon} alt="" className="icon" />
                                    {item.label}
                                </Link>
                            ) : (
                                <button type="button" onClick={item.onClick}>
                                    <img src={item.icon} alt="" className="icon" />
                                    {item.label}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        );
    };

        return (
        <header className='page-header'>
            <div className="section">
                <Link to="/" className="home-link">
                    <img src={ramen} alt="Logo" />
                </Link>

                <Link to="/" className="home-link">
                    <h1>Hannas & Erik's Recipes</h1>
                </Link>
            </div>
            {!isAuthenticated && <img src={login} alt="" aria-hidden="true" onClick={showLoginModal} className='icon'/>}
            {isAuthenticated && 
                <div className='section'>
                    <Link to="/add-recipe">
                        <img src={addRecipe} alt="Add Recipe" className='icon'/>
                    </Link>
                    <button type="button" className="account-menu-button" aria-label="User menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
                        <img src={account} alt="" className='icon'/>
                    </button>
                    { menuOpen && <Menu onLogout={onLogout} /> }
                </div>
                }
        </header>
        )
};

export default Header;
