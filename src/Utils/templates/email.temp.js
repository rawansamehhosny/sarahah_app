export const welcomeOtpTemplate = (firstName, otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .email-container { max-width: 500px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eef2f5; overflow: hidden; }
            .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 40px 30px; text-align: center; color: #334155; line-height: 1.6; }
            .welcome-text { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #1e293b; }
            .sub-text { font-size: 14px; color: #64748b; margin-bottom: 25px; }
            
            /* ستايل الـ تيبول والـ بوكس الحقيقي */
            .otp-table { margin: 20px auto; border-collapse: collapse; }
            .otp-box { 
                background-color: #f1f5f9; 
                border: 2px dashed #cbd5e1; 
                border-radius: 8px; 
                padding: 15px 40px; 
                font-size: 34px; 
                font-weight: 700; 
                color: #4f46e5; 
                font-family: 'Courier New', Courier, monospace; /* خط مونو عشان يدي مساحة طبيعية بين الأرقام من غير ما يضرب */
            }
            
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Sarahah App 🔐</h1>
            </div>
            <div class="content">
                <div class="welcome-text">Welcome, ${firstName}!</div>
                <div class="sub-text">Thank you for registering. Use the secure OTP code below to verify your account. It will expire in 5 minutes.</div>
                
                <table class="otp-table" align="center" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                        <td class="otp-box" align="center" valign="middle">
                            ${otp}
                        </td>
                    </tr>
                </table>
                
                <div class="sub-text" style="margin-bottom: 0; margin-top: 25px;">If you didn't request this email, you can safely ignore it.</div>
            </div>
            <div class="footer">
                &copy; 2026 Sarahah App. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};