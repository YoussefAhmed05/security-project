/**
 * Caesar Cipher Implementation
 * A simple substitution cipher that shifts each letter in the plaintext by a fixed number of positions.
 */

export const caesarEncrypt = (text: string, shift: number): string => {
  // Ensure shift is within range 0-25
  shift = ((shift % 26) + 26) % 26;
  
  return text
    .split('')
    .map(char => {
      // Handle uppercase letters
      if (char.match(/[A-Z]/)) {
        const code = char.charCodeAt(0);
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      
      // Handle lowercase letters
      if (char.match(/[a-z]/)) {
        const code = char.charCodeAt(0);
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      
      // Return unchanged if not a letter
      return char;
    })
    .join('');
};

export const caesarDecrypt = (text: string, shift: number): string => {
  // To decrypt, use the negative shift value
  return caesarEncrypt(text, 26 - (shift % 26));
};

export const validateCaesarKey = (key: number): boolean => {
  return Number.isInteger(key) && key >= 0 && key <= 25;
};