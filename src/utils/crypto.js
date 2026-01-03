// Dummy crypto module to prevent build errors
export default {
  randomBytes: () => new Uint8Array(32),
  createCipheriv: () => ({}),
  createDecipheriv: () => ({}),
  createHash: () => ({
    update: () => ({
      digest: () => 'dummy-hash'
    })
  }),
  createHmac: () => ({
    update: () => ({
      digest: () => 'dummy-hmac'
    })
  })
};