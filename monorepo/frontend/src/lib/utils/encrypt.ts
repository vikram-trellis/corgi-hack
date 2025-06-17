import { createHash } from "crypto";

export const CUSTOMER_KEY_ENCRYPTION_DELIMITER = "::";

/**
 * Creates a hash of the input string
 */
export function hash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Decrypts a customer API key
 * The format is: encrypted_key::customer_id
 */
export function decryptCustomerApiKey(encryptedApiKey: string): string {
  const parts = encryptedApiKey.split(CUSTOMER_KEY_ENCRYPTION_DELIMITER);
  if (parts.length !== 2) {
    throw new Error("Invalid encrypted API key format");
  }
  
  const [key, _customerId] = parts;
  // In a real implementation, you would decrypt the key here
  // For now, we just return the key part
  return key;
}
