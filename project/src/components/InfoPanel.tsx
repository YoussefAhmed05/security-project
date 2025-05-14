import React from 'react';
import { X } from 'lucide-react';
import { Algorithm } from '../types';

interface InfoPanelProps {
  algorithm: Algorithm;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ algorithm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md max-h-[90vh] overflow-y-auto
                    shadow-xl transform transition-all duration-300 ease-out
                    animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {algorithm.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
                      transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {algorithm.description}
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Key Space
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {algorithm.keySpace}
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Historical Use
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {algorithm.historicalUse}
            </p>
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Weaknesses
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              {algorithm.weaknesses.map((weakness, index) => (
                <li key={index}>{weakness}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md
                      transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;