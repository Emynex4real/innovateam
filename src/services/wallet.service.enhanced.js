/**
 * Service pricing configuration.
 * Prices are in NGN (Nigerian Naira).
 */

export const SERVICE_PRICES = {
  // AI & Exam services (pay-per-use for students)
  'ai-examiner': 100,
  'practice-exam': 100,

  // Result checker services
  'waec-result-checker': 2500,
  'neco-result-checker': 1500,
  'nabteb-result-checker': 1500,
  'nbais-result-checker': 1500,
  'waec-gce': 2500,

  // Document services
  'olevel-upload': 1000,
  'original-result': 5000,
  'admission-letter': 2000,
  'reprinting': 1500,

  // JAMB services
  'pin-vending': 5000,

  // Advisory
  'course-advisor': 200,

  // Communication
  'airtime-topup': 0, // variable amount, use customAmount
  'data-subscription': 0, // variable amount, use customAmount
};

/**
 * Get price for a service.
 * @param {string} serviceKey
 * @param {number|null} customAmount - Override for variable-price services
 * @returns {number} Price in NGN
 */
export const getServicePrice = (serviceKey, customAmount = null) => {
  if (customAmount != null && customAmount > 0) return customAmount;
  return SERVICE_PRICES[serviceKey] || 0;
};

/**
 * Free tier configuration for students.
 */
export const FREE_TIER = {
  sessionLimit: 3,
  eligibleServices: ['ai-examiner', 'practice-exam'],
};
