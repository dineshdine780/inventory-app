const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";

const getEncryptionKey = () => {
  const key = process.env.GEMINI_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("GEMINI_ENCRYPTION_KEY is not configured");
  }

  return Buffer.from(key, "hex");
};

const encrypt = (text) => {
  const key = getEncryptionKey();

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString(
    "hex"
  )}:${encrypted}`;
};

const decrypt = (encryptedText) => {
  const key = getEncryptionKey();

  const [ivHex, authTagHex, encrypted] =
    encryptedText.split(":");

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(
    Buffer.from(authTagHex, "hex")
  );

  let decrypted = decipher.update(
    encrypted,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};