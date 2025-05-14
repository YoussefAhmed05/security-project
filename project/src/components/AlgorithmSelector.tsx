import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Info, X } from 'lucide-react';
import { Algorithm, AlgorithmOrder } from '../types';
import InfoPanel from './InfoPanel';

interface SortableItemProps {
  id: string;
  name: string;
  onRemove: (id: string) => void;
  onShowInfo: (id: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, name, onRemove, onShowInfo }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 shadow-sm flex items-center justify-between
                bg-opacity-90 backdrop-blur-sm cursor-move
                border border-gray-200 dark:border-gray-700 transition-all duration-200"
      {...attributes}
    >
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2" {...listeners}>
          <GripVertical size={16} />
        </span>
        <span className="font-medium text-gray-800 dark:text-gray-200">{name}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onShowInfo(id)}
          className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400
                    transition-colors duration-200"
          title="Show information"
        >
          <Info size={16} />
        </button>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400
                    transition-colors duration-200"
          title="Remove algorithm"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

interface AlgorithmSelectorProps {
  availableAlgorithms: Algorithm[];
  selectedAlgorithms: AlgorithmOrder;
  onOrderChange: (newOrder: AlgorithmOrder) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  availableAlgorithms,
  selectedAlgorithms,
  onOrderChange
}) => {
  const [showInfoForAlgo, setShowInfoForAlgo] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = selectedAlgorithms.findIndex(item => item.id === active.id);
      const newIndex = selectedAlgorithms.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(selectedAlgorithms, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  };
  
  const handleAddAlgorithm = (algo: Algorithm) => {
    // Only add if not already in the list
    if (!selectedAlgorithms.some(item => item.id === algo.id)) {
      onOrderChange([...selectedAlgorithms, { id: algo.id, name: algo.name }]);
    }
  };
  
  const handleRemoveAlgorithm = (id: string) => {
    onOrderChange(selectedAlgorithms.filter(item => item.id !== id));
  };
  
  // Get algorithms that aren't selected yet
  const unselectedAlgorithms = availableAlgorithms.filter(
    algo => !selectedAlgorithms.some(item => item.id === algo.id)
  );
  
  // Find the algorithm for which we're showing info
  const algorithmWithInfo = availableAlgorithms.find(algo => algo.id === showInfoForAlgo);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg mb-6
                   bg-opacity-80 backdrop-blur-md transition-all duration-300 ease-in-out">
      <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
        Algorithm Order
      </h2>
      
      {/* Selected algorithms (sortable) */}
      {selectedAlgorithms.length > 0 ? (
        <div className="mb-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={selectedAlgorithms.map(item => item.id)}>
              {selectedAlgorithms.map(item => (
                <SortableItem 
                  key={item.id} 
                  id={item.id} 
                  name={item.name} 
                  onRemove={handleRemoveAlgorithm}
                  onShowInfo={(id) => setShowInfoForAlgo(id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Drag to reorder algorithms. The order affects how encryption/decryption is chained.
          </p>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No algorithms selected. Add at least one algorithm below.
        </p>
      )}
      
      {/* Available algorithms */}
      {unselectedAlgorithms.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Available Algorithms
          </h3>
          <div className="flex flex-wrap gap-2">
            {unselectedAlgorithms.map(algo => (
              <button
                key={algo.id}
                onClick={() => handleAddAlgorithm(algo)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm
                          hover:bg-blue-200 transition-colors duration-200
                          dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
              >
                + {algo.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Algorithm info modal */}
      {showInfoForAlgo && algorithmWithInfo && (
        <InfoPanel
          algorithm={algorithmWithInfo}
          onClose={() => setShowInfoForAlgo(null)}
        />
      )}
    </div>
  );
};

export default AlgorithmSelector;