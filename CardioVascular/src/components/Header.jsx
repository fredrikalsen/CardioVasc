import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

function Header() {
    const location = useLocation();
    const refresh = () => {
        window.location.reload();
    };

    const getPageTitle = () => {
        switch(location.pathname) {
            case '/':
                return 'Prevalence Rate of Cardiovascular Diseases Global';
            case '/uk':
                return 'Prevalence Rate of Cardiovascular Diseases in the UK';
            case '/usa':
                return 'Prevalence Rate of Cardiovascular Diseases in the USA';
            case '/about':
                return 'About';
            default:
                return 'CardioVascularView';
        }
    };

    return (
        <header className="header">
            <div className="logo-container">
                <button className="logo-text" type="button" onClick={refresh}>
                    CardioVascularView
                </button>
            </div>
            
            <div className="title-container">
                <h2 className="main-title">
                    {getPageTitle()}
                </h2>
            </div>

            <div className="menu-container">
                <nav className="menu">
                    <ul className="menu-list">
                        <li className="menu-item">
                            <NavLink to="/" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                World Map
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/uk" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                UK Map
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/usa" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                USA Map
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/about" className={({ isActive }) => isActive ? "menu-link active" : "menu-link"}>
                                About
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
