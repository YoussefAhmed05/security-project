/**
 * AES (Advanced Encryption Standard) Implementation
 * 
 * This is a from-scratch implementation of the AES algorithm as specified in FIPS 197.
 * It supports 128-bit, 192-bit and 256-bit keys with the corresponding 10, 12, and 14 rounds.
 * 
 * Implementation follows Rijndael specification without using any third-party crypto libraries.
 */

/**
 * AES S-Box lookup table for SubBytes transformation
 * Used for byte substitution in the encryption process
 */
const SBOX: Uint8Array = new Uint8Array([
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]);

/**
 * AES Inverse S-Box lookup table for InvSubBytes transformation
 * Used for byte substitution in the decryption process
 */
const INV_SBOX: Uint8Array = new Uint8Array([
  0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
  0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
  0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
  0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
  0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
  0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
  0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
  0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
  0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
  0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
  0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
  0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
  0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
  0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
  0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
  0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
]);

/**
 * Round constants used in the key expansion process
 */
const RCON: Uint8Array = new Uint8Array([
  0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f
]);

/**
 * Basic structure to represent the AES key parameters based on key size
 */
interface AESKeyParams {
  keySize: number;      // Key size in bits (128, 192, 256)
  nk: number;           // Number of 32-bit words in the key (4, 6, 8)
  nr: number;           // Number of rounds (10, 12, 14)
}

/**
 * Determines AES parameters based on key length
 * 
 * @param keyLength - Length of the key in bytes
 * @returns AESKeyParams object with appropriate parameters
 * @throws Error if key length is invalid
 */
function getKeyParams(keyLength: number): AESKeyParams {
  switch (keyLength) {
    case 16: // 128-bit key
      return { keySize: 128, nk: 4, nr: 10 };
    case 24: // 192-bit key
      return { keySize: 192, nk: 6, nr: 12 };
    case 32: // 256-bit key
      return { keySize: 256, nk: 8, nr: 14 };
    default:
      throw new Error("Invalid key length. Must be 16, 24, or 32 bytes (128, 192, or 256 bits).");
  }
}

/**
 * Performs the SubBytes transformation on the state matrix
 * Substitutes each byte with its corresponding value from the S-Box
 * 
 * @param state - 4x4 state matrix
 */
function subBytes(state: Uint8Array): void {
  for (let i = 0; i < 16; i++) {
    state[i] = SBOX[state[i]];
  }
}

/**
 * Performs the inverse SubBytes transformation
 * Reverses the SubBytes operation using the inverse S-Box
 * 
 * @param state - 4x4 state matrix
 */
function invSubBytes(state: Uint8Array): void {
  for (let i = 0; i < 16; i++) {
    state[i] = INV_SBOX[state[i]];
  }
}

/**
 * Performs the ShiftRows transformation on the state matrix
 * Cyclically shifts rows of the state to the left by different offsets
 * 
 * @param state - 4x4 state matrix
 */
function shiftRows(state: Uint8Array): void {
  // Row 0: No shift
  // Row 1: Shift left by 1
  const temp1 = state[1];
  state[1] = state[5];
  state[5] = state[9];
  state[9] = state[13];
  state[13] = temp1;
  
  // Row 2: Shift left by 2
  const temp2A = state[2];
  const temp2B = state[6];
  state[2] = state[10];
  state[6] = state[14];
  state[10] = temp2A;
  state[14] = temp2B;
  
  // Row 3: Shift left by 3 (or right by 1)
  const temp3 = state[15];
  state[15] = state[11];
  state[11] = state[7];
  state[7] = state[3];
  state[3] = temp3;
}

/**
 * Performs the inverse ShiftRows transformation
 * Cyclically shifts rows of the state to the right by different offsets
 * 
 * @param state - 4x4 state matrix
 */
