import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';

function Header() {
    const location = useLocation();
    const refresh = () => {
        window.location.reload();
    };

    const getPageTitle = () => {
        switch (location.pathname) {
            case '/':
                return (
                    <>
                        <span className="title-main">Cardiovascular Diseases: Global</span>
                        <span className="title-highlight"></span>
                    </>
                );
            case '/uk':
                return (
                    <>
                        <span className="title-main">Cardiovascular Diseases: UK</span>
                        <span className="title-highlight"></span>
                    </>
                );
            case '/usa':
                return (
                    <>
                        <span className="title-main">Cardiovascular Diseases: USA</span>
                        <span className="title-highlight"></span>
                    </>
                );
            case '/about':
                return <span className="title-single">About</span>;
            default:
                return <span className="title-single">CardioVascularView</span>;
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
                            <NavLink to="/" className="menu-link" activeClassName="active">
                                World Map
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/uk" className="menu-link" activeClassName="active">
                                UK Map
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/usa" className="menu-link" activeClassName="active">
                                USA Map
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/about" className="menu-link" activeClassName="active">
                                About
                            </NavLink>
                        </li>
                        <li className="menu-item">
                            <NavLink to="/contact" className="menu-link" activeClassName="active">
                                Contact
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;