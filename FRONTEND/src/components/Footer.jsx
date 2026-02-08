import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      

       <div className="footer-bottom">
          <div className="social-links">
              <a href="https://github.com/shivam-G05" target="_blank" rel="noopener noreferrer" className="social-link">
                GitHub
              </a>
              <a href="https://x.com/shivamgoel72747" target="_blank" rel="noopener noreferrer" className="social-link">
                Twitter
              </a>
              <a href="https://www.linkedin.com/in/shivam-goel-6236432a8/" target="_blank" rel="noopener noreferrer" className="social-link">
                LinkedIn
              </a>
            </div>
          <p>&copy; 2025 SuperNOVA Shop</p>
          <p className="footer-credit">Powered by @ shivam05dev@gmail.com</p>
        </div>   

          
        

        
     
    </footer>
  );
};

export default Footer;