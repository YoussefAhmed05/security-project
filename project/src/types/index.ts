export type Algorithm = {
  id: string;
  name: string;
  description: string;
  encrypt: (text: string, key: any) => string;
  decrypt: (text: string, key: any) => string;
  keyValidator: (key: any) => boolean;
  keyInputType: 'number' | 'affine' | 'substitution';
  weaknesses: string[];
  keySpace: string;
  historicalUse: string;
};

export type AlgorithmKey = {
  caesar: number;
  affine: { a: number; b: number };
  monoalphabetic: string;
  aes: string;
};

export type AlgorithmOrder = {
  id: string;
  name: string;
}[];

export type OperationMode = 'encrypt' | 'decrypt';