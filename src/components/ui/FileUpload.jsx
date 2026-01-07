// src/components/ui/FileUpload.jsx
import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

const FileUpload = ({
  label,
  accept,
  multiple = false,
  maxSize,
  onChange,
  error,
  disabled = false,
  className = '',
  ...props
}) => {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);

    // Validate file size
    if (maxSize) {
      const oversizedFiles = fileArray.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        alert(`Some files exceed the maximum size limit of ${maxSize / 1024 / 1024}MB`);
        return;
      }
    }

    const newFiles = multiple ? [...files, ...fileArray] : fileArray;
    setFiles(newFiles);
    onChange && onChange(multiple ? newFiles : fileArray[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onChange && onChange(multiple ? newFiles : null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {multiple ? 'Drop files here or click to upload' : 'Drop file here or click to upload'}
          </p>
          {accept && (
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: {accept.replace(/\./g, '').toUpperCase()}
            </p>
          )}
          {maxSize && (
            <p className="text-xs text-gray-500">
              Max size: {maxSize / 1024 / 1024}MB
            </p>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
        {...props}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-600 focus:outline-none"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;