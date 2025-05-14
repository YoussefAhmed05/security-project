import React, { useState } from 'react';
import { Info, RefreshCw } from 'lucide-react';
import { algorithmData, getDefaultKey } from '../utils/algorithmData';
import { generateRandomKey } from '../utils/cryptography/monoalphabeticCipher';

interface KeyInputProps {
  algorithmId: string;
  value: any;
  onChange: (value: any) => void;
  showValidationErrors?: boolean;
}

const KeyInput: React.FC<KeyInputProps> = ({
  algorithmId,
  value,
  onChange,
  showValidationErrors = false
}) => {
  const [showHelp, setShowHelp] = useState(false);
  
  const algorithm = algorithmData.find(algo => algo.id === algorithmId);
  if (!algorithm) return null;
  
  const isValid = algorithm.keyValidator(value);
  
  const handleGenerateRandomKey = () => {
    let newKey;
    
    switch (algorithm.keyInputType) {
      case 'number':
        newKey = Math.floor(Math.random() * 26);
        break;
      case 'affine':
        // Valid 'a' values (coprime with 26): 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25
        const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
        newKey = {
          a: validA[Math.floor(Math.random() * validA.length)],
          b: Math.floor(Math.random() * 26)
        };
        break;
      case 'substitution':
        newKey = generateRandomKey();
        break;
      default:
        newKey = getDefaultKey(algorithmId);
    }
    
    onChange(newKey);
  };
  
  // Helper function for generating AES keys of different sizes
  const generateAesKey = (size: number): string => {
    // Create a random key of the appropriate size
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let key = '';
    for (let i = 0; i < size; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const renderKeyInput = () => {
    switch (algorithm.keyInputType) {
      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shift Value (0-25)
            </label>
            <input
              type="number"
              min="0"
              max="25"
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                        transition-all duration-200
                        ${!isValid && showValidationErrors ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            />
            {!isValid && showValidationErrors && (
              <p className="text-sm text-red-500 mt-1">
                Please enter a valid shift value between 0 and 25.
              </p>
            )}
          </div>
        );
        
      case 'affine':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Coefficients
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  a (must be coprime with 26)
                </label>
                <input
                  type="number"
                  value={value.a}
                  onChange={(e) => onChange({...value, a: Number(e.target.value)})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                            transition-all duration-200
                            ${!isValid && showValidationErrors ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  b (0-25)
                </label>
                <input
                  type="number"
                  min="0"
                  max="25"
                  value={value.b}
                  onChange={(e) => onChange({...value, b: Number(e.target.value)})}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                            dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                            transition-all duration-200
                            ${!isValid && showValidationErrors ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                />
              </div>
            </div>
            {!isValid && showValidationErrors && (
              <p className="text-sm text-red-500 mt-1">
                'a' must be coprime with 26 (valid values: 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25)
                and 'b' must be between 0 and 25.
              </p>
            )}
          </div>
        );
        
      case 'substitution':
        // Special case for AES algorithm
        if (algorithm.id === 'aes') {
          return (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                AES Key (16, 24 or 32 characters)
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                          dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100
                          transition-all duration-200
                          ${!isValid && showValidationErrors ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => onChange(generateAesKey(16))}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  title="Generate 128-bit key"
                >
                  128-bit
                </button>
                <button
                  onClick={() => onChange(generateAesKey(24))}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  title="Generate 192-bit key"
                >
                  192-bit
                </button>
                <button
                  onClick={() => onChange(generateAesKey(32))}
                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
                  title="Generate 256-bit key"
                >
                  256-bit
                </button>
              </div>
              {!isValid && showValidationErrors && (
                <p className="text-sm text-red-500 mt-1">
                  Key must be exactly 16, 24 or 32 characters (128, 192 or 256 bits).
                </p>
              )}
            </div>
          );
        }
        
        // Regular substitution cipher
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Substitution Key (26 unique letters A-Z)
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 uppercase
                        transition-all duration-200
                        ${!isValid && showValidationErrors ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              maxLength={26}
            />
            {!isValid && showValidationErrors && (
              <p className="text-sm text-red-500 mt-1">
                Key must contain exactly 26 unique letters (A-Z).
              </p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  const renderHelpText = () => {
    if (!showHelp) return null;
    
    let helpText = '';
    
    switch (algorithm.keyInputType) {
      case 'number':
        helpText = 'The shift value determines how many positions each letter is shifted in the alphabet. For example, with a shift of 3, "A" becomes "D", "B" becomes "E", etc.';
        break;
      case 'affine':
        helpText = 'The Affine cipher uses the formula (ax + b) mod 26 where x is the position of the letter (A=0, B=1, etc.). The value of "a" must be coprime with 26 (have no common factors), and "b" can be any value from 0 to 25.';
        break;
      case 'substitution':
        if (algorithm.id === 'aes') {
          helpText = 'The AES key must be 16, 24, or 32 characters long (for AES-128, AES-192, or AES-256 respectively). The key is used in a complex series of substitutions and permutations to transform the plaintext into ciphertext.';
        } else {
          helpText = 'The substitution key is a rearrangement of the 26 letters of the alphabet. Each letter in the original alphabet is replaced by the corresponding letter in your key. For example, if your key starts with "QWERTY...", then A→Q, B→W, C→E, etc.';
        }
        break;
      default:
        helpText = '';
    }
    
    return (
      <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm dark:bg-blue-900 dark:text-blue-200">
        {helpText}
      </div>
    );
  };
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
          {algorithm.name} Key
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400
                      transition-colors duration-200"
            title="Key information"
          >
            <Info size={16} />
          </button>
          <button
            onClick={handleGenerateRandomKey}
            className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400
                      transition-colors duration-200"
            title="Generate random key"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      
      {renderKeyInput()}
      {renderHelpText()}
    </div>
  );
};

export default KeyInput;