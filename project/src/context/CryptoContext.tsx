import React, { createContext, useContext, useState } from 'react';
import { AlgorithmOrder, AlgorithmKey, OperationMode } from '../types';
import { getDefaultKey } from '../utils/algorithmData';

type CryptoContextType = {
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  algorithmOrder: AlgorithmOrder;
  setAlgorithmOrder: (order: AlgorithmOrder) => void;
  keys: AlgorithmKey;
  updateKey: (algorithmId: string, key: any) => void;
  mode: OperationMode;
  toggleMode: () => void;
  resetAll: () => void;
};

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

const defaultKeys: AlgorithmKey = {
  caesar: getDefaultKey('caesar') as number,
  affine: getDefaultKey('affine') as { a: number; b: number },
  monoalphabetic: getDefaultKey('monoalphabetic') as string,
  aes: getDefaultKey('aes') as string
};

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [algorithmOrder, setAlgorithmOrder] = useState<AlgorithmOrder>([]);
  const [keys, setKeys] = useState<AlgorithmKey>(defaultKeys);
  const [mode, setMode] = useState<OperationMode>('encrypt');
  
  const updateKey = (algorithmId: string, key: any) => {
    setKeys(prev => ({ ...prev, [algorithmId]: key }));
  };
  
  const toggleMode = () => {
    setMode(prev => (prev === 'encrypt' ? 'decrypt' : 'encrypt'));
    
    // Swap input and output when toggling mode
    setInputText(outputText);
    setOutputText('');
  };
  
  const resetAll = () => {
    setInputText('');
    setOutputText('');
    setMode('encrypt');
  };
  
  return (
    <CryptoContext.Provider 
      value={{
        inputText,
        setInputText,
        outputText,
        setOutputText,
        algorithmOrder,
        setAlgorithmOrder,
        keys,
        updateKey,
        mode,
        toggleMode,
        resetAll
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

// Custom hook for using the crypto context
export const useCrypto = (): CryptoContextType => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};