import { useContext, useState } from 'react';
import './Header.css';

import ramen from '../../assets/images/ramen.svg';
import login from '../../assets/images/login.svg';
import account from '../../assets/images/account.svg';
import addRecipe from '../../assets/images/add-recipe.svg';
import { Link } from 'react-router-dom';
import { ModalContext } from '../../context/modal';
import LoginModal from '../../components/loginModal/Login';
import { AuthContext } from '../../context/auth';

const Header = () => {
    const { openModal, setModal } = useContext(ModalContext);
    const { isAuthenticated, onLogout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);

    const showLoginModal = () => {
        setModal('Login', <LoginModal/>);
        openModal();
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
                    { menuOpen && <Menu onLogout={onLogout} /> }
                </div>
                }
        </header>
        )
};

export default Header;



const Menu = ({ onLogout }: { onLogout: () => void }) => {
    return (
        <nav className='menu'>
            <ul>
                <li><Link to="/edit-tags">Edit tags</Link></li>
                <li><hr className="menu-divider" /></li>
                <li onClick={onLogout}>Log out</li>
            </ul>
        </nav>
    );
};