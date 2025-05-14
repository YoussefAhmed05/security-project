/**
 * Monoalphabetic Substitution Cipher Implementation
 * A cipher that uses a fixed substitution for the entire encryption process - 
 * each letter is replaced by another letter consistently throughout the message.
 */

// The standard alphabet
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Validate that the substitution key contains all 26 letters of the alphabet
export const validateMonoalphabeticKey = (key: string): boolean => {
  // Convert to uppercase for consistency
  key = key.toUpperCase();
  
  // Check if the key is 26 characters long
  if (key.length !== 26) {
    return false;
  }
  
  // Check if all 26 letters are present exactly once
  const letterCount: Record<string, number> = {};
  
  for (const char of key) {
    if (!char.match(/[A-Z]/)) {
      return false; // Non-alphabetic character found
    }
    
    if (letterCount[char]) {
      return false; // Duplicate letter found
    }
    
    letterCount[char] = 1;
  }
  
  return Object.keys(letterCount).length === 26;
};

export const monoalphabeticEncrypt = (text: string, key: string): string => {
  // Convert key to uppercase for consistency
  key = key.toUpperCase();
  
  if (!validateMonoalphabeticKey(key)) {
    throw new Error('Invalid substitution key');
  }
  
  return text
    .split('')
    .map(char => {
      // Handle uppercase letters
      if (char.match(/[A-Z]/)) {
        const index = ALPHABET.indexOf(char);
        return key[index];
      }
      
      // Handle lowercase letters
      if (char.match(/[a-z]/)) {
        const index = ALPHABET.indexOf(char.toUpperCase());
        return key[index].toLowerCase();
      }
      
      // Return unchanged if not a letter
      return char;
    })
    .join('');
};

export const monoalphabeticDecrypt = (text: string, key: string): string => {
  // Convert key to uppercase for consistency
  key = key.toUpperCase();
  
  if (!validateMonoalphabeticKey(key)) {
    throw new Error('Invalid substitution key');
  }
  
  return text
    .split('')
    .map(char => {
      // Handle uppercase letters
      if (char.match(/[A-Z]/)) {
        const index = key.indexOf(char);
        return ALPHABET[index];
      }
      
      // Handle lowercase letters
      if (char.match(/[a-z]/)) {
        const index = key.indexOf(char.toUpperCase());
        return ALPHABET[index].toLowerCase();
      }
      
      // Return unchanged if not a letter
      return char;
    })
    .join('');
};

// Generate a random substitution key (shuffled alphabet)
export const generateRandomKey = (): string => {
  const alphabet = [...ALPHABET];
  
  // Fisher-Yates shuffle algorithm
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  
  return alphabet.join('');
};