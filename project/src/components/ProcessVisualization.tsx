import React, { useState, useEffect, useRef } from 'react';
import { Algorithm, AlgorithmOrder, AlgorithmKey, OperationMode } from '../types';
import { getAlgorithm } from '../utils/algorithmData';

interface ProcessVisualizationProps {
  inputText: string;
  algorithmOrder: AlgorithmOrder;
  keys: AlgorithmKey;
  mode: OperationMode;
  onResult: (result: string) => void;
  onProcessComplete?: () => void;
}

interface StepResult {
  algorithm: string;
  input: string;
  output: string;
  isComplete: boolean;
  characterHighlights: { index: number; original: string; transformed: string }[];
}

const ProcessVisualization: React.FC<ProcessVisualizationProps> = ({
  inputText,
  algorithmOrder,
  keys,
  mode,
  onResult,
  onProcessComplete
}) => {
  const [steps, setSteps] = useState<StepResult[]>([]);
  const [currentAlgorithmIndex, setCurrentAlgorithmIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [finalResult, setFinalResult] = useState<string>('');
  
  // Animation timing references
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Process the text through the algorithms when inputs change
  useEffect(() => {
    // Cancel any running animations
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    // Reset state
    setSteps([]);
    setCurrentAlgorithmIndex(0);
    setIsProcessing(false);
    setFinalResult('');
    
    // Only start processing if we have text and at least one algorithm
    if (inputText && algorithmOrder.length > 0) {
      processText();
    } else {
      onResult('');
    }
    
    // Cleanup animation timers
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [inputText, algorithmOrder, keys, mode]);
  
  const processText = () => {
    if (!inputText || algorithmOrder.length === 0) {
      return;
    }
    
    setIsProcessing(true);
    
    // For decryption, we need to process algorithms in reverse order
    const orderedAlgorithms = mode === 'decrypt' 
      ? [...algorithmOrder].reverse() 
      : algorithmOrder;
    
    // Create initial steps array with empty results, using the actual processing order
    const initialSteps: StepResult[] = orderedAlgorithms.map(algo => ({
      algorithm: algo.name,
      input: '',
      output: '',
      isComplete: false,
      characterHighlights: []
    }));
    
    setSteps(initialSteps);
    
    // Start with the input text
    let currentInput = inputText;
    
    // Start the animation for the first algorithm
    animateAlgorithmStep(0, orderedAlgorithms, currentInput);
  };
  
  const animateAlgorithmStep = (stepIndex: number, orderedAlgorithms: AlgorithmOrder, stepInput: string) => {
    if (stepIndex >= orderedAlgorithms.length) {
      // All steps completed
      setIsProcessing(false);
      return;
    }
    
    const currentAlgoId = orderedAlgorithms[stepIndex].id;
    const algorithm = getAlgorithm(currentAlgoId);
    
    if (!algorithm) {
      console.error(`Algorithm ${currentAlgoId} not found`);
      setIsProcessing(false);
      return;
    }
    
    // Update the current step with the input
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        input: stepInput,
        output: '',
        isComplete: false,
        characterHighlights: []
      };
      return newSteps;
    });
    
    setCurrentAlgorithmIndex(stepIndex);
    
    // Perform the operation based on the mode
    const operation = mode === 'encrypt' ? algorithm.encrypt : algorithm.decrypt;
    const key = keys[currentAlgoId as keyof AlgorithmKey];
    
    try {
      // Process the entire text at once to get the final result
      const finalOutput = operation(stepInput, key);
      
      // Start animating character by character
      animateCharacterByCharacter(stepIndex, algorithm, stepInput, finalOutput, orderedAlgorithms);
    } catch (error) {
      console.error(`Error processing with ${algorithm.name}:`, error);
      
      // Update the step with the error
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          isComplete: true,
          characterHighlights: []
        };
        return newSteps;
      });
      
      // Stop processing
      setIsProcessing(false);
    }
  };
  
  const animateCharacterByCharacter = (
    stepIndex: number, 
    _algorithm: Algorithm, // Prefixed with underscore to indicate it's unused
    input: string, 
    output: string,
    orderedAlgorithms: AlgorithmOrder
  ) => {
    // Animation timing constants
    const charDelay = 50;  // milliseconds between character animations
    const completionDelay = 500;  // delay after completing a step
    
    let currentOutputLength = 0;
    
    const animateNextChar = () => {
      if (currentOutputLength <= output.length) {
        // Update displayed output and highlight current character
        const currentOutput = output.substring(0, currentOutputLength);
        
        setSteps(prevSteps => {
          const newSteps = [...prevSteps];
          
          // Create highlight information for the current character
          const highlights = currentOutputLength > 0 && currentOutputLength <= input.length
            ? [{ 
                index: currentOutputLength - 1, 
                original: input[currentOutputLength - 1] || '', 
                transformed: output[currentOutputLength - 1] || ''
              }]
            : [];
          
          newSteps[stepIndex] = {
            ...newSteps[stepIndex],
            output: currentOutput,
            isComplete: currentOutputLength === output.length,
            characterHighlights: highlights
          };
          
          return newSteps;
        });
        
        // Move to next character
        currentOutputLength++;
        
        // Schedule next character animation
        animationTimeoutRef.current = setTimeout(animateNextChar, charDelay);
      } else {
        // Step animation completed
        
        // If this is the last step, we're done
        if (stepIndex === orderedAlgorithms.length - 1) {
          setFinalResult(output);
          onResult(output);
          setIsProcessing(false);
          // Notify that the process is complete if callback is provided
          if (onProcessComplete) {
            onProcessComplete();
          }
        } else {
          // Move to the next algorithm after a delay
          animationTimeoutRef.current = setTimeout(() => {
            animateAlgorithmStep(stepIndex + 1, orderedAlgorithms, output);
          }, completionDelay);
        }
      }
    };
    
    // Start the animation
    animateNextChar();
  };
  
  if (algorithmOrder.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6
                     bg-opacity-80 backdrop-blur-md text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Please select at least one algorithm to start the encryption/decryption process.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6
                   bg-opacity-80 backdrop-blur-md transition-all duration-300 ease-in-out">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
        {mode === 'encrypt' ? 'Encryption' : 'Decryption'} Process
      </h2>
      
      {/* Note: Removed the decryption notification banner as requested */}
      
      {isProcessing && <p className="text-blue-500 dark:text-blue-400 mb-4">Processing...</p>}
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`bg-gray-50 dark:bg-gray-700 rounded-md p-3 transition-all duration-500
                      ${index === currentAlgorithmIndex ? 'border-l-4 border-blue-500' : ''}
                      ${index < currentAlgorithmIndex ? 'opacity-80' : ''}
                      ${index > currentAlgorithmIndex ? 'opacity-60' : ''}`}
          >
            <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Step {index + 1}: {step.algorithm}
            </h3>
            
            {step.input && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Input:</p>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all font-mono">
                  {step.input}
                </div>
              </div>
            )}
            
            {step.output && (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Output:</p>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all font-mono">
                  {step.output}
                </div>
              </div>
            )}
            
            {/* Character transformation visualization */}
            {step.characterHighlights.length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900 rounded">
                <div className="flex justify-center items-center space-x-4 font-mono">
                  <span className="text-gray-700 dark:text-gray-300">
                    '{step.characterHighlights[0].original}'
                  </span>
                  <span className="text-blue-600 dark:text-blue-400">→</span>
                  <span className="text-green-600 dark:text-green-400 animate-pulse">
                    '{step.characterHighlights[0].transformed}'
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {finalResult && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-md text-center">
          <p className="text-green-800 dark:text-green-200">
            Process completed successfully!
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessVisualization;