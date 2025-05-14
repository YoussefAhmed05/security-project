import React from 'react';
import { Lock, Unlock, RotateCw, RefreshCw, ArrowDownUp, Sparkles } from 'lucide-react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CryptoProvider, useCrypto } from './context/CryptoContext';
import TextInput from './components/TextInput';
import AlgorithmSelector from './components/AlgorithmSelector';
import KeyInput from './components/KeyInput';
import ProcessVisualization from './components/ProcessVisualization';
import CryptoAnalysis from './components/CryptoAnalysis';
import ThemeToggle from './components/ThemeToggle';
import { algorithmData, getExampleText } from './utils/algorithmData';

const AppContent: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const {
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
  } = useCrypto();
  
  const [isInputCollapsed, setIsInputCollapsed] = React.useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = React.useState(false);
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);
  const [showAnalysis, setShowAnalysis] = React.useState(false);
  const [isProcessComplete, setIsProcessComplete] = React.useState(false);
  
  const checkAllKeysValid = () => {
    return algorithmOrder.every(algo => {
      const algorithm = algorithmData.find(a => a.id === algo.id);
      return algorithm && algorithm.keyValidator(keys[algo.id as keyof typeof keys]);
    });
  };
  
  const handleResetAll = () => {
    resetAll();
    setShowValidationErrors(false);
    setIsProcessComplete(false);
  };
  
  const handleToggleMode = () => {
    toggleMode();
    setShowValidationErrors(false);
    setIsProcessComplete(false);
  };
  
  const handleLoadExampleText = () => {
    setInputText(getExampleText());
    setIsProcessComplete(false);
  };
  
  const handleInputChange = (text: string) => {
    setInputText(text);
    setIsProcessComplete(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 
                    transition-all duration-300 ease-in-out">
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <div className="container mx-auto py-16 px-4 sm:px-6 max-w-6xl">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4
                         gradient-text animate-gradient bg-clip-text text-transparent
                         bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Classical Cryptography Visualizer
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encrypt and decrypt messages using chained classical algorithms with step-by-step visualization.
          </p>
        </header>
        
        <div className="flex flex-wrap -mx-4">
          {/* Configuration Panel */}
          <div className="w-full lg:w-1/3 px-4 mb-8">
            <div className="sticky top-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6
                            bg-opacity-80 backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                    Configuration
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleToggleMode}
                      className="p-2 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-800
                                dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200
                                transition-colors duration-200 flex items-center gap-1"
                      title={mode === 'encrypt' ? 'Switch to decryption' : 'Switch to encryption'}
                    >
                      {mode === 'encrypt' ? <Lock size={16} /> : <Unlock size={16} />}
                      <span>{mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}</span>
                      <ArrowDownUp size={14} />
                    </button>
                    <button
                      onClick={handleResetAll}
                      className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800
                                dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200
                                transition-colors duration-200"
                      title="Reset all"
                    >
                      <RotateCw size={16} />
                    </button>
                    <button
                      onClick={handleLoadExampleText}
                      className="p-2 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-800
                                dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-200
                                transition-colors duration-200"
                      title="Load example text"
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Algorithm Selector */}
                <AlgorithmSelector
                  availableAlgorithms={algorithmData}
                  selectedAlgorithms={algorithmOrder}
                  onOrderChange={(newOrder) => {
                    setAlgorithmOrder(newOrder);
                    setIsProcessComplete(false);
                  }}
                />
                
                {/* Key Inputs for Selected Algorithms */}
                {algorithmOrder.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-4">
                      Algorithm Keys
                    </h3>
                    
                    {algorithmOrder.map(algo => (
                      <KeyInput
                        key={algo.id}
                        algorithmId={algo.id}
                        value={keys[algo.id as keyof typeof keys]}
                        onChange={(newKey) => {
                          updateKey(algo.id, newKey);
                          setIsProcessComplete(false);
                        }}
                        showValidationErrors={showValidationErrors}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Input, Visualization, and Output */}
          <div className="w-full lg:w-2/3 px-4">
            {/* Input Text */}
            <TextInput
              value={inputText}
              onChange={handleInputChange}
              label={mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
              placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter text to decrypt...'}
              isCollapsed={isInputCollapsed}
              onToggleCollapse={() => setIsInputCollapsed(!isInputCollapsed)}
              onReset={() => {
                setInputText('');
                setIsProcessComplete(false);
              }}
            />
            
            {/* Processing Visualization */}
            {inputText && algorithmOrder.length > 0 && (
              <ProcessVisualization
                inputText={inputText}
                algorithmOrder={algorithmOrder}
                keys={keys}
                mode={mode}
                onResult={setOutputText}
                onProcessComplete={() => setIsProcessComplete(true)}
              />
            )}
            
            {/* AI Cryptanalysis Button */}
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)} 
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2">
                <Sparkles size={18} />
                {showAnalysis ? 'Hide AI Analysis' : 'Show AI Analysis'}
              </button>
            </div>
            
            {/* Cryptanalysis Component */}
            <CryptoAnalysis isVisible={showAnalysis} isProcessComplete={isProcessComplete} />
            
            {/* Output Text */}
            <TextInput
              value={outputText}
              onChange={setOutputText}
              label={mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'}
              isCollapsed={isOutputCollapsed}
              onToggleCollapse={() => setIsOutputCollapsed(!isOutputCollapsed)}
              readOnly
              canCopy
            />
          </div>
        </div>
      </div>
      
      <footer className="py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>Classical Cryptography Visualizer &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <CryptoProvider>
        <AppContent />
      </CryptoProvider>
    </ThemeProvider>
  );
}

export default App;