/**
 * Centralized EaseHub Contact & Payment QR Configuration
 * Single source of truth for support contact, WhatsApp, dual UPI IDs, and QR payments.
 */
export const paymentConfig = {
  easehubContactPhone: '6201614778',
  easehubContactPhoneFormatted: '+91 6201614778',
  easehubWhatsAppNumber: '916201614778',
  
  // Dual Official UPI IDs
  primaryUpiId: '6201614778@ibl',
  secondaryUpiId: '6201614778-2@ybl',
  upiIds: ['6201614778@ibl', '6201614778-2@ybl'],

  // Payment QR Asset Configuration
  qrImageUrl: '/payment-qr.jpg',
  isQrAvailable: true,

  // Helper for tel: links
  getTelLink: () => 'tel:+916201614778',

  // Helper for WhatsApp click-to-chat links with dynamic listing name
  getWhatsAppLink: (listingName?: string) => {
    const msg = listingName
      ? `Hello EaseHub, I need help with payment for ${listingName}.`
      : 'Hello EaseHub, I need help regarding a payment or listing.';
    return `https://wa.me/916201614778?text=${encodeURIComponent(msg)}`;
  },

  // Helper for generating Universal UPI Intent URL for mobile UPI app redirection
  getUpiIntentUrl: (upiId: string = '6201614778@ibl', amount: number = 0, note: string = 'EaseHub Booking Payment') => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: 'EaseHub',
      am: (amount || 0).toString(),
      cu: 'INR',
      tn: note,
    });
    return `upi://pay?${params.toString()}`;
  },
};
