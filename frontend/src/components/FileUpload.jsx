import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileUpload, FaFileCsv, FaTimesCircle } from 'react-icons/fa';

const FileUpload = ({ onFilesSelected }) => {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFilesSelected(newFiles);
  }, [files, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
  });

  const removeFile = (fileToRemove) => {
    const newFiles = files.filter(file => file !== fileToRemove);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <FaFileUpload className="w-12 h-12 mb-4" />
          {isDragActive ? (
            <p>Lepaskan file di sini...</p>
          ) : (
            <p>Seret & lepas file CSV di sini, atau klik untuk memilih file</p>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">File Terpilih:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <FaFileCsv className="text-green-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{file.name}</span>
                </div>
                <button onClick={() => removeFile(file)} className="text-red-500 hover:text-red-700">
                  <FaTimesCircle />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
