const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // 1) Create a transporter
  const isRealEmailConfigured = 
    process.env.EMAIL_USERNAME && 
    process.env.EMAIL_USERNAME !== 'your-email@gmail.com' &&
    process.env.EMAIL_USERNAME.trim() !== '';

  if (isRealEmailConfigured) {
    // Real SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log(`📧 Sending real email to: ${options.email}`);
  } else {
    // 🟢 ALTERNATIVE: Zero-config for development/demo (Ethereal Email)
    console.log('🔄 Creating temporary Ethereal account (Zero-Config Mode)...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal account ready');
  }

  // 2) Define the email options
  const mailOptions = {
    from: 'CampusEventHub <noreply@campuseventhub.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // 3) Actually send the email
  try {
    console.log(`📤 Attempting to send email via ${isRealEmailConfigured ? 'Real SMTP' : 'Ethereal Test Account'}...`);
    const info = await transporter.sendMail(mailOptions);
    
    // If using Ethereal, log the preview URL prominently
    if (!isRealEmailConfigured && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('\n' + '⭐'.repeat(30));
      console.log('📬 [ETHEREAL EMAIL PREVIEW]');
      console.log(`🔗 URL: ${previewUrl}`);
      console.log('⭐'.repeat(30) + '\n');
      
      // Also attach it to the return object for the controller to use
      return { ...info, previewUrl };
    } else {
      console.log('✅ Real email delivered successfully!');
      return { ...info, previewUrl: null };
    }
  } catch (err) {
    console.error('❌ Email sending failed. Error Details:', err.message);
    throw err;
  }
};

module.exports = sendEmail;
