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

  useEffect(() => {
    // Reset states when visibility changes
    if (!isVisible) {
      setAnalysis('');
      setError(null);
    }
  }, [isVisible]);
  
  // Run analysis when processing completes and component is visible
  useEffect(() => {
    const runAnalysis = async () => {
      if (isVisible && isProcessComplete && outputText && algorithmOrder.length > 0) {
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
  }, [isProcessComplete, isVisible, inputText, outputText, algorithmOrder, keys, mode]);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg my-6 bg-opacity-80 backdrop-blur-md transition-all duration-300 ease-in-out border border-purple-100 dark:border-purple-900">
      <div className="flex items-center justify-between mb-5 border-b border-gray-100 dark:border-gray-700 pb-3">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Zap className="text-purple-600 dark:text-purple-400 mr-2" size={20} />
          <span>AI Cryptographic Analysis</span>
        </h2>
        <div className="flex items-center">
          <Shield className="text-blue-500 dark:text-blue-400 w-4 h-4 mr-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Powered by Google Gemini</span>
        </div>
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
            className="analysis-content text-gray-700 dark:text-gray-300 p-2"
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