function invShiftRows(state: Uint8Array): void {
  // Row 0: No shift
  // Row 1: Shift right by 1
  const temp1 = state[13];
  state[13] = state[9];
  state[9] = state[5];
  state[5] = state[1];
  state[1] = temp1;
  
  // Row 2: Shift right by 2
  const temp2A = state[10];
  const temp2B = state[14];
  state[10] = state[2];
  state[14] = state[6];
  state[2] = temp2A;
  state[6] = temp2B;
  
  // Row 3: Shift right by 3 (or left by 1)
  const temp3 = state[3];
  state[3] = state[7];
  state[7] = state[11];
  state[11] = state[15];
  state[15] = temp3;
}

/**
 * Galois field multiplication of two bytes in GF(2^8)
 * Used in MixColumns and InvMixColumns
 * 
 * @param a - First byte
 * @param b - Second byte
 * @returns Result of Galois field multiplication
 */
function gmul(a: number, b: number): number {
  let p = 0;
  let hiBitSet;
  
  for (let i = 0; i < 8; i++) {
    if ((b & 1) !== 0) {
      p ^= a;
    }
    
    hiBitSet = (a & 0x80);
    a <<= 1;
    if (hiBitSet !== 0) {
      a ^= 0x1B; // XOR with the irreducible polynomial x^8 + x^4 + x^3 + x + 1 (0x11B)
    }
    
    b >>= 1;
  }
  
  return p & 0xFF;
}

/**
 * Performs the MixColumns transformation on the state matrix
 * Mixes data within each column for diffusion
 * 
 * @param state - 4x4 state matrix
 */
function mixColumns(state: Uint8Array): void {
  const temp = new Uint8Array(4);
  
  for (let c = 0; c < 4; c++) {
    const colOffset = c * 4;
    
    // Store the original column
    for (let i = 0; i < 4; i++) {
      temp[i] = state[colOffset + i];
    }
    
    // Mix the column according to the AES specification
    // s'₀,c = (2 • s₀,c) ⊕ (3 • s₁,c) ⊕ s₂,c ⊕ s₃,c
    // s'₁,c = s₀,c ⊕ (2 • s₁,c) ⊕ (3 • s₂,c) ⊕ s₃,c
    // s'₂,c = s₀,c ⊕ s₁,c ⊕ (2 • s₂,c) ⊕ (3 • s₃,c)
    // s'₃,c = (3 • s₀,c) ⊕ s₁,c ⊕ s₂,c ⊕ (2 • s₃,c)
    state[colOffset] = gmul(2, temp[0]) ^ gmul(3, temp[1]) ^ temp[2] ^ temp[3];
    state[colOffset + 1] = temp[0] ^ gmul(2, temp[1]) ^ gmul(3, temp[2]) ^ temp[3];
    state[colOffset + 2] = temp[0] ^ temp[1] ^ gmul(2, temp[2]) ^ gmul(3, temp[3]);
    state[colOffset + 3] = gmul(3, temp[0]) ^ temp[1] ^ temp[2] ^ gmul(2, temp[3]);
  }
}

/**
 * Performs the inverse MixColumns transformation
 * Reverses the MixColumns operation for decryption
 * 
 * @param state - 4x4 state matrix
 */
