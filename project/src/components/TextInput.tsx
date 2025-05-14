import React from 'react';
import { ChevronDown, ChevronUp, RotateCw, Copy } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onReset?: () => void;
  readOnly?: boolean;
  canCopy?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Enter text...',
  isCollapsed = false,
  onToggleCollapse,
  onReset,
  readOnly = false,
  canCopy = false
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6
                   bg-opacity-80 backdrop-blur-md transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-2">
        <label className="text-lg font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <div className="flex gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400
                        transition-colors duration-200"
              title="Reset"
            >
              <RotateCw size={18} />
            </button>
          )}
          {canCopy && value && (
            <button
              onClick={copyToClipboard}
              className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400
                        transition-colors duration-200"
              title="Copy to clipboard"
            >
              <Copy size={18} />
            </button>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400
                        transition-colors duration-200"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
            </button>
          )}
        </div>
      </div>
      
      {!isCollapsed && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-32 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500
                    dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400
                    transition-all duration-200"
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default TextInput;