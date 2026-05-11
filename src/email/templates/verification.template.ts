export function getVerificationEmailTemplate(
  name: string,
  otp: string,
): { subject: string; html: string } {
  return {
    subject: 'Verify your Open Sauce account',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
    .header { background: #ff6b6b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 5px 5px; }
    .otp-box { background: #f0f0f0; border: 2px solid #ff6b6b; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px; }
    .otp-code { font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 5px; font-family: monospace; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
    .warning { color: #ff6b6b; font-size: 12px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Open Sauce!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${name}</strong>,</p>
      <p>Thank you for signing up! To complete your registration, please verify your email address by entering the code below:</p>
      
      <div class="otp-box">
        <p style="margin: 0; color: #888; font-size: 14px;">Your verification code</p>
        <div class="otp-code">${otp}</div>
      </div>
      
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you didn't create this account, please ignore this email.</p>
      
      <div class="warning">
        <p>Never share this code with anyone. Open Sauce staff will never ask for your code.</p>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 Open Sauce. All rights reserved.</p>
      <p>This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
    `,
  };
}