function invMixColumns(state: Uint8Array): void {
  const temp = new Uint8Array(4);
  
  for (let c = 0; c < 4; c++) {
    const colOffset = c * 4;
    
    // Store the original column
    for (let i = 0; i < 4; i++) {
      temp[i] = state[colOffset + i];
    }
    
    // Inverse mix the column according to the AES specification
    // s'₀,c = (14 • s₀,c) ⊕ (11 • s₁,c) ⊕ (13 • s₂,c) ⊕ (9 • s₃,c)
    // s'₁,c = (9 • s₀,c) ⊕ (14 • s₁,c) ⊕ (11 • s₂,c) ⊕ (13 • s₃,c)
    // s'₂,c = (13 • s₀,c) ⊕ (9 • s₁,c) ⊕ (14 • s₂,c) ⊕ (11 • s₃,c)
    // s'₃,c = (11 • s₀,c) ⊕ (13 • s₁,c) ⊕ (9 • s₂,c) ⊕ (14 • s₃,c)
    state[colOffset] = gmul(14, temp[0]) ^ gmul(11, temp[1]) ^ gmul(13, temp[2]) ^ gmul(9, temp[3]);
    state[colOffset + 1] = gmul(9, temp[0]) ^ gmul(14, temp[1]) ^ gmul(11, temp[2]) ^ gmul(13, temp[3]);
    state[colOffset + 2] = gmul(13, temp[0]) ^ gmul(9, temp[1]) ^ gmul(14, temp[2]) ^ gmul(11, temp[3]);
    state[colOffset + 3] = gmul(11, temp[0]) ^ gmul(13, temp[1]) ^ gmul(9, temp[2]) ^ gmul(14, temp[3]);
  }
}

/**
 * Performs the AddRoundKey transformation on the state matrix
 * XORs each byte of the state with the round key
 * 
 * @param state - 4x4 state matrix
 * @param roundKey - Round key for this round
 */
function addRoundKey(state: Uint8Array, roundKey: Uint8Array): void {
  for (let i = 0; i < 16; i++) {
    state[i] ^= roundKey[i];
  }
}

/**
 * Performs the key expansion to generate round keys
 * 
 * @param key - Original cipher key
 * @param params - AES parameters based on key size
 * @returns Expanded key buffer containing all round keys
 */
function keyExpansion(key: Uint8Array, params: AESKeyParams): Uint8Array {
  const { nk, nr } = params;
  const expandedKeySize = 4 * 4 * (nr + 1); // 4 words (16 bytes) for each round plus the initial round
  const expandedKey = new Uint8Array(expandedKeySize);
  
  // Copy the original key to the beginning of the expanded key
  for (let i = 0; i < key.length; i++) {
    expandedKey[i] = key[i];
  }
  
  // Generate the rest of the expanded key
  for (let i = nk; i < (nr + 1) * 4; i++) {
    let temp = new Uint8Array(4);
    
    // Copy the previous word
    for (let j = 0; j < 4; j++) {
      temp[j] = expandedKey[(i - 1) * 4 + j];
    }
    
    if (i % nk === 0) {
      // RotWord: Perform a cyclic permutation on temp
      const tempByte = temp[0];
      temp[0] = temp[1];
      temp[1] = temp[2];
      temp[2] = temp[3];
      temp[3] = tempByte;
      
      // SubWord: Apply S-Box to each byte of temp
      for (let j = 0; j < 4; j++) {
        temp[j] = SBOX[temp[j]];
      }
      
      // XOR with Rcon
      temp[0] ^= RCON[(i / nk) - 1];
    } 
    else if (nk > 6 && i % nk === 4) {
      // Additional SubWord for 256-bit keys
      for (let j = 0; j < 4; j++) {
        temp[j] = SBOX[temp[j]];
      }
    }
    
    // XOR with the word nk positions earlier
    for (let j = 0; j < 4; j++) {
      expandedKey[i * 4 + j] = expandedKey[(i - nk) * 4 + j] ^ temp[j];
    }
  }
  
  return expandedKey;
}

/**
 * Performs AES encryption on a 16-byte block of data
 * 
 * @param plaintext - 16-byte plaintext block
 * @param key - Encryption key (16, 24, or 32 bytes)
 * @returns 16-byte ciphertext block
 */
