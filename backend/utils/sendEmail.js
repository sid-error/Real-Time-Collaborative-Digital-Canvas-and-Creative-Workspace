/**
 * @fileoverview Email utility using Nodemailer for sending verification and password reset emails.
 */

// Import nodemailer library for SMTP transport and email sending
const nodemailer = require('nodemailer');

/**
 * Sends an email using SMTP.
 * 
 * @async
 * @function sendEmail
 * @param {Object} options - Email options.
 * @param {string} options.email - Recipient email address.
 * @param {string} options.subject - Email subject.
 * @param {string} [options.verificationUrl] - URL for email verification.
 * @param {string} [options.resetUrl] - URL for password reset.
 * @throws {Error} If the email fails to send.
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  // Use environment variables or default to Gmail's SMTP host
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  // Use environment variables or default to common SMTP port (587)
  const smtpPort = process.env.SMTP_PORT || 587;
  // Load email user from environment variables
  const smtpUser = process.env.EMAIL_USER;
  // Load and sanitize email password (strip any inadvertent whitespace)
  const smtpPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''; 

  // Log the connection attempt details (excluding password) for server logs
  console.log(`Attempting to send email via SMTP (${smtpHost}:${smtpPort}) from: ${smtpUser} to: ${options.email}`);
  
  // Initialize the Nodemailer transporter with detailed connection settings
  const transporter = nodemailer.createTransport({
    // Set SMTP host
    host: smtpHost,
    // Set SMTP port
    port: smtpPort,
    // Use startTLS (secure: false for port 587)
    secure: false, 
    // Set connection timeout to 10 seconds
    connectionTimeout: 10000, 
    // Set socket inactivity timeout to 10 seconds
    socketTimeout: 10000, 
    // Allow legacy SSL support if needed by the provider
    tls: {
      ciphers: 'SSLv3',
    },
    // Enable internal logging for debugging
    logger: true,
    // Enable debug mode to see full communication logs
    debug: true,
    // Force IPv4 to prevent delays from IPv6 lookup failures
    socket: {
      family: 4
    },
    // Set authentication credentials
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  // Determine the target URL from provided options (prioritize verification)
  const targetUrl = options.verificationUrl || options.resetUrl;

  // Build the email object with sender, recipient, subject, and HTML body
  const mailOptions = {
    // Specify the display name and sender address
    from: `"Collaborative Canvas" <${smtpUser}>`,
    // Target recipient
    to: options.email,
    // Subject line
    subject: options.subject,
    // Use a basic HTML template for the message body
    html: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Action Required</h2>
        <p>Please click the button below:</p>
        <a href="${targetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm</a>
        <p>Or copy this link: ${targetUrl}</p>
      </div>
    `,
  };

  try {
    // Attempt to send the email using the configured transporter
    const info = await transporter.sendMail(mailOptions);
    // Log the successful message ID returned by the SMTP server
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    // Log full error details if email delivery fails
    console.error("Error sending email:", error);
    // Re-throw the error to allow the calling function to handle it
    throw error; 
  }
};

// Export the sendEmail function for use in controllers (e.g., auth controller)
module.exports = sendEmail;

