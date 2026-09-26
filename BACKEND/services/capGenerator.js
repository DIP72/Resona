/**
 * Low-Bandwidth Protocol Encodings Generator
 * - OASIS CAP v1.2 (Common Alerting Protocol) XML
 * - Compressed GSM-7 SMS (<= 140 chars)
 * - USSD Emergency Shortcode (*999*...)
 * - LoRaWAN binary-packed Hex payload (< 64 bytes)
 */

function generateCapXml(alertData) {
  const identifier = `URN:NDMA:ALERT:${alertData.alertId || Date.now()}`;
  const sender = 'ndma-dispatcher@gov.in';
  const sent = new Date().toISOString();
  const severity = alertData.severity || 'Severe';
  const urgency = alertData.urgency || 'Immediate';
  const category = alertData.category || 'Met';
  const event = alertData.title || 'Severe Cyclonic Storm';
  const areaDesc = alertData.affectedArea?.name || 'Odisha Coast';
  const lat = alertData.affectedArea?.coordinates?.lat || 19.8135;
  const lng = alertData.affectedArea?.coordinates?.lng || 85.8312;
  const radius = alertData.affectedArea?.radiusKm || 45;

  const headline = alertData.plainLanguage?.threat || alertData.title;
  const instruction = (alertData.plainLanguage?.actionableSteps || []).slice(0, 2).join(' ') || 'Move to shelter.';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${identifier}</identifier>
  <sender>${sender}</sender>
  <sent>${sent}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>${category}</category>
    <event>${event}</event>
    <urgency>${urgency}</urgency>
    <severity>${severity}</severity>
    <certainty>Observed</certainty>
    <headline>${headline.replace(/&/g, '&amp;').substring(0, 100)}</headline>
    <instruction>${instruction.replace(/&/g, '&amp;').substring(0, 150)}</instruction>
    <area>
      <areaDesc>${areaDesc}</areaDesc>
      <circle>${lat},${lng} ${radius}</circle>
    </area>
  </info>
</alert>`.trim();

  return xml;
}

function generateCompressedSms(alertData) {
  // Must fit inside GSM 140-160 character limit for rural feature phones
  const code = (alertData.severity || 'SEV').substring(0, 3).toUpperCase();
  const loc = (alertData.affectedArea?.name || 'COAST').substring(0, 10).toUpperCase();
  const action = (alertData.plainLanguage?.actionableSteps?.[0] || 'Move to Cyclone Shelter now').substring(0, 50);
  
  const sms = `[EMERGENCY ${code}] ${loc}: Severe storm approaching. ${action}. Help: Dial 112 / 1077.`;
  return sms.length > 140 ? sms.substring(0, 137) + '...' : sms;
}

function generateUssdString(alertData) {
  // Interactive USSD shortcode for basic 2G feature phones without data plans
  const areaCode = (alertData.affectedArea?.name || 'OD').substring(0, 3).toUpperCase();
  return `*999*1*${areaCode}#`;
}

function generateLoraHexPayload(alertData) {
  // Ultra-lightweight LoRaWAN / 868MHz mesh packet (52 bytes)
  // [Header 2B][Hazard 1B][Severity 1B][Lat 4B][Lng 4B][Radius 2B][Checksum 2B][Packed ASCII 36B]
  const hazardByte = alertData.category === 'Meteorological' ? '01' : '02';
  const severityByte = alertData.severity === 'Extreme' ? 'FF' : 'AA';
  const latHex = Math.abs(Math.round((alertData.affectedArea?.coordinates?.lat || 19.81) * 10000)).toString(16).padStart(8, '0');
  const lngHex = Math.abs(Math.round((alertData.affectedArea?.coordinates?.lng || 85.83) * 10000)).toString(16).padStart(8, '0');
  const dummyPayload = `0xAA55${hazardByte}${severityByte}${latHex}${lngHex}002D4E444D412D4C4153544D494C452D5348454C544552`;
  return dummyPayload;
}

module.exports = {
  generateCapXml,
  generateCompressedSms,
  generateUssdString,
  generateLoraHexPayload,
};
