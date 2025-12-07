import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ImageUploader } from './ImageUploader';
import { extractCsvFromImage } from '../services/geminiService';
import { LoadingState } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

// Helper to parse CSV string into 2D array for preview
const parseCSV = (text: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuote && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuote = !inQuote;
      }
    } else if (char === ',' && !inQuote) {
      row.push(current);
      current = "";
    } else if ((char === '\n' || char === '\r') && !inQuote) {
      if (char === '\r' && nextChar === '\n') i++; // Handle CRLF
      row.push(current);
      result.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    result.push(row);
  }
  // Filter out empty rows often caused by trailing newlines
  return result.filter(r => r.length > 0 && (r.length > 1 || r[0] !== ""));
};

export const CsvExtractor: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [csvOutput, setCsvOutput] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'raw' | 'table'>('raw');
  
  const resultsRef = useRef<HTMLDivElement>(null);

  // Memoize parsed data to avoid re-parsing on every render
  const parsedData = useMemo(() => parseCSV(csvOutput), [csvOutput]);

  const handleExtract = async () => {
    if (!image) return;
    
    setStatus(LoadingState.LOADING);
    setErrorMsg(null);
    setCsvOutput('');

    try {
      const result = await extractCsvFromImage(image);
      setCsvOutput(result);
      setStatus(LoadingState.SUCCESS);
      // Automatically switch to table view if it looks like we got data, otherwise raw
      setViewMode('table'); 
    } catch (err) {
      console.error(err);
      setStatus(LoadingState.ERROR);
      setErrorMsg("Failed to process image. Please try again.");
    }
  };
  
  // Auto-scroll to results when extraction is successful
  useEffect(() => {
    if (status === LoadingState.SUCCESS && resultsRef.current) {
        // Use a small timeout to ensure DOM render update if needed
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
  }, [status]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(csvOutput);
  };

  return (
    <div className="flex flex-col space-y-8 pb-12">
      {/* Top Section: Input */}
      <div className="max-w-3xl mx-auto w-full space-y-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Input Image</h3>
            <ImageUploader 
                label="Upload an image containing a table" 
                selectedImage={image} 
                onImageSelect={setImage} 
            />
            
            <div className="mt-6">
                <button
                    onClick={handleExtract}
                    disabled={!image || status === LoadingState.LOADING}
                    className={`w-full flex items-center justify-center py-3 px-4 rounded-xl font-semibold shadow-sm transition-all
                        ${!image || status === LoadingState.LOADING 
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        }`}
                >
                    {status === LoadingState.LOADING ? (
                        <>
                            <LoadingSpinner />
                            <span className="ml-2">Extracting Data...</span>
                        </>
                    ) : (
                        'Convert to CSV'
                    )}
                </button>
                {errorMsg && (
                    <p className="mt-3 text-sm text-red-500 text-center">{errorMsg}</p>
                )}
            </div>
            
            <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <h4 className="font-medium text-blue-900 mb-1 text-sm">Tips for best results:</h4>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1 ml-1">
                    <li>Ensure the image is clear and well-lit.</li>
                    <li>Avoid handwriting; printed text works best.</li>
                    <li>Make sure the entire table is visible in the frame.</li>
                </ul>
            </div>
        </div>
      </div>

      {/* Bottom Section: Output */}
      <div ref={resultsRef} className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50 gap-4">
            <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-slate-800">Extracted Data</h3>
                {status === LoadingState.SUCCESS && (
                    <div className="flex bg-slate-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('raw')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'raw' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Raw CSV
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Table Preview
                        </button>
                    </div>
                )}
            </div>
            {csvOutput && (
                 <button 
                    onClick={copyToClipboard}
                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors ml-auto sm:ml-0"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy CSV
                </button>
            )}
        </div>
        
        <div className="flex-1 relative bg-slate-50 overflow-auto">
            {status === LoadingState.IDLE && !csvOutput && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                    <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Upload an image to extract data</p>
                </div>
            )}

             {status === LoadingState.LOADING && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 backdrop-blur-sm">
                      <LoadingSpinner />
                      <p className="mt-4 text-slate-600 font-medium">Processing image...</p>
                 </div>
             )}

            {csvOutput && (
                viewMode === 'raw' ? (
                    <textarea
                        className="w-full h-full min-h-[500px] p-6 bg-slate-50 font-mono text-sm text-slate-700 resize-none outline-none"
                        value={csvOutput}
                        readOnly
                        spellCheck={false}
                    />
                ) : (
                    <div className="p-6 min-w-full inline-block align-middle">
                        <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-white">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <tbody className="divide-y divide-slate-200">
                                        {parsedData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex === 0 ? "bg-slate-50 font-semibold" : "hover:bg-slate-50/50"}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-700 border-r border-slate-100 last:border-r-0 max-w-sm truncate hover:whitespace-normal hover:overflow-visible hover:z-10 hover:bg-white hover:shadow-lg transition-all">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {parsedData.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    Could not parse table data. Check Raw CSV view.
                                </div>
                            )}
                        </div>
                    </div>
                )
            )}
        </div>
      </div>
    </div>
  );
};