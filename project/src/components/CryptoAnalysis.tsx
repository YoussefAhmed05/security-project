import React, { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Shield, BookOpen, Lightbulb, Zap } from 'lucide-react';
import { useCrypto } from '../context/CryptoContext';
import { performCryptanalysis } from '../utils/GeminiService';

interface CryptoAnalysisProps {
  isVisible: boolean;
  isProcessComplete: boolean;
}

/**
 * Format the analysis text with enhanced HTML styling
 */
const formatAnalysis = (text: string): string => {
  // Replace emoji text markers with actual emojis
  const emojiMap: Record<string, string> = {
    ':warning:': '⚠️',
    ':key:': '🔑',
    ':lock:': '🔒',
    ':unlock:': '🔓',
    ':shield:': '🛡️',
    ':bulb:': '💡',
    ':star:': '⭐',
    ':rocket:': '🚀',
    ':thumbsup:': '👍',
    ':thumbsdown:': '👎',
    ':check:': '✅',
    ':cross:': '❌',
  };
  
  // Replace emoji markers
  let formattedText = text;
  Object.entries(emojiMap).forEach(([marker, emoji]) => {
    formattedText = formattedText.replace(new RegExp(marker, 'g'), emoji);
  });
  
  // Convert markdown-like headings to styled HTML
  formattedText = formattedText
    .replace(/^# (.*?)$/gm, '<h2 class="text-xl font-bold text-purple-600 dark:text-purple-400 mt-4 mb-2">$1</h2>')
    .replace(/^## (.*?)$/gm, '<h3 class="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-3 mb-2">$1</h3>')
    .replace(/^### (.*?)$/gm, '<h4 class="text-base font-medium text-indigo-600 dark:text-indigo-400 mt-2 mb-1">$1</h4>');
    
  // Style bullet points
  formattedText = formattedText.replace(/^- (.*?)$/gm, '<li class="ml-4 mb-1">$1</li>');
  formattedText = formattedText.replace(/(<li.*<\/li>(\n|$))+/g, '<ul class="list-disc my-2 pl-2">$&</ul>');
    // Handle paragraphs
  formattedText = formattedText.replace(/^(?!(#|<[a-zA-Z])).+$/gm, '<p class="mb-2">$&</p>');
  
  // Convert newlines to line breaks
  formattedText = formattedText.replace(/\n(?!<)/g, '<br>');
  // Improve display of plaintext and ciphertext
  formattedText = formattedText.replace(
    /(?:PLAINTEXT|CIPHERTEXT):\s*"([^"]+)"/gi, 
    (match, text) => {
      // Create a properly formatted display for plaintext/ciphertext with scrolling
      const label = match.split(':')[0];
      // Display full text with proper word wrapping
      
      return `<div class="mb-3">
        <strong class="text-blue-600 dark:text-blue-400">${label}:</strong>
        <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 mt-1 overflow-x-auto max-w-full">
          <code class="text-sm font-mono break-all whitespace-normal overflow-wrap-anywhere max-w-full block">${text}</code>
          ${text.length > 40 ? 
            `<div class="text-xs text-gray-500 mt-1">(${text.length} characters)</div>` : 
            ''}
        </div>
      </div>`;
    }
  );
  
  // Highlight key terms
  formattedText = formattedText
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-gray-900 dark:text-gray-100">$1</span>')
    .replace(/\*(.*?)\*/g, '<em class="text-gray-800 dark:text-gray-200">$1</em>');
    
  // Add special highlighting for security ratings
  formattedText = formattedText
    .replace(/\b(Weak|weak)\b/g, '<span class="text-red-500 font-semibold">Weak</span>')
    .replace(/\b(Moderate|moderate)\b/g, '<span class="text-yellow-500 font-semibold">Moderate</span>')
    .replace(/\b(Strong|strong)\b/g, '<span class="text-green-500 font-semibold">Strong</span>');
    
  return formattedText;
};

const CryptoAnalysis: React.FC<CryptoAnalysisProps> = ({ isVisible, isProcessComplete }) => {
  const { inputText, outputText, algorithmOrder, keys, mode } = useCrypto();
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track algorithm configuration to detect changes
  const [lastConfig, setLastConfig] = useState<{
    inputText: string;
    outputText: string;
    algorithmIds: string;
    keys: string;
    mode: string;
  } | null>(null);
  
  // No need to reset analysis when visibility changes
  // This allows preserving the analysis when toggling visibility
  
  // Reset analysis when inputs change
  useEffect(() => {
    // Create a string representation of the current configuration
    const currentConfig = {
      inputText,
      outputText,
      algorithmIds: JSON.stringify(algorithmOrder.map(a => a.id)),
      keys: JSON.stringify(keys),
      mode
    };
    
    const configStr = JSON.stringify(currentConfig);
    const lastConfigStr = lastConfig ? JSON.stringify(lastConfig) : "";
    
    // If configuration has changed, reset the analysis state
    if (lastConfigStr && configStr !== lastConfigStr) {
      setHasRunAnalysis(false); // Reset to indicate we need a new analysis
    }
    
    // Update last config
    setLastConfig(currentConfig);
  }, [inputText, outputText, algorithmOrder, keys, mode]);
  
  // Track whether we need to run a new analysis
  const [hasRunAnalysis, setHasRunAnalysis] = useState<boolean>(false);
  
  // Run analysis when processing completes and component is visible
  useEffect(() => {
    const runAnalysis = async () => {
      // Only run analysis if:
      // 1. It's visible
      // 2. Process is complete
      // 3. We have output
      // 4. We have algorithms
      // 5. We haven't already run an analysis OR something has changed since last run
      if (isVisible && isProcessComplete && outputText && algorithmOrder.length > 0 && !hasRunAnalysis) {
        setIsLoading(true);
        setError(null);
        
        try {
          // Format the algorithm pipeline with keys for analysis
          const pipeline = algorithmOrder.map(algo => ({
            id: algo.id,
            name: algo.name,
            key: keys[algo.id as keyof typeof keys]
          }));
          
          const result = await performCryptanalysis(
            pipeline,
            inputText,
            outputText,
            mode
          );
          
          if (result.error) {
            setError(result.error);
          } else {
            setAnalysis(result.analysis);
            setHasRunAnalysis(true); // Mark that we've run the analysis
          }
        } catch (error) {
          setError('Failed to perform cryptographic analysis');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    runAnalysis();
  }, [isProcessComplete, isVisible, inputText, outputText, algorithmOrder, keys, mode, hasRunAnalysis]);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg my-6 bg-opacity-80 backdrop-blur-md transition-all duration-300 ease-in-out border border-purple-100 dark:border-purple-900 max-w-full">
      <div className="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Zap className="text-purple-600 dark:text-purple-400 mr-2" size={20} />
          <span>AI Cryptographic Analysis</span>
        </h2>
    
      </div>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 size={36} className="animate-spin text-purple-600 dark:text-purple-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Analyzing your cryptographic pipeline...
          </p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="text-red-500 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" size={18} />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Analysis Error
              </h3>
              <div className="mt-1 text-sm text-red-700 dark:text-red-200">
                <p>{error}</p>
                {error.includes('API key') && (
                  <p className="mt-2">
                    <a 
                      href="https://ai.google.dev/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 underline"
                    >
                      Get a Gemini API key
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
        {!isLoading && !error && analysis && (
        <div className="prose dark:prose-invert max-w-none">
          <div 
            className="analysis-content text-gray-700 dark:text-gray-300 p-2 overflow-hidden"
            style={{ 
              wordBreak: 'break-word', 
              overflowWrap: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: formatAnalysis(analysis) }}
          />
        </div>
      )}
      
      {!isLoading && !error && !analysis && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Lightbulb className="text-yellow-400 mb-3" size={28} />
          <p className="text-gray-500 dark:text-gray-400 mb-1">
            Complete the encryption/decryption process to generate an analysis.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 max-w-md">
            The AI will analyze your encryption pipeline, evaluate algorithm strength, 
            and provide educational insights about your cryptographic choices.
          </p>
        </div>
      )}
    </div>
  );
};

export default CryptoAnalysis;
