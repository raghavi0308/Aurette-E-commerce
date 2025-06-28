import React from 'react';

const TrustBanner = () => {
  return (
    <div style={styles.container}>
      <div style={styles.item}>
      <i className="fa-solid fa-shield-heart" style={styles.icon}></i>
        <p style={styles.text}>Secure & Trusted Checkout</p>
      </div>
      <div style={styles.item}>
      <i className="fa-solid fa-tags" style={styles.icon}></i>
        <p style={styles.text}>Personalised Customer Service</p>
      </div>
      <div style={styles.item}>
      <i className="fa-solid fa-trophy" style={styles.icon}></i>
        <p style={styles.text}>100% Satisfaction Guaranteed</p>
      </div>
      <div style={styles.item}>
      <i className="fa-brands fa-envira" style={styles.icon}></i>
        <p style={styles.text}>Environment Conscious</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-around',
    backgroundColor: '#6d4c41', // Brown color
    padding: '0px 10px',
    // marginBottom: '40px',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  item: {
    color: '#fff',
    margin: '10px 20px',
    maxWidth: '390px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    // backgroundColor: 'black',
    padding: '10px',
    borderRadius: '10px',
  },
  icon: {
    fontSize: '25px',
    marginBottom: 0,
  },
  text: {
    fontSize: '15px',
    margin: 0,
    fontFamily: 'Futura, sans-serif',
    textTransform: 'uppercase',
  },
};

export default TrustBanner;
