// Empty shim to prevent crypto imports from breaking
export default {};
export const createHash = () => ({
  update: () => ({
    digest: () => 'dummy-hash'
  })
});
export const randomBytes = () => new Uint8Array(32);
export const createHmac = () => ({
  update: () => ({
    digest: () => 'dummy-hmac'
  })
});
export const createCipheriv = () => ({});
export const createDecipheriv = () => ({});