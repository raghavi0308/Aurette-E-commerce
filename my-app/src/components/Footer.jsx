import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const handleShopClick = () => {
    navigate('/shop');
  };

  const handleContactClick = () => {
    window.location.href = 'mailto:support@Aurette.in';
  };

  const handleAboutClick = () => {
    navigate('/#about');
  };

  const handleTrackOrderClick = () => {
    navigate('/orders');
  };

  const handleMyAccountClick = () => {
    navigate('/profile');
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.columns}>
        {/* Quick Links */}
        <div style={styles.column}>
          <h4 style={{ ...styles.heading, paddingLeft: '0px' }}>QUICK LINKS</h4>
          <ul className='list'>
            <li onClick={handleShopClick}>Shop</li>
            <li onClick={handleContactClick}>Contact Us</li>
            <li onClick={handleAboutClick}>About Us</li>
          </ul>
        </div>

        {/* Information */}
        <div style={styles.column}>
          <h4 style={{ ...styles.heading, paddingLeft: '0px' }}>INFORMATION</h4>
          <ul className='list'>
            <li onClick={handleTrackOrderClick}>Track My Order</li>
            <li onClick={handleMyAccountClick}>My Account</li>
            <li>Return & Exchange Policy</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Shipping And Delivery</li>
          </ul>
        </div>

        {/* Stay Connected + Contact Details */}
        <div style={{...styles.column, marginLeft:'250px'}}>
          <h4 style={styles.heading}>STAY CONNECTED</h4>
          <a 
            href="https://www.instagram.com/accounts/login/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.iconLink}
          >
            <i className="fab fa-instagram" style={styles.icon}></i>
          </a>
          <h4 style={{ ...styles.heading, marginTop: '20px',  }}>CONTACT DETAILS</h4>
          <p style={{color: '#A2A2A2', 
    textAlign: 'left',}}>Email : Support@Aurette.In</p>
          <p style={{color: '#A2A2A2', 
    textAlign: 'left',}}>Phone Number: 9930194294</p>
          <p style={{color: '#A2A2A2', 
    textAlign: 'left',}}>Address: Andheri East, Mumbai 400069</p>
        </div>
      </div>

      <hr style={styles.divider} />

      <div style={styles.bottom}>
        <p>© 2025, <span style={{ fontWeight: '600' }}>Aurette</span>.</p>
        <div style={styles.paymentIcons}>
          <a href="https://www.visa.co.in/pay-with-visa/click-to-pay-with-visa.html" target="_blank" rel="noopener noreferrer">
           <i className="fa-brands fa-cc-visa"></i>
          </a>
          <a href="https://www.mastercard.co.in/en-in.html" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-cc-mastercard" style={{color: "#ff7a7a"}}></i>
          </a>
          <a href="https://www.americanexpress.com/en-in/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-cc-amex" style={{color: "#74C0FC"}}></i>
          </a>
          <a href="https://www.apple.com/apple-pay/" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-cc-apple-pay" style={{color: "#ffffff"}}></i>
          </a>
          <a href="https://www.discover.com/" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-cc-discover" style={{color: "#FFD43B"}}></i>
          </a>
          <a href="http://paypal.com/us/home" target="_blank" rel="noopener noreferrer">
            <i className="fa-brands fa-cc-paypal" style={{color: '#74C0FC'}}></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '40px 20px 10px',
    fontFamily: 'Futura, sans-serif',
    fontSize: '16px',
    fontWeight: '100px',
    textAlign: 'center',
  },
  columns: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  column: {
    flex: '1 1 200px',
    margin: '10px 20px',
    marginLeft: '150px',
  },
  heading: {
    fontWeight: 'lighter',
    fontSize: '20px',
    textAlign: 'left',
    marginBottom: '10px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    //paddingLeft: '180px',
    lineHeight: '2',
    color: '#A2A2A2',
    fontSize: '18px',
    textAlign: 'left',
    cursor: 'pointer',
    '& li:hover': {
      color: '#fff',
      textDecoration: 'underline'
    }
  },
  iconLink: {
    color: '#fff',
    fontSize: '24px',
    textDecoration: 'none',
  },
  icon: {
    fontSize: '24px',
    marginBottom: '30px',
    marginRight: '500px',
  },
  divider: {
    borderTop: '2px solid #ffffff',
    margin: '20px 0',
    opacity: 0.3,
    width: '90%',
    marginLeft: '50px',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginLeft: '230px',
    fontSize: '15px',
  },
  
  paymentIcons: {
    display: 'flex',
    gap: '12px',
    fontSize: '27px',
    marginRight: '180px',
    cursor:'pointer'
  },
};

export default Footer;
