/**
 * Centralized EaseHub Contact & Payment QR Configuration
 * Single source of truth for support contact, WhatsApp, and QR payments.
 */
export const paymentConfig = {
  easehubContactPhone: '6201614778',
  easehubContactPhoneFormatted: '+91 6201614778',
  easehubWhatsAppNumber: '916201614778',
  easehubUpiId: '6201614778@paytm',
  
  // Payment QR Asset Configuration
  qrImageUrl: '/logo.png', // Public QR asset if available
  isQrAvailable: true,

  // Helper for tel: links
  getTelLink: () => 'tel:+916201614778',

  // Helper for WhatsApp click-to-chat links with dynamic listing name
  getWhatsAppLink: (listingName?: string) => {
    const msg = listingName
      ? `Hello EaseHub, I am interested in ${listingName}.`
      : 'Hello EaseHub, I am interested in this listing.';
    return `https://wa.me/916201614778?text=${encodeURIComponent(msg)}`;
  },
};