function aesEncryptBlock(plaintext: Uint8Array, key: Uint8Array): Uint8Array {
  if (plaintext.length !== 16) {
    throw new Error("Plaintext must be 16 bytes (128 bits)");
  }
  
  const keyParams = getKeyParams(key.length);
  const roundKeys = keyExpansion(key, keyParams);
  
  // Create the state array (column-major order)
  const state = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    state[i] = plaintext[i];
  }
  
  // Initial round: AddRoundKey
  addRoundKey(state, roundKeys.subarray(0, 16));
  
  // Main rounds
  for (let round = 1; round < keyParams.nr; round++) {
    subBytes(state);
    shiftRows(state);
    mixColumns(state);
    addRoundKey(state, roundKeys.subarray(round * 16, (round + 1) * 16));
  }
  
  // Final round (no MixColumns)
  subBytes(state);
  shiftRows(state);
  addRoundKey(state, roundKeys.subarray(keyParams.nr * 16, (keyParams.nr + 1) * 16));
  
  return state;
}

/**
 * Performs AES decryption on a 16-byte block of data
 * 
 * @param ciphertext - 16-byte ciphertext block
 * @param key - Decryption key (16, 24, or 32 bytes)
 * @returns 16-byte plaintext block
 */
function aesDecryptBlock(ciphertext: Uint8Array, key: Uint8Array): Uint8Array {
  if (ciphertext.length !== 16) {
    throw new Error("Ciphertext must be 16 bytes (128 bits)");
  }
  
  const keyParams = getKeyParams(key.length);
  const roundKeys = keyExpansion(key, keyParams);
  
  // Create the state array (column-major order)
  const state = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    state[i] = ciphertext[i];
  }
  
  // Initial round: AddRoundKey (with last round key)
  addRoundKey(state, roundKeys.subarray(keyParams.nr * 16, (keyParams.nr + 1) * 16));
  
  // Main rounds (in reverse)
  for (let round = keyParams.nr - 1; round > 0; round--) {
    invShiftRows(state);
    invSubBytes(state);
    addRoundKey(state, roundKeys.subarray(round * 16, (round + 1) * 16));
    invMixColumns(state);
  }
  
  // Final round (no InvMixColumns)
  invShiftRows(state);
  invSubBytes(state);
  addRoundKey(state, roundKeys.subarray(0, 16));
  
  return state;
}

/**
 * Converts a string to a Uint8Array using UTF-8 encoding
 * 
 * @param str - Input string
 * @returns Uint8Array representation
 */
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Converts a Uint8Array to a string using UTF-8 encoding
 * 
 * @param bytes - Input Uint8Array
 * @returns Decoded string
 */
function uint8ArrayToString(bytes: Uint8Array): string {
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(bytes);
}

/**
 * Converts a hex string to a Uint8Array
 * 
 * @param hexStr - Hex string (with or without spaces)
 * @returns Uint8Array
 */
function hexToUint8Array(hexStr: string): Uint8Array {
  // Remove spaces if any
  const hex = hexStr.replace(/\s+/g, '');
  
  if (hex.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters");
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  
  return bytes;
}

/**
 * Converts a Uint8Array to a hex string
 * 
 * @param bytes - Input Uint8Array
 * @param spaces - Whether to add spaces between bytes (default: false)
 * @returns Hex string representation
 */
function uint8ArrayToHex(bytes: Uint8Array, spaces = false): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(spaces ? ' ' : '');
}

/**
 * Pads the input data according to PKCS#7 for AES block encryption
 * 
 * @param data - Input data
 * @returns Padded data
 */
function padPKCS7(data: Uint8Array): Uint8Array {
  const blockSize = 16;
  const paddingLength = blockSize - (data.length % blockSize);
  const padded = new Uint8Array(data.length + paddingLength);
  
  // Copy original data
  padded.set(data);
  
  // Add padding bytes
  for (let i = data.length; i < padded.length; i++) {
    padded[i] = paddingLength;
  }
  
  return padded;
}

/**
 * Removes PKCS#7 padding from the input data
 * 
 * @param data - Padded data
 * @returns Unpadded data
 */
