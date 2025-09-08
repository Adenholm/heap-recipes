import React from 'react';
import './Header.css';

import serving from '../../assets/images/serving.svg';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
    <header className='page-header'>
        <Link to="/" className="home-link">
            <img src={serving} alt="Logo" />
        </Link>

        <Link to="/" className="home-link">
            <h1>Hannas & Erik's Recipes</h1>
        </Link>
    </header>
    )
};

export default Header;