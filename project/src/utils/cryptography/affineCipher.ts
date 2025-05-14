/**
 * Affine Cipher Implementation
 * A type of monoalphabetic substitution cipher where each letter is mapped to its numeric equivalent, 
 * encrypted using an affine function, and converted back to a letter.
 */

// Helper function to calculate the modular multiplicative inverse
const modInverse = (a: number, m: number): number => {
  // Ensure a and m are coprime
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  if (gcd(a, m) !== 1) {
    throw new Error(`${a} and ${m} are not coprime`);
  }
  
  // Find the modular multiplicative inverse
  for (let i = 1; i < m; i++) {
    if ((a * i) % m === 1) {
      return i;
    }
  }
  
  return 1; // Should never reach here if a and m are coprime
};

export const affineEncrypt = (text: string, key: { a: number; b: number }): string => {
  const { a, b } = key;
  
  // Check if 'a' and 26 are coprime (gcd(a, 26) = 1)
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  if (gcd(a, 26) !== 1) {
    throw new Error('The value of "a" must be coprime with 26');
  }
  
  return text
    .split('')
    .map(char => {
      // Handle uppercase letters
      if (char.match(/[A-Z]/)) {
        const code = char.charCodeAt(0) - 65;
        return String.fromCharCode((((a * code) + b) % 26) + 65);
      }
      
      // Handle lowercase letters
      if (char.match(/[a-z]/)) {
        const code = char.charCodeAt(0) - 97;
        return String.fromCharCode((((a * code) + b) % 26) + 97);
      }
      
      // Return unchanged if not a letter
      return char;
    })
    .join('');
};

export const affineDecrypt = (text: string, key: { a: number; b: number }): string => {
  const { a, b } = key;
  
  try {
    // Find the modular multiplicative inverse of 'a'
    const aInverse = modInverse(a, 26);
    
    return text
      .split('')
      .map(char => {
        // Handle uppercase letters
        if (char.match(/[A-Z]/)) {
          const code = char.charCodeAt(0) - 65;
          return String.fromCharCode(((aInverse * (code - b + 26)) % 26) + 65);
        }
        
        // Handle lowercase letters
        if (char.match(/[a-z]/)) {
          const code = char.charCodeAt(0) - 97;
          return String.fromCharCode(((aInverse * (code - b + 26)) % 26) + 97);
        }
        
        // Return unchanged if not a letter
        return char;
      })
      .join('');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return `Error: ${errorMessage}`;
  }
};

export const validateAffineKey = (key: { a: number; b: number }): boolean => {
  const { a, b } = key;
  
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return false;
  }
  
  if (a < 1 || a > 25 || b < 0 || b > 25) {
    return false;
  }
  
  // Check if 'a' and 26 are coprime (gcd(a, 26) = 1)
  const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
  return gcd(a, 26) === 1;
};