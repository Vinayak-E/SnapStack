import { useEffect, useState, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ImageCard from '../components/ImageCard';
import { getImages, uploadImages, rearrangeImages } from '../services/api';
import { useAppDispatch } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';


interface Image {
  _id: string;
  title: string;
  url: string;
  order: number;
}

const Dashboard = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [files, setFiles] = useState<FileList | null>(null);
  const [titles, setTitles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data } = await getImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles: FileList) => {
    const imageFiles = Array.from(newFiles).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length > 0) {
      const fileArray = new DataTransfer();
      if (files) {
        Array.from(files).forEach(file => fileArray.items.add(file));
      }
      
      imageFiles.forEach(file => fileArray.items.add(file));
      
      setFiles(fileArray.files);
      
      const newTitles = [...titles];
      
      imageFiles.forEach(file => {
        const name = file.name.split('.').slice(0, -1).join('.');
        newTitles.push(name.charAt(0).toUpperCase() + name.slice(1));
      });
      
      setTitles(newTitles);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setUploadProgress(0);
    
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));
    formData.append('titles', JSON.stringify(titles));
    
    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      await uploadImages(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.success('Images uploaded successfully');
      
      setTimeout(() => {
        setFiles(null);
        setTitles([]);
        fetchImages();
        setUploadProgress(0);
      }, 500);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Upload failed';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const moveImage = async (from: number, to: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(from, 1);
    newImages.splice(to, 0, moved);
    setImages(newImages);
    try {
      await rearrangeImages(newImages.map((img) => img._id));
      toast.success('Image order updated');
    } catch (error) {
      console.error('Failed to rearrange images', error);
      toast.error('Failed to update image order');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const newImages = images.filter(img => img._id !== id);
      setImages(newImages);
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Failed to delete image', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Image Gallery
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload, organize, and manage your image collection
            </p>
          </div>
        </div>
        
        <div className="mt-8">
          <form onSubmit={handleUpload}>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-3">
                <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                  <svg 
                    className="h-8 w-8 text-indigo-600 dark:text-indigo-400" 
                    stroke="currentColor" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  <button 
                    type="button"
                    onClick={openFileSelector}
                    className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 focus:outline-none transition-colors duration-200"
                  >
                    Select files
                  </button>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <span className="text-gray-500 dark:text-gray-400"> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {files && files.length > 0 && (
              <div className="mt-6 bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden transition-colors duration-200">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                    Upload Preview ({files.length} {files.length === 1 ? 'image' : 'images'})
                  </h3>
                  
                  {uploadError && (
                    <div className="mt-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
                      <p>{uploadError}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 space-y-4">
                    {Array.from(files).map((file, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <input
                            type="text"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md transition-colors duration-200"
                            placeholder={`Title for ${file.name}`}
                            value={titles[i] || ''}
                            onChange={(e) => {
                              const newTitles = [...titles];
                              newTitles[i] = e.target.value;
                              setTitles(newTitles);
                            }}
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                          onClick={() => {
                            const dt = new DataTransfer();
                            const newFiles = Array.from(files).filter((_, index) => index !== i);
                            newFiles.forEach(file => dt.items.add(file));
                            setFiles(dt.files);
                            
                            const newTitles = [...titles];
                            newTitles.splice(i, 1);
                            setTitles(newTitles);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {isUploading && (
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 dark:text-indigo-400 bg-indigo-200 dark:bg-indigo-900/40">
                              Uploading
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200 dark:bg-indigo-900/30">
                          <div 
                            style={{ width: `${uploadProgress}%` }} 
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 ease-in-out"
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-5 flex flex-col sm:flex-row sm:gap-3">
                    <button
                      type="submit"
                      disabled={isUploading || files.length === 0}
                      className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:bg-indigo-400 dark:disabled:bg-indigo-400/70 transition-colors duration-200"
                    >
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        `Upload ${files.length} ${files.length === 1 ? 'Image' : 'Images'}`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(null);
                        setTitles([]);
                      }}
                      className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
        
        <div className="mt-10">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Images</h2>
            <p className="mt-1 sm:mt-0 text-sm text-gray-500 dark:text-gray-400">
              {images.length} {images.length === 1 ? 'image' : 'images'} in your collection
            </p>
          </div>
          
          {isLoading ? (
            <div className="mt-4 flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-indigo-500 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : images.length === 0 ? (
            <div className="mt-4 text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
              <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                <svg
                  className="h-10 w-10 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No images yet</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Upload some images to see them here.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={openFileSelector}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                >
                  Upload your first image
                </button>
              </div>
            </div>
          ) : (
            <DndProvider backend={HTML5Backend}>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <ImageCard
                    key={image._id}
                    image={image}
                    index={index}
                    moveImage={moveImage}
                    onEdit={async () => {
                      await fetchImages();
                    }}
                    onDelete={handleDeleteImage}
                  />
                ))}
              </div>
            </DndProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;