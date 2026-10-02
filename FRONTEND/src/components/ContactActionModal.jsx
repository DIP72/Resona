import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  Mail, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone,
  ExternalLink,
  Sparkles,
  Radio
} from 'lucide-react';
import { sound } from '../utils/audioSynth';
import { notificationService } from '../utils/notificationService';
import { 
  cleanPhoneNumber, 
  openDeviceSms, 
  openWhatsAppChat, 
  openEmailClient, 
  sendDirectMessageToContact 
} from '../utils/directDispatch';

export default function ContactActionModal({ isOpen, onClose, contact, defaultMessage = '' }) {
  if (!isOpen || !contact) return null;

  const { name = 'Personnel', phone = '', email = '', role = 'Emergency Contact' } = contact;
  const [message, setMessage] = useState(
    defaultMessage || `🚨 [RESONA EMERGENCY ADVISORY] Cyclone warning active in coastal Odisha. Seek immediate high shelter. Helpline: 1070.`
  );
  const [isSending, setIsSending] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const handleSendSMS = async () => {
    if (!phone) return;
    setIsSending(true);
    sound.playBlip();

    const res = await sendDirectMessageToContact({
      toPhone: phone,
      message,
      alertTitle: 'Resona Emergency Alert',
      channel: 'SMS'
    });

    setIsSending(false);
    sound.playSuccessChime();
    setReceipt({
      type: 'SMS',
      recipient: phone,
      isLiveCarrier: res?.sms?.isLiveCarrier,
      gatewayConfigured: res?.sms?.gatewayConfigured,
      status: res?.sms?.status,
      details: res?.sms?.details || `Dispatched to ${phone}. Direct cellular link ready.`,
      smsIntent: res?.sms?.smsIntent || `sms:${cleanPhoneNumber(phone)}?body=${encodeURIComponent(message)}`,
      whatsappIntent: res?.sms?.whatsappIntent || `https://wa.me/${cleanPhoneNumber(phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    });

    // Also trigger system notification on screen
    notificationService.showLocalNotification(`🚨 Dispatched SMS Alert`, {
      body: `Emergency message dispatched to ${name} (${phone}).`,
    });

    // On mobile devices, launch device SMS
    if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
      openDeviceSms(phone, message);
    }
  };

  const handleSendWhatsApp = () => {
    if (!phone) return;
    sound.playSuccessChime();
    notificationService.showLocalNotification(`🚨 Dispatched WhatsApp Alert`, {
      body: `Emergency message sent to ${name} (${phone}).`,
    });
    openWhatsAppChat(phone, message);
  };

  const handleSendEmail = async () => {
    if (!email) return;
    setIsSending(true);
    sound.playBlip();

    const res = await sendDirectMessageToContact({
      toEmail: email,
      message,
      alertTitle: 'Resona Emergency Alert',
      channel: 'EMAIL'
    });

    setIsSending(false);
    sound.playSuccessChime();
    setReceipt({
      type: 'EMAIL',
      recipient: email,
      details: res?.email?.details || `Dispatched email to ${email}.`,
      mailtoIntent: res?.email?.mailtoIntent || `mailto:${email}?subject=Resona Emergency Alert&body=${encodeURIComponent(message)}`
    });

    notificationService.showLocalNotification(`🚨 Dispatched Email Alert`, {
      body: `Emergency email sent to ${name} (${email}).`,
    });

    openEmailClient(email, 'Resona Emergency Alert', message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-[#090F24] border border-white/20 shadow-2xl overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-[#0C1530] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Direct Dispatch & Messaging</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {role}
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Send emergency message to <strong className="text-white">{name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playBlip();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Contact Details Pill */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            {phone && (
              <div className="flex items-center gap-2 text-emerald-300 font-mono">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2 text-cyan-300 font-mono">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>{email}</span>
              </div>
            )}
          </div>

          {/* Delivery Receipt Confirmation */}
          {receipt && (
            <div className={`p-3.5 rounded-xl border space-y-2 animate-in fade-in ${
              receipt.isLiveCarrier
                ? 'bg-emerald-950/60 border-emerald-500/50'
                : 'bg-[#0E1A38] border-cyan-500/40'
            }`}>
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {receipt.isLiveCarrier 
                    ? 'Delivered via Cellular Telecom Gateway!' 
                    : 'Dispatch Prepared & Direct Channels Active'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                {receipt.details}
              </p>

              {!receipt.isLiveCarrier && receipt.type === 'SMS' && (
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>How to receive SMS on a physical phone:</span>
                  </div>
                  <p className="text-slate-300 text-[10px] leading-relaxed">
                    A laptop cannot transmit cellular signals without an SMS gateway. To deliver automated telecom SMS to the SIM card, add <strong>FAST2SMS_API_KEY</strong> or <strong>TWILIO</strong> in <code>Backend/.env</code>.
                  </p>
                  <p className="text-emerald-300 text-[10px] font-semibold">
                    👉 To send directly to their phone right now for FREE, click the WhatsApp button below!
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {receipt.whatsappIntent && (
                  <a
                    href={receipt.whatsappIntent}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium border border-emerald-400 flex items-center gap-1.5 shadow transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open in WhatsApp (Direct to Phone)</span>
                  </a>
                )}
                {receipt.smsIntent && (
                  <a
                    href={receipt.smsIntent}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium border border-white/20 flex items-center gap-1.5 transition-colors"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Launch OS Phone Link / SMS</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Message Content Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Emergency Message to Send:</span>
              <span className="text-[11px] text-slate-400">{message.length} chars</span>
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed resize-none font-sans"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-slate-300 block">Choose Dispatch Channel:</label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Button 1: WhatsApp (Recommended - Free & 100% Guaranteed to Phone) */}
              {phone && (
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer border border-emerald-400/30"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-200" />
                  <div className="text-left">
                    <div className="font-bold flex items-center gap-1">
                      <span>Send via WhatsApp</span>
                      <span className="text-[9px] bg-emerald-400/30 text-emerald-100 px-1.5 py-0.2 rounded font-normal">Direct</span>
                    </div>
                    <div className="text-[10px] text-emerald-100/80 font-normal">Instant & free to phone</div>
                  </div>
                </button>
              )}

              {/* Button 2: SMS */}
              {phone && (
                <button
                  type="button"
                  onClick={handleSendSMS}
                  disabled={isSending}
                  className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs flex items-center justify-center gap-2 border border-white/10 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <div className="font-bold">Dispatch SMS</div>
                    <div className="text-[10px] text-slate-400 font-normal">Telecom Gateway / Device</div>
                  </div>
                </button>
              )}

              {/* Button 2: WhatsApp */}
              {phone && (
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="p-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
              )}

              {/* Button 3: Email */}
              {email && (
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Direct Email</span>
                </button>
              )}

              {/* Button 4: Call */}
              {phone && (
                <a
                  href={`tel:${cleanPhoneNumber(phone)}`}
                  className="p-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-white/10 transition-all"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Voice Call ({phone})</span>
                </a>
              )}

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0C1530] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cellular emergency pipeline ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
