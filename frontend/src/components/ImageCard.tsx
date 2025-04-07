import { useDrag, useDrop } from 'react-dnd';
import { useRef, useState } from 'react';
import { editImage, deleteImage } from '../services/api';
import toast from 'react-hot-toast';

interface Image {
  _id: string;
  title: string;
  url: string;
  order: number;
}

interface ImageCardProps {
  image: Image;
  index: number;
  moveImage: (from: number, to: number) => void;
  onEdit: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean; 
  onSelect?: (id: string, selected: boolean) => void; 
  selectionMode?: boolean; 
}

const ImageCard = ({ 
  image, 
  index, 
  moveImage, 
  onEdit, 
  onDelete, 
  isSelected = false, 
  onSelect, 
  selectionMode = false 
}: ImageCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(image.title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag({
    type: 'image',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'image',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  const handleSaveEdit = async () => {
    if (!newTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }
    setIsLoading(true);
    try {
      await editImage(image._id, newTitle);
      onEdit(image._id, newTitle);
      setIsEditing(false);
      toast.success('Image title updated');
    } catch (error) {
      console.error('Failed to update image', error);
      toast.error('Failed to update image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteImage(image._id);
      onDelete(image._id);
    } catch (error) {
      console.error('Failed to delete image', error);
      toast.error('Failed to delete image');
    } finally {
      setIsLoading(false);
      setIsConfirmingDelete(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setNewTitle(image.title);
    }
  };

  return (
    <div 
      ref={ref} 
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all 
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'} 
        ${isSelected ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}
        transform hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {selectionMode && (
        <div className="absolute top-2 left-2 z-10">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => onSelect?.(image._id, e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>
      )}

      <div className="relative aspect-w-4 aspect-h-3 group">
        <img 
          src={image.url} 
          alt={image.title} 
          className="w-full h-full object-cover"
        />
        
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-black/40 
            transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex space-x-2">
            <button
              className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200"
              onClick={() => setIsEditing(true)}
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-gray-200" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              className="p-2 bg-white/80 rounded-full hover:bg-white transition-colors duration-200"
              onClick={() => setIsConfirmingDelete(true)}
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-white dark:bg-gray-800 transition-colors duration-200">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 
                focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-white transition-colors duration-200"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder="Enter image title"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="text-xs bg-white dark:bg-gray-700 px-3 py-1.5 rounded-md 
                  hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => {
                  setIsEditing(false);
                  setNewTitle(image.title);
                }}
              >
                Cancel
              </button>
              <button
                className="text-xs bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1.5 rounded-md 
                  hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200"
                onClick={handleSaveEdit}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : isConfirmingDelete ? (
          <div className="text-center py-1">
            <p className="text-xs text-red-600 dark:text-red-400 mb-2">Delete this image?</p>
            <div className="flex justify-center space-x-2">
              <button
                className="text-xs bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md 
                  hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => setIsConfirmingDelete(false)}
              >
                Cancel
              </button>
              <button
                className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-md 
                  hover:bg-red-700 transition-colors duration-200"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <h3 className="text-gray-900 dark:text-white font-medium text-sm truncate">
              {image.title}
            </h3>
            <div className="flex space-x-2">
              <button
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 
                  dark:hover:text-indigo-300 transition-colors duration-200"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 
                  dark:hover:text-red-300 transition-colors duration-200"
                onClick={() => setIsConfirmingDelete(true)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;