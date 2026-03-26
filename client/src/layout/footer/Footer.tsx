import React from 'react';
import './Footer.css';

import githubLogo from '../../assets/images/github.svg';

const Footer = () => {
    return (
        <footer className="page-footer">
            <p>© 2025 <a href="https://github.com/adenholm">Hanna</a>s & <a href="https://github.com/erikpersson0884">Erik</a>s Recept</p>
            
            <a className="github-link" href="github.com/Adenholm/heap-recipes">
                <img src={githubLogo} alt="GitHub Logo" height={35} />
            </a>
        </footer>
    );
}

export default Footer;