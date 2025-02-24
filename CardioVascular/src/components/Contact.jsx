// Contact.js
import React from "react";
import '../styles/Contact.css';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

function Contact() {
  return (
    <>
      <Header />
      <div className="box-container">
        <section className="contact-container">
          <h2>Contact Us</h2>
          <h3>Get in Touch</h3>
          
          <div className="contact-info">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <p>
              Data Mining<br />
              Johannes Gutenberg University<br />
              Staudingerweg 9, 55128 Mainz, Germany
            </p>
          </div>

          <div className="contact-info">
            <FontAwesomeIcon icon={faEnvelope} />
            <p>
              <a href="mailto:hlane@uni-mainz.de">
                hlane@uni-mainz.de
              </a>
            </p>
          </div>

          <div className="contact-info">
            <FontAwesomeIcon icon={faLinkedin} />
            <p>
              <a 
                href="https://www.linkedin.com/company/nightingale-project" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Connect on LinkedIn
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default Contact;
