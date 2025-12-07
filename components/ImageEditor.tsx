import React, { useState } from 'react';
import { ImageUploader } from './ImageUploader';
import { editImageWithPrompt } from '../services/geminiService';
import { LoadingState } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

export const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!image || !prompt.trim()) return;

    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    setResultImage(null);

    try {
      const result = await editImageWithPrompt(image, prompt);
      if (result) {
        setResultImage(`data:${result.mimeType};base64,${result.data}`);
        setStatus(LoadingState.SUCCESS);
      } else {
        throw new Error("No image data received");
      }
    } catch (err) {
      console.error(err);
      setStatus(LoadingState.ERROR);
      setErrorMsg("Failed to edit image. The model might be busy or the request invalid. Try a different prompt.");
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="flex flex-col space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Original Image</h3>
                <ImageUploader 
                    label="Upload an image to edit" 
                    selectedImage={image} 
                    onImageSelect={setImage} 
                />
                
                <div className="mt-6 space-y-2">
                    <label className="block text-sm font-medium text-slate-700">How would you like to edit this image?</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., 'Add a retro filter', 'Make it snowy', 'Add fireworks'"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && image && prompt.trim() && status !== LoadingState.LOADING) {
                                    handleEdit();
                                }
                            }}
                        />
                        <div className="absolute right-2 top-2">
                             <kbd className="hidden sm:inline-block px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-400 font-sans shadow-sm">Enter</kbd>
                        </div>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleEdit}
                        disabled={!image || !prompt.trim() || status === LoadingState.LOADING}
                        className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-semibold shadow-sm transition-all
                            ${!image || !prompt.trim() || status === LoadingState.LOADING 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                            }`}
                    >
                        {status === LoadingState.LOADING ? (
                            <>
                                <LoadingSpinner />
                                <span className="ml-2">Generating...</span>
                            </>
                        ) : (
                            'Generate Edit'
                        )}
                    </button>
                    {errorMsg && (
                        <p className="mt-3 text-sm text-red-500 text-center">{errorMsg}</p>
                    )}
                </div>
            </div>
            
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                 <h4 className="font-medium text-emerald-900 mb-1">Editing Ideas:</h4>
                 <div className="flex flex-wrap gap-2 mt-2">
                    {['Add a cinematic lighting', 'Turn into a sketch', 'Make it cyberpunk style', 'Add a cat next to me'].map((idea) => (
                        <button 
                            key={idea}
                            onClick={() => setPrompt(idea)}
                            className="text-xs bg-white text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                        >
                            {idea}
                        </button>
                    ))}
                 </div>
            </div>
        </div>

        {/* Right Column: Result */}
        <div className="flex flex-col h-full min-h-[400px]">
             <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-lg font-semibold text-slate-800">Result</h3>
                     {resultImage && (
                        <a 
                            href={resultImage} 
                            download="edited-image.png"
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Download
                        </a>
                     )}
                </div>
                
                <div className="flex-1 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative">
                    {status === LoadingState.LOADING && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                            <p className="text-slate-600 font-medium animate-pulse">Designing your image...</p>
                        </div>
                    )}
                    
                    {resultImage ? (
                        <img 
                            src={resultImage} 
                            alt="Edited result" 
                            className="max-w-full max-h-full object-contain shadow-lg" 
                        />
                    ) : (
                        <div className="text-center p-8 text-slate-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                             </svg>
                             <p>Your edited image will appear here</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};