function unpadPKCS7(data: Uint8Array): Uint8Array {
  if (data.length === 0 || data.length % 16 !== 0) {
    throw new Error("Invalid padded data length");
  }
  
  const paddingLength = data[data.length - 1];
  
  if (paddingLength > 16) {
    throw new Error("Invalid padding value");
  }
  
  // Validate the padding
  for (let i = data.length - paddingLength; i < data.length; i++) {
    if (data[i] !== paddingLength) {
      throw new Error("Invalid padding");
    }
  }
  
  return data.subarray(0, data.length - paddingLength);
}

/**
 * AES encrypts data using the specified key
 * 
 * @param plaintext - Data to encrypt
 * @param key - Encryption key (16, 24, or 32 bytes)
 * @returns Encrypted data
 */
export function aesEncrypt(plaintext: Uint8Array, key: Uint8Array): Uint8Array {
  // Pad the plaintext
  const paddedPlaintext = padPKCS7(plaintext);
  
  // Process each block
  const numBlocks = paddedPlaintext.length / 16;
  const ciphertext = new Uint8Array(paddedPlaintext.length);
  
  for (let i = 0; i < numBlocks; i++) {
    const block = paddedPlaintext.subarray(i * 16, (i + 1) * 16);
    const encryptedBlock = aesEncryptBlock(block, key);
    ciphertext.set(encryptedBlock, i * 16);
  }
  
  return ciphertext;
}

/**
 * AES decrypts data using the specified key
 * 
 * @param ciphertext - Data to decrypt
 * @param key - Decryption key (16, 24, or 32 bytes)
 * @returns Decrypted data
 */
export function aesDecrypt(ciphertext: Uint8Array, key: Uint8Array): Uint8Array {
  if (ciphertext.length % 16 !== 0) {
    throw new Error("Ciphertext length must be a multiple of 16 bytes");
  }
  
  // Process each block
  const numBlocks = ciphertext.length / 16;
  const paddedPlaintext = new Uint8Array(ciphertext.length);
  
  for (let i = 0; i < numBlocks; i++) {
    const block = ciphertext.subarray(i * 16, (i + 1) * 16);
    const decryptedBlock = aesDecryptBlock(block, key);
    paddedPlaintext.set(decryptedBlock, i * 16);
  }
  
  // Remove padding
  return unpadPKCS7(paddedPlaintext);
}

/**
 * Helper function to encrypt a string using AES
 * 
 * @param text - Text to encrypt
 * @param keyText - Key as text or hex string
 * @param isHexKey - Whether the key is provided as a hex string
 * @returns Encrypted data as hex string
 */
export function aesEncryptText(text: string, keyText: string, isHexKey = false): string {
  const textBytes = stringToUint8Array(text);
  const keyBytes = isHexKey ? hexToUint8Array(keyText) : stringToUint8Array(keyText);
  
  const ciphertext = aesEncrypt(textBytes, keyBytes);
  return uint8ArrayToHex(ciphertext);
}

/**
 * Helper function to decrypt a hex string using AES
 * 
 * @param hexCiphertext - Hex string of ciphertext
 * @param keyText - Key as text or hex string
 * @param isHexKey - Whether the key is provided as a hex string
 * @returns Decrypted text
 */
export function aesDecryptText(hexCiphertext: string, keyText: string, isHexKey = false): string {
  const ciphertextBytes = hexToUint8Array(hexCiphertext);
  const keyBytes = isHexKey ? hexToUint8Array(keyText) : stringToUint8Array(keyText);
  
  const plaintextBytes = aesDecrypt(ciphertextBytes, keyBytes);
  return uint8ArrayToString(plaintextBytes);
}

/**
 * Validates that an AES key has a valid length
 * 
 * @param key - Key to validate
 * @returns true if valid, false otherwise
 */
export function validateAesKey(key: string): boolean {
  const keyBytes = stringToUint8Array(key);
  return keyBytes.length === 16 || keyBytes.length === 24 || keyBytes.length === 32;
}
