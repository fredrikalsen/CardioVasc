// Contact.js
import React from "react";
import '../styles/Contact.css';
import Header from '../components/Header';

function Contact() {
  return (
    <>
      <Header />
      <div className="box-container">
        <section className="contact-container">
          <h2>Contact Us</h2>
          <h3>Get in Touch</h3>
          
          <div className="contact-info">
            <p>
              Data Mining<br />
              Johannes Gutenberg University<br />
              Staudingerweg 9, 55128 Mainz, Germany
            </p>
          </div>

          <div className="contact-info">
            <p>
              <a href="mailto:hlane@uni-mainz.de">
                hlane@uni-mainz.de
              </a>
            </p>
          </div>

          <div className="contact-info">
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
