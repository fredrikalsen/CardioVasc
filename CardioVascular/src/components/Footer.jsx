import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Footer.css"; // Import CSS for styling

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Image Link */}
                <img src="/JGU end.PNG" alt="JGU Logo" className="footer-logo" />

                {/* Text Section */}
                <div className="footer-text">
                    The project was funded by the Federal Ministry for Education and Research (BMBF) with the grant number <strong>03ZU120212</strong>.
                </div>

                {/* Contact Button */}
                <NavLink to="/contact" className="footer-button">
                    Contact us
                </NavLink>
            </div>
        </footer>
    );
};

export default Footer;
