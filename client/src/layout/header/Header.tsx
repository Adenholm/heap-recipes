import { useContext, useState } from 'react';
import '@/layout/header/Header.css';

import ramen from '@/assets/images/ramen.svg';
import login from '@/assets/images/login.svg';
import account from '@/assets/images/account.svg';
import group from '@/assets/images/group.svg';
import addRecipe from '@/assets/images/add-recipe.svg';
import tagIcon from '@/assets/images/tag.svg';
import logout from '@/assets/images/logout.svg';
import { Link } from 'react-router-dom';
import { ModalContext } from '@/context/modal';
import LoginModal from '@/components/loginModal/Login';
import { AuthContext } from '@/context/auth';

const Header = () => {
    const { openModal, setModal } = useContext(ModalContext);
    const { isAuthenticated, user, onLogout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

    const showLoginModal = () => {
        setMenuOpen(false);
        setModal('Login', <LoginModal/>);
        openModal();
    };

    const Menu = ({ onLogout, isAdmin }: { onLogout: () => void; isAdmin: boolean }) => {
    return (
        <nav className='menu'>
            <ul>
                {isAdmin && <li onClick={() => setMenuOpen(false)}><Link to="/manage-users">
                <img src={group} alt="Manage Users" className='icon'/>
                Manage users
                </Link></li>}
                {isAdmin && <li className="menu-divider-item"><hr className="menu-divider" /></li>}
                <li onClick={() => setMenuOpen(false)}><Link to="/edit-tags">
                <img src={tagIcon} alt="Edit Tags" className='icon'/>
                Edit tags
                </Link></li>
                <li className="menu-divider-item"><hr className="menu-divider" /></li>
                <li onClick={onLogout}><img src={logout} alt="Log Out" className='icon'/>Log out</li>
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
                    <img src={account} alt="" aria-hidden="true" className='icon' onClick={ () => setMenuOpen(!menuOpen) }/>
                    { menuOpen && <Menu onLogout={onLogout} isAdmin={user?.role === 'Admin'} /> }
                </div>
                }
        </header>
        )
};

export default Header;
