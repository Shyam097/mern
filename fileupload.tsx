
import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileAccepted, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileAccepted(files[0]);
    }
  }, [onFileAccepted]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileAccepted(files[0]);
    }
  };


  return (
    <div className="max-w-3xl mx-auto mt-10 text-center">
      <input
        id="file-upload"
        type="file"
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        disabled={isLoading}
      />
      
      <label
        htmlFor="file-upload"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary border-accent hover:bg-accent/50 transition-all duration-300 ${isDragging ? 'border-cyan-flare scale-105' : ''}`}
      >
        <div className="flex flex-row items-center justify-center gap-4">
            <UploadCloud className="w-8 h-8 text-highlight" />
            <p className="text-lg text-highlight">
                <span className="font-semibold text-cyan-flare">Ready when you are!</span> Drop your Excel file here or click to select.
            </p>
        </div>
      </label>
      
      {isLoading && (
        <div className="mt-6 flex items-center justify-center text-lg">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-cyan-flare" />
          <p>Let's see what we've got... Analyzing your spreadsheet.</p>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-center p-4 text-red-400 bg-red-900/50 border border-red-500 rounded-lg">
          <AlertCircle className="mr-3 h-6 w-6" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
