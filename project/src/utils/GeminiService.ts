/**
 * GeminiService.ts
 * Handles interaction with the Google Gemini API for cryptographic analysis
 */
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

export interface CryptoAnalysisResult {
  analysis: string;
  error?: string;
}

/**
 * Get a configured instance of the Gemini API client
 */
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!isValidApiKey()) {
    throw new Error('Invalid or missing Gemini API key. Please add a valid key to your .env file.');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Check if the API key is valid
 */
const isValidApiKey = (): boolean => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return false;
  const isPlaceholder = apiKey === 'your_gemini_api_key_here';
  return !isPlaceholder && typeof apiKey === 'string' && apiKey.length > 10;
};

/**
 * Format the cryptanalysis prompt for the Gemini model
 */
const formatCryptoAnalysisPrompt = (
  pipeline: { id: string; name: string; key: any }[],
  plaintext: string,
  ciphertext: string,
  mode: 'encrypt' | 'decrypt'
): string => {
  // Sample size restrictions for inputs
  const maxTextLength = 100;
  const truncatedPlaintext = plaintext.length > maxTextLength 
    ? plaintext.substring(0, maxTextLength) + '...' 
    : plaintext;
  const truncatedCiphertext = ciphertext.length > maxTextLength 
    ? ciphertext.substring(0, maxTextLength) + '...' 
    : ciphertext;

  // Format keys for display
  const pipelineDetails = pipeline.map((algo, index) => {
    let keyDisplay = '';
    
    // Format key display based on algorithm type
    if (algo.id === 'caesar') {
      keyDisplay = `Shift value: ${algo.key}`;
    } else if (algo.id === 'affine') {
      keyDisplay = `a: ${algo.key.a}, b: ${algo.key.b}`;
    } else if (algo.id === 'monoalphabetic') {
      keyDisplay = `Key: ${algo.key.substring(0, 6)}...`;
    } else if (algo.id === 'aes') {
      keyDisplay = `Key length: ${algo.key.length} characters`;
    }
    
    return `${index + 1}. ${algo.name} (${keyDisplay})`;
  }).join('\n');
    return `
You are a cryptography expert providing an analysis of an encryption pipeline used for educational purposes.

Format your response to be visually appealing with clear sections, bullet points, and emojis where appropriate.
Make your analysis simple and understandable even for beginners.

ENCRYPTION PIPELINE:
${pipelineDetails}

${mode === 'encrypt' ? 'PLAINTEXT' : 'CIPHERTEXT'}: "${truncatedPlaintext}"
${mode === 'encrypt' ? 'CIPHERTEXT' : 'PLAINTEXT'}: "${truncatedCiphertext}"

Provide a concise analysis covering:
1. STRENGTH OVERVIEW: A simple rating (Weak/Moderate/Strong) for the overall pipeline with brief explanation
2. ALGORITHM REVIEW: Brief assessment of each algorithm (1-2 bullet points only)
3. KEY QUALITY: Brief assessment of key quality/complexity
4. EDUCATIONAL INSIGHTS: 1-2 interesting facts about these algorithms

Keep your response clear, educational, and visually structured.
`;
};

/**
 * Perform cryptographic analysis using the Gemini API
 */
export const performCryptanalysis = async (
  pipeline: { id: string; name: string; key: any }[], 
  plaintext: string, 
  ciphertext: string,
  mode: 'encrypt' | 'decrypt'
): Promise<CryptoAnalysisResult> => {
  try {
    if (!isValidApiKey()) {
      return {
        analysis: '',
        error: 'Missing or invalid API key. Get a key from https://ai.google.dev/ and add it to your .env file.'
      };
    }
    
    const genAI = getGeminiClient();    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", // Using a reliable model that's widely available
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
        }
      ]
    });
    
    const prompt = formatCryptoAnalysisPrompt(pipeline, plaintext, ciphertext, mode);
    
    // Generate content from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return { analysis: text };
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    // Provide helpful error messages
    let errorMessage = "Failed to perform cryptanalysis.";
      if (error.message?.includes("NOT_FOUND")) {
      errorMessage = "Model not found. Please check if the model name is correct.";
    } else if (error.message?.includes("INVALID_ARGUMENT")) {
      errorMessage = "Invalid API request. Please check your input parameters.";
    } else if (error.message?.includes("PERMISSION_DENIED")) {
      errorMessage = "API key is invalid or lacks permission. Get a key from https://ai.google.dev/";
    } else if (error.message?.includes("UNAUTHENTICATED")) {
      errorMessage = "Authentication failed. Verify your API key in the .env file.";
    }
    
    return { 
      analysis: '', 
      error: `${errorMessage} (${error.message})` 
    };
  }
};
