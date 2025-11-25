const nodemailer = require('nodemailer');

// Create transporter - configure based on your email service
// For Gmail, you'll need to use an App Password
// For other services, adjust the configuration accordingly
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD // Your email password or app password
    }
  });
};

// Send Student ID email
const sendStudentIdEmail = async (email, name, studentId) => {
  try {
    // If email credentials are not configured, log and return
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email service not configured. Student ID:', studentId);
      console.log('To enable email, set EMAIL_USER and EMAIL_PASSWORD in .env file');
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"Eventra" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Eventra - Your Student ID',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 5px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
            }
            .student-id {
              background-color: white;
              padding: 15px;
              border: 2px solid #4F46E5;
              border-radius: 5px;
              text-align: center;
              margin: 20px 0;
              font-size: 24px;
              font-weight: bold;
              color: #4F46E5;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Eventra!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              <p>Thank you for registering with Eventra. Your registration has been successful!</p>
              <p>Your Student ID is:</p>
              <div class="student-id">${studentId}</div>
              <p>Please save this Student ID for future reference. You will need it to enroll in events and access your account.</p>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Best regards,<br>The Eventra Team</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Eventra!
        
        Dear ${name},
        
        Thank you for registering with Eventra. Your registration has been successful!
        
        Your Student ID is: ${studentId}
        
        Please save this Student ID for future reference. You will need it to enroll in events and access your account.
        
        If you have any questions, please don't hesitate to contact us.
        
        Best regards,
        The Eventra Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendStudentIdEmail
};



