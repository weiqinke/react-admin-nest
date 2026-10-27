function pemToArrayBuffer(pem: string) {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach(b => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

/** RSA-OAEP(SHA-256) 加密明文密码，返回 Base64。 */
export async function encryptPassword(publicKeyPem: string, password: string) {
  const key = await crypto.subtle.importKey("spki", pemToArrayBuffer(publicKeyPem), { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
  const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, new TextEncoder().encode(password));
  return bufferToBase64(cipher);
}
