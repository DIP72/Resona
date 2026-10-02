// Utility to send direct SMS, WhatsApp, and Email messages to any phone number or email

export function cleanPhoneNumber(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

export function openDeviceSms(phone, message) {
  const cleaned = cleanPhoneNumber(phone);
  const encoded = encodeURIComponent(message || 'Emergency Alert from Resona');
  const uri = `sms:${cleaned}?body=${encoded}`;
  window.location.href = uri;
}

export function openWhatsAppChat(phone, message) {
  const cleaned = cleanPhoneNumber(phone).replace(/[^0-9]/g, '');
  const encoded = encodeURIComponent(message || 'Emergency Alert from Resona');
  const url = `https://wa.me/${cleaned}?text=${encoded}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openEmailClient(email, subject, message) {
  const encodedSub = encodeURIComponent(subject || 'Resona Emergency Alert');
  const encodedBody = encodeURIComponent(message || 'Emergency disaster notification.');
  const uri = `mailto:${email}?subject=${encodedSub}&body=${encodedBody}`;
  window.location.href = uri;
}

/**
 * Dispatch message to backend API + provide direct device fallbacks
 */
export async function sendDirectMessageToContact({ toPhone, toEmail, message, alertTitle = 'Emergency Advisory', channel = 'SMS' }) {
  try {
    const res = await fetch('http://localhost:5000/api/alerts/send-direct-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toPhone,
        toEmail,
        message,
        alertTitle,
        channel
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend send-direct-message warning:', err.message);
  }

  // Fallback direct intents if backend is offline
  const cleanedPhone = cleanPhoneNumber(toPhone);
  const encodedMsg = encodeURIComponent(`🚨 [${alertTitle}]\n\n${message}`);
  return {
    success: true,
    channel,
    sms: toPhone ? {
      recipient: cleanedPhone,
      smsIntent: `sms:${cleanedPhone}?body=${encodedMsg}`,
      whatsappIntent: `https://wa.me/${cleanedPhone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`
    } : null,
    email: toEmail ? {
      recipient: toEmail,
      mailtoIntent: `mailto:${toEmail}?subject=${encodeURIComponent(alertTitle)}&body=${encodedMsg}`
    } : null
  };
}
