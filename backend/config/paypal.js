const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// Configure environment and client
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('PayPal credentials missing:', {
      clientId: clientId ? 'Present' : 'Missing',
      clientSecret: clientSecret ? 'Present' : 'Missing'
    });
    throw new Error('PayPal credentials are not configured');
  }

  console.log('Initializing PayPal environment with credentials:', {
    clientId: clientId ? 'Present' : 'Missing',
    clientSecret: clientSecret ? 'Present' : 'Missing'
  });

  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  try {
    const client = new checkoutNodeJssdk.core.PayPalHttpClient(environment());
    console.log('PayPal client initialized successfully');
    return client;
  } catch (error) {
    console.error('Error initializing PayPal client:', error);
    throw error;
  }
}

module.exports = { client }; 