// week4project/app/components/file-uploader.tsx
import React, { useCallback } from 'react';

interface FileUploaderProps {
  onFileChange: (file: File | null) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      onFileChange(file);
    },
    [onFileChange]
  );

  return (
    <div>
      <input type="file" accept=".txt" onChange={handleFileSelect} />
    </div>
  );
};

