import { Algorithm } from '../types';
import { 
  caesarEncrypt, 
  caesarDecrypt, 
  validateCaesarKey 
} from './cryptography/caesarCipher';
import { 
  affineEncrypt, 
  affineDecrypt, 
  validateAffineKey 
} from './cryptography/affineCipher';
import { 
  monoalphabeticEncrypt, 
  monoalphabeticDecrypt, 
  validateMonoalphabeticKey, 
  generateRandomKey 
} from './cryptography/monoalphabeticCipher';
import {
  aesEncryptText,
  aesDecryptText,
  validateAesKey
} from './cryptography/aesCipher';

export const algorithmData: Algorithm[] = [
  {
    id: 'caesar',
    name: 'Caesar Cipher',
    description: 'A substitution cipher where each letter is shifted by a fixed number of positions.',
    encrypt: caesarEncrypt,
    decrypt: caesarDecrypt,
    keyValidator: validateCaesarKey,
    keyInputType: 'number',
    weaknesses: [
      'Only 25 possible keys (easy to brute force)',
      'Preserves letter frequency patterns',
      'Single letter analysis can reveal patterns'
    ],
    keySpace: '26 possible keys (shift values 0-25)',
    historicalUse: 'Named after Julius Caesar, who used it for private correspondence with a shift of 3.'
  },
  {
    id: 'aes',
    name: 'AES (Advanced Encryption Standard)',
    description: 'A symmetric block cipher adopted worldwide for secure communications. It processes data in 128-bit blocks with key sizes of 128, 192, or 256 bits.',
    encrypt: (text: string, key: string) => aesEncryptText(text, key),
    decrypt: (text: string, key: string) => {
      try {
        return aesDecryptText(text, key);
      } catch (error) {
        return "Decryption failed. Please check your key and ciphertext.";
      }
    },
    keyValidator: validateAesKey,
    keyInputType: 'substitution',
    weaknesses: [
      'Implementation vulnerabilities such as side-channel attacks',
      'Key management complexity',
      'Brute force attacks possible with insufficient key size'
    ],
    keySpace: 'Up to 2^256 possible keys with a 256-bit key',
    historicalUse: 'Established by NIST in 2001 as a replacement for DES. Now widely used in government and commercial applications worldwide.'
  },
  {
    id: 'affine',
    name: 'Affine Cipher',
    description: 'A substitution cipher where each letter is transformed using the function (ax + b) mod 26.',
    encrypt: affineEncrypt,
    decrypt: affineDecrypt,
    keyValidator: validateAffineKey,
    keyInputType: 'affine',
    weaknesses: [
      'Only 286 possible keys (a must be coprime with 26)',
      'Still preserves letter frequency patterns',
      'Vulnerable to frequency analysis'
    ],
    keySpace: '12 x 26 = 312 possible keys (a has 12 possible values coprime with 26, b has 26 possible values)',
    historicalUse: 'A historical cipher used primarily for educational purposes in understanding modular arithmetic.'
  },
  {
    id: 'monoalphabetic',
    name: 'Monoalphabetic Substitution',
    description: 'A substitution cipher where each letter is replaced with another letter according to a fixed mapping.',
    encrypt: monoalphabeticEncrypt,
    decrypt: monoalphabeticDecrypt,
    keyValidator: validateMonoalphabeticKey,
    keyInputType: 'substitution',
    weaknesses: [
      'Vulnerable to frequency analysis',
      'Common letter patterns remain recognizable',
      'Digraphs and trigraphs (2-3 letter combinations) reveal patterns'
    ],
    keySpace: '26! possible keys (approximately 4 x 10²⁶)',
    historicalUse: 'Used historically in various forms including newspapers (cryptograms) and during wartime communications.'
  }
];

export const getDefaultKey = (algorithmId: string) => {
  switch (algorithmId) {
    case 'caesar':
      return 3;
    case 'affine':
      return { a: 5, b: 8 };
    case 'monoalphabetic':
      return generateRandomKey();
    case 'aes':
      return "AESSecureKey12345"; // 16 bytes (128 bits) default key
    default:
      return null;
  }
};

export const getAlgorithm = (id: string): Algorithm | undefined => {
  return algorithmData.find(algo => algo.id === id);
};

export const getExampleText = (): string => {
  const examples = [
    "The quick brown fox jumps over the lazy dog",
    "Cryptography is the study of secure communications techniques",
    "All that glitters is not gold",
    "To be or not to be, that is the question",
    "Hello, World!"
  ];
  
  return examples[Math.floor(Math.random() * examples.length)];
};