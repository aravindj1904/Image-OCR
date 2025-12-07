import React, { useState } from 'react';
import { CsvExtractor } from './components/CsvExtractor';
import { ImageEditor } from './components/ImageEditor';
import { AppMode } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CSV_EXTRACTOR);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                Gemini Studio
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex justify-center mb-10">
            <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm inline-flex">
                <button
                    onClick={() => setMode(AppMode.CSV_EXTRACTOR)}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        mode === AppMode.CSV_EXTRACTOR 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Image to CSV
                </button>
                <button
                    onClick={() => setMode(AppMode.IMAGE_EDITOR)}
                    className={`flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        mode === AppMode.IMAGE_EDITOR 
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Magic Editor
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="transition-all duration-500 ease-in-out">
            {mode === AppMode.CSV_EXTRACTOR ? <CsvExtractor /> : <ImageEditor />}
        </div>
      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        Powered by Gemini 2.5 Flash & Nano Banana
      </footer>
    </div>
  );
};

export default App;
