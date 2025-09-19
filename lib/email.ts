import nodemailer from "nodemailer";

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email options interface
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Create transporter using environment variables
const createTransporter = () => {
  const config: EmailConfig = {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASS || "",
    },
  };

  return nodemailer.createTransport(config);
};

// Send email function
export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Send user invitation email
export const sendUserInvitationEmail = async (
  userEmail: string,
  userName: string,
  setupToken: string
) => {
  const subject = "Welcome to DSR - Complete Your Account Setup";
  const setupLink = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/setup-password?token=${setupToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to DSR</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #2563eb;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
            }
            .content {
                background-color: #f8fafc;
                padding: 30px;
                border: 1px solid #e2e8f0;
            }
            .button {
                display: inline-block;
                background-color: #2563eb !important;
                color: #ffffff !important;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
                font-weight: bold;
                border: none;
                font-size: 16px;
            }
            .button:hover {
                background-color: #1d4ed8 !important;
                color: #ffffff !important;
            }
            .button:visited {
                color: #ffffff !important;
            }
            .footer {
                background-color: #64748b;
                color: white;
                padding: 15px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                font-size: 14px;
            }
            .info-box {
                background-color: #e0f2fe;
                border: 1px solid #0284c7;
                padding: 15px;
                margin: 20px 0;
                border-radius: 6px;
            }
            .warning {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 6px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to DSR System</h1>
        </div>
        
        <div class="content">
            <h2>Hello ${userName}!</h2>
            
            <p>Your account has been created successfully in the DSR system. To get started, you need to set up your password.</p>
            
            <div class="info-box">
                <strong>📧 Email:</strong> ${userEmail}<br>
                <strong>🔐 Password:</strong> You will set this up in the next step
            </div>
            
            <p>Click the button below to complete your account setup:</p>
            <a href="${setupLink}" class="button" style="display: inline-block; background-color: #2563eb !important; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; border: none; font-size: 16px;">Complete Setup</a>
            
            <p>Or copy and paste this link into your browser:<br>
            <a href="${setupLink}">${setupLink}</a></p>
            
            <div class="warning">
                <strong>⏰ Important:</strong> This setup link will expire in 24 hours for security reasons. Please complete your setup soon.
            </div>
            
            <p>If you have any questions or need assistance, please contact the system administrator.</p>
            
            <p>Best regards,<br>
            DSR System Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
  `;

  const textContent = `
    Welcome to DSR System!
    
    Hello ${userName}!
    
    Your account has been created successfully in the DSR system. To get started, you need to set up your password.
    
    Email: ${userEmail}
    Password: You will set this up in the next step
    
    Complete your account setup by visiting: ${setupLink}
    
    Important: This setup link will expire in 24 hours for security reasons.
    
    If you have any questions or need assistance, please contact the system administrator.
    
    Best regards,
    DSR System Team
    
    This is an automated message. Please do not reply to this email.
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    text: textContent,
    html: htmlContent,
  });
};
