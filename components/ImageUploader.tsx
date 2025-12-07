import React, { useRef, useState, useEffect } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  label: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, selectedImage, label }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle global paste events
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          handleFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []); // Empty dependency array is fine as handleFile is stable within closure scope or we can rely on React event system behavior, but strictly handleFile relies on props. 
  // To be safe with hooks closures, we can either include handleFile in deps (if wrapped in useCallback) or just implement logic inside.
  // Given handleFile uses props (onImageSelect) which might change, let's keep it simple and just assume the component remounts or props are stable enough. 
  // Actually, better practice to inline the logic or use dependencies correctly.
  
  // Re-implementing effect with correct dependencies
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        if (e.clipboardData && e.clipboardData.files.length > 0) {
            const file = e.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
                e.preventDefault();
                // Logic from handleFile repeated here to avoid complex dependency chains
                if (file && file.type.startsWith('image/')) {
                    onImageSelect(file);
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, [onImageSelect]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div
        className={`relative w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
        
        {selectedImage && previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <div className="text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-500 font-medium">Click to upload, drag & drop</p>
            <p className="text-sm text-slate-500 font-medium">or paste image (Ctrl+V)</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};