require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send customization confirmation email
const sendCustomizationConfirmation = async (customerEmail, customerName) => {
  try {
    console.log('Attempting to send email to:', customerEmail);
    console.log('Using email config:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '****' : 'not set'
    });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration is missing. Please check your .env file.');
    }

    const mailOptions = {
      from: `"Aurette Customization" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: 'Thank You for Your Customization Request - Aurette',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Thank You!</h1>
            <p style="color: #666; font-size: 18px;">Your customization request has been received</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="color: #333; font-size: 16px;">Dear ${customerName},</p>
            <p style="color: #666; line-height: 1.6;">We have received your customization request and our team is excited to work on your unique design. Your request is now being processed, and one of our team members will reach out to you shortly to discuss the details and next steps.</p>
          </div>

          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px; margin-bottom: 30px;">
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Our team will review your request</li>
              <li>A team member will contact you within 24-48 hours</li>
              <li>We'll discuss your requirements in detail</li>
              <li>We'll provide you with a timeline and quote</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; margin-bottom: 10px;">If you have any questions, please don't hesitate to contact us:</p>
            <p style="color: #333; font-weight: bold;">Email: ${process.env.EMAIL_USER}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 14px;">
            <p>Best regards,</p>
            <p style="font-weight: bold; color: #333;">The Aurette Team</p>
          </div>
        </div>
      `
    };

    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendCustomizationConfirmation
}; 