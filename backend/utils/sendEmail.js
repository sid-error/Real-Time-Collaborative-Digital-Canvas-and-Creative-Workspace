const { Resend } = require('resend');

const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is missing in environment variables.");
    throw new Error("Missing RESEND_API_KEY");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // If you have verified haridevp.dev, use: 'noreply@haridevp.dev'
  // If not verified yet, use Resend's testing email: 'onboarding@resend.dev'
  // Note: 'onboarding@resend.dev' only sends to the email you signed up with!
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  console.log(`Attempting to send email via Resend to: ${options.email}`);

  try {
    const { data, error } = await resend.emails.send({
      from: `Collaborative Canvas <${fromEmail}>`,
      to: [options.email],
      subject: options.subject,
      html: `
        <div style="font-family: sans-serif; text-align: center;">
          <h2>Action Required</h2>
          <p>Please click the button below:</p>
          <a href="${options.verificationUrl || options.resetUrl}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirm</a>
          <p>Or copy this link: ${options.verificationUrl || options.resetUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully via Resend. ID:", data.id);
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

module.exports = sendEmail;