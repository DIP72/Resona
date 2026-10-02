const nodemailer = require('nodemailer');

let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  console.warn('Twilio initialization note:', e.message);
}

// Clean phone number helper (removes spaces, dashes, parentheses)
function normalizePhone(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  // Default to Indian country code +91 if 10-digit number
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Send SMS to a single phone number via Twilio, Fast2SMS, or device dispatch
 */
async function sendSMS({ to, message, alertTitle = 'Emergency Alert' }) {
  const normalized = normalizePhone(to);
  const result = {
    recipient: normalized,
    channel: 'SMS',
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    provider: 'None',
    details: ''
  };

  // 1. Try Twilio if configured
  if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const resp = await twilioClient.messages.create({
        body: `🚨 [RESONA ALERT: ${alertTitle}]\n${message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: normalized
      });
      result.status = 'DELIVERED';
      result.isLiveCarrier = true;
      result.provider = 'Twilio SMS Gateway';
      result.messageSid = resp.sid;
      result.details = `Delivered to ${normalized} via Twilio telecom network (SID: ${resp.sid})`;
      return result;
    } catch (err) {
      console.warn(`Twilio dispatch error for ${normalized}:`, err.message);
      result.details = `Twilio attempt failed: ${err.message}`;
    }
  }

  // 2. Try Fast2SMS (popular Indian emergency SMS gateway) if API key present
  if (process.env.FAST2SMS_API_KEY && process.env.FAST2SMS_API_KEY.trim()) {
    try {
      const rawNumber = normalized.replace(/[^0-9]/g, '').slice(-10);
      const url = 'https://www.fast2sms.com/dev/bulkV2';
      const cleanMsg = `🚨 [RESONA: ${alertTitle}] ${message}`.slice(0, 160);
      const r = await fetch(url, {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'q',
          message: cleanMsg,
          language: 'english',
          flash: 0,
          numbers: rawNumber
        })
      });
      const data = await r.json();
      if (data.return) {
        result.status = 'DELIVERED';
        result.isLiveCarrier = true;
        result.provider = 'Fast2SMS Indian Telecom Gateway';
        result.details = `SMS delivered over cellular network to ${normalized} via Fast2SMS carrier (ReqID: ${data.request_id || 'OK'})`;
        return result;
      } else {
        const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : (data.message || 'Carrier rejected request');
        console.warn('Fast2SMS returned error:', errorMsg);
        result.details = `Fast2SMS response: ${errorMsg}`;
      }
    } catch (err) {
      console.warn('Fast2SMS dispatch error:', err.message);
      result.details = `Fast2SMS connection error: ${err.message}`;
    }
  }

  // 3. Fallback: Local Direct Device Link & WhatsApp Bridge (No paid gateway in .env)
  // Generates clean SMS & WhatsApp direct intent URIs for the frontend & OS
  const cleanDigits = normalized.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(`🚨 [RESONA EMERGENCY ALERT: ${alertTitle}]\n\n${message}`);
  
  result.status = 'GATEWAY_REQUIRED';
  result.isLiveCarrier = false;
  result.gatewayConfigured = Boolean(process.env.FAST2SMS_API_KEY || (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_PHONE_NUMBER));
  result.provider = 'Direct Intent & WhatsApp Bridge';
  result.smsIntent = `sms:${normalized}?body=${encodedMsg}`;
  result.whatsappIntent = `https://wa.me/${cleanDigits}?text=${encodedMsg}`;
  result.details = result.gatewayConfigured 
    ? (result.details || `SMS gateway connection failed for ${normalized}. Use WhatsApp button to send directly.`)
    : `No SMS Gateway configured in Backend/.env (Add FAST2SMS_API_KEY or Twilio to send automated cellular SMS). WhatsApp and device link ready.`;
  return result;
}

/**
 * Send Email notification via Nodemailer (SMTP, Gmail, or Ethereal test)
 */
async function sendEmail({ to, subject, message, alertTitle = 'Emergency Advisory' }) {
  const result = {
    recipient: to,
    channel: 'EMAIL',
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    provider: 'None',
    details: ''
  };

  try {
    let transporter = null;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASS
        }
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; background: #060b19; color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #ff0055;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
          <h2 style="color: #ff0055; margin: 0; font-size: 20px;">🚨 RESONACARE: EMERGENCY DISASTER BROADCAST</h2>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px 0;">Official Vernacular Early Warning System Notification</p>
        <div style="background: #0d1733; padding: 16px; border-radius: 8px; border-left: 4px solid #00f2fe; margin-bottom: 20px;">
          <h3 style="color: #38bdf8; margin: 0 0 8px 0; font-size: 16px;">${alertTitle}</h3>
          <p style="color: #e2e8f0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message}</p>
        </div>
        <div style="font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 12px;">
          <span>Issued via National Disaster Management Architecture & Odisha SDMA Command.</span><br/>
          <span>Do not reply to this automated broadcast. Dial 1070 for immediate rescue dispatch.</span>
        </div>
      </div>
    `;

    if (transporter) {
      const info = await transporter.sendMail({
        from: `"Resona Emergency Command" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'alerts@resona.gov.in'}>`,
        to,
        subject: `🚨 [RESONA EMERGENCY] ${subject || alertTitle}`,
        text: message,
        html: htmlContent
      });
      result.status = 'DELIVERED';
      result.isLiveCarrier = true;
      result.provider = process.env.GMAIL_USER ? 'Gmail SMTP Relay' : 'SMTP Email Gateway';
      result.messageId = info.messageId;
      result.details = `Email sent directly via SMTP to ${to} (MessageId: ${info.messageId})`;
      return result;
    }

    // Direct mailto link & Gmail Web Compose fallback
    const encodedSubject = encodeURIComponent(`🚨 [RESONA EMERGENCY] ${subject || alertTitle}`);
    const encodedBody = encodeURIComponent(message);
    result.status = 'TRANSMITTED_READY';
    result.isLiveCarrier = false;
    result.provider = 'Webmail & Mailto Bridge';
    result.mailtoIntent = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
    result.gmailIntent = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodedSubject}&body=${encodedBody}`;
    result.details = `Emergency email queued for ${to}. 1-click Gmail & OS Mail client ready.`;
    return result;

  } catch (err) {
    console.warn('Email dispatch error:', err.message);
    result.status = 'FAILED';
    result.details = err.message;
    return result;
  }
}

module.exports = {
  sendSMS,
  sendEmail,
  normalizePhone
};
