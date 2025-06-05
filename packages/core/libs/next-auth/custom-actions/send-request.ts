import { BRANDING_LOGO_URL, BRANDING_NAME } from '@repo/shared/const/branding';
import type { EmailConfig } from 'next-auth/providers';

interface Theme {
  brandColor?: string;
  buttonText?: string;
  logoUrl?: string;
  companyName?: string;
}

interface SendVerificationParams {
  identifier: string;
  provider: EmailConfig;
  url: string;
  theme: Theme;
}

export async function sendVerificationRequest(params: SendVerificationParams) {
  const { identifier: to, provider, url, theme } = params;
  const { host } = new URL(url);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: provider.from,
      to,
      subject: `Secure sign-in to ${theme.companyName || BRANDING_NAME}`,
      html: generateHtml({ url, host, theme, identifier: to }),
      text: generateText({ url, host, theme }),
    }),
  });

  if (!res.ok) {
    const errorBody = await res.json();
    throw new Error(`Email delivery failed: ${JSON.stringify(errorBody)}`);
  }
}

function generateHtml(params: {
  url: string;
  host: string;
  theme: Theme;
  identifier: string;
}) {
  const { url, host, theme } = params;
  const escapedHost = host.replace(/\./g, '&#8203;.');
  const companyName = theme.companyName || BRANDING_NAME;
  const brandColor = theme.brandColor || '#2563eb';
  const logoUrl = theme.logoUrl || BRANDING_LOGO_URL;

  const colors = {
    background: '#f8fafc',
    cardBackground: '#ffffff',
    text: '#334155',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    border: '#e2e8f0',
    brandPrimary: brandColor,
    brandSecondary: adjustBrightness(brandColor, -10),
    buttonText: theme.buttonText || '#ffffff',
    success: '#10b981',
    headerGradient: `linear-gradient(135deg, ${brandColor} 0%, ${adjustBrightness(brandColor, 15)} 100%)`,
  };

  return `
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>Secure Sign-in - ${companyName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset & Base Styles */
    * { box-sizing: border-box; }
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    /* Main Styles */
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: ${colors.background};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${colors.text};
    }
    
    .email-wrapper {
      background-color: ${colors.background};
      padding: 40px 20px;
      min-height: 100vh;
    }
    
    .email-container {
      background-color: ${colors.cardBackground};
      max-width: 600px;
      margin: 0 auto;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid ${colors.border};
    }
    
    .email-header {
      background: ${colors.headerGradient};
      padding: 32px 40px;
      text-align: center;
      position: relative;
    }
    
    .email-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #f59e0b);
    }
    
    .logo-container {
      margin-bottom: 16px;
    }
    
    .logo {
      max-width: 120px;
      height: auto;
      display: inline-block;
    }
    
    .company-name {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }
    
    .email-body {
      padding: 48px 40px;
    }
    
    .welcome-text {
      font-size: 24px;
      font-weight: 600;
      color: ${colors.text};
      margin: 0 0 16px 0;
      text-align: center;
      line-height: 1.3;
    }
    
    .description {
      font-size: 16px;
      color: ${colors.textSecondary};
      margin: 0 0 32px 0;
      text-align: center;
      line-height: 1.5;
    }
    
    .cta-container {
      text-align: center;
      margin: 40px 0;
    }
    
    .cta-button {
      display: inline-block;
      background: ${colors.brandPrimary};
      color: ${colors.buttonText} !important;
      padding: 16px 32px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      border: none;
      letter-spacing: 0.5px;
    }
    
    .cta-button:hover {
      background: ${colors.brandSecondary};
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }
    
    .security-info {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #0ea5e9;
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
    }
    
    .security-title {
      display: flex;
      align-items: center;
      font-weight: 600;
      color: #075985;
      margin-bottom: 8px;
      font-size: 16px;
    }
    
    .security-icon {
      margin-right: 8px;
      font-size: 18px;
    }
    
    .security-text {
      color: #0c4a6e;
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${colors.border}, transparent);
      margin: 32px 0;
    }
    
    .alternative-text {
      font-size: 14px;
      color: ${colors.textMuted};
      text-align: center;
      margin: 24px 0;
      line-height: 1.5;
    }
    
    .link-fallback {
      background: ${colors.background};
      border: 1px solid ${colors.border};
      border-radius: 8px;
      padding: 16px;
      word-break: break-all;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
      font-size: 13px;
      color: ${colors.textSecondary};
      margin: 16px 0;
    }
    
    .email-footer {
      background: ${colors.background};
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid ${colors.border};
    }
    
    .footer-text {
      font-size: 13px;
      color: ${colors.textMuted};
      margin: 0 0 8px 0;
      line-height: 1.4;
    }
    
    .footer-links {
      margin: 16px 0 0 0;
    }
    
    .footer-link {
      color: ${colors.brandPrimary};
      text-decoration: none;
      font-size: 13px;
      margin: 0 12px;
    }
    
    .footer-link:hover {
      text-decoration: underline;
    }
    
    /* Responsive Design */
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 20px 16px; }
      .email-header, .email-body, .email-footer { padding: 24px; }
      .welcome-text { font-size: 20px; }
      .company-name { font-size: 24px; }
      .cta-button { padding: 14px 24px; font-size: 15px; }
      .link-fallback { font-size: 12px; }
    }
    
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-container { border-color: #374151; }
      .security-info { 
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border-color: #3b82f6;
      }
      .security-title { color: #60a5fa; }
      .security-text { color: #93c5fd; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <div class="logo-container">
          ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="logo">` : ''}
        </div>
        <h1 class="company-name">${companyName}</h1>
      </div>
      
      <div class="email-body">
        <h2 class="welcome-text">Secure Sign-in Request</h2>
        <p class="description">
          We received a request to sign you into your ${companyName} account. 
          Click the button below to complete your secure authentication.
        </p>
        
        <div class="cta-container">
          <a href="${url}" class="cta-button" target="_blank" rel="noopener noreferrer">
            🔐 Sign In Securely
          </a>
        </div>
        
        <div class="security-info">
          <div class="security-title">
            <span class="security-icon">🛡️</span>
            Security Notice
          </div>
          <p class="security-text">
            This link will expire in 24 hours for your security. If you didn't request this sign-in, 
            please ignore this email and consider updating your account password.
          </p>
        </div>
 
      </div>
      
      <div class="email-footer">
        <p class="footer-text">
          This email was sent to <strong>${params.identifier}</strong> from ${escapedHost}
        </p>
        <p class="footer-text">
          © ${new Date().getFullYear()} ${companyName}. All rights reserved.
        </p>
        <div class="footer-links">
          <a href="#" class="footer-link">Privacy Policy</a>
          <a href="#" class="footer-link">Terms of Service</a>
          <a href="#" class="footer-link">Support</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateText(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params;
  const companyName = theme.companyName || BRANDING_NAME;

  return `
🔐 Secure Sign-in to ${companyName}

Hello,

We received a request to sign you into your ${companyName} account.

Click this link to sign in securely:
${url}

🛡️ Security Information:
- This link will expire in 24 hours
- If you didn't request this, please ignore this email
- Never share this link with others

If the link doesn't work, copy and paste it into your browser.

---
© ${new Date().getFullYear()} ${companyName}
${host}

If you have questions, please contact our support team.
  `.trim();
}

// Utility function to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
  const num = Number.parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}
