import React, { useState, useRef } from 'react';
import Papa from 'papaparse';

const UploadIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const SparkleIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 2.5C11.5 2.5 12 8 18 8.5C12 9 11.5 14.5 11.5 14.5C11.5 14.5 11 9 5 8.5C11 8 11.5 2.5 11.5 2.5Z" fill="#a8c7fa" stroke="#a8c7fa" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.5 14.5C19.5 14.5 20 18 24 18.5C20 19 19.5 22.5 19.5 22.5C19.5 22.5 19 19 15 18.5C19 18 19.5 14.5 19.5 14.5Z" fill="#f28b82" stroke="#f28b82" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 17.5C5.5 17.5 6 19.5 8.5 20C6 20.5 5.5 22.5 5.5 22.5C5.5 22.5 5 20.5 2.5 20C5 19.5 5.5 17.5 5.5 17.5Z" fill="#81c995" stroke="#81c995" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home({ onQuizGenerate }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const processCSV = (file) => {
    setError(null);
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const mappedQuestions = results.data.map((row, i) => {
            if (!row['Question']) {
              throw new Error(`Row ${i + 1} is missing a "Question" column.`);
            }

            const correctAnswer = row['Correct_Option']?.trim().toUpperCase();

            const optA = row['Option_A'] || "Option A";
            const optB = row['Option_B'] || "Option B";
            const optC = row['Option_C'] || "Option C";
            const optD = row['Option_D'] || "Option D";
            const explanation = row['Explanation'] || "";

            return {
              id: i + 1,
              text: row['Question'],
              options: [
                {
                  id: 'A',
                  text: optA,
                  isCorrect: correctAnswer === 'A',
                  explanationTitle: correctAnswer !== 'A' ? "Not quite" : "Correct!",
                  explanation: explanation
                },
                {
                  id: 'B',
                  text: optB,
                  isCorrect: correctAnswer === 'B',
                  explanationTitle: correctAnswer !== 'B' ? "Not quite" : "Correct!",
                  explanation: explanation
                },
                {
                  id: 'C',
                  text: optC,
                  isCorrect: correctAnswer === 'C',
                  explanationTitle: correctAnswer !== 'C' ? "Not quite" : "Correct!",
                  explanation: explanation
                },
                {
                  id: 'D',
                  text: optD,
                  isCorrect: correctAnswer === 'D',
                  explanationTitle: correctAnswer !== 'D' ? "Not quite" : "Correct!",
                  explanation: explanation
                }
              ]
            };
          });

          if (mappedQuestions.length === 0) {
            setError("No valid questions found in the CSV.");
          } else {
            onQuizGenerate(mappedQuestions);
          }
        } catch (e) {
          setError(e.message || "Error processing the CSV structure.");
        }
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCSV(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processCSV(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative overflow-hidden bg-[#131314] text-[#e3e3e3] font-['Google_Sans_Flex']">

      {/* Header */}
      <header className="flex items-center justify-start px-8 pt-6 pb-4 z-10 w-full absolue top-0 shrink-0 border-b border-transparent">
        <div className="text-[24px] font-normal tracking-wide text-[#e3e3e3]">Gemini</div>
        <div className="ml-3 px-2 py-0.5 rounded-full bg-[#1e1f20] border border-[#444746]/50 text-[11px] text-[#a8c7fa] font-medium tracking-wide uppercase">Workspace</div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 px-6 flex flex-col justify-center items-center pb-24 z-10 w-full relative">
        
        {/* Hero Title */}
        <div className="mb-14 flex flex-col items-center text-center max-w-[600px] z-20">
          <div className="animate-float mb-6">
            <SparkleIcon />
          </div>
          <h1 className="text-[44px] md:text-[56px] leading-[1.1] font-light text-[#e3e3e3] tracking-tight">
            Generate. <br className="md:hidden" />Learning.
          </h1>
        </div>

        {/* Upload Button */}
        <div 
          className="relative group cursor-pointer mt-4"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleChange} 
            accept=".csv"
            className="hidden" 
          />
          
          {/* Glowing Aura */}
          <div className={`absolute -inset-1 bg-gradient-to-r from-[#a8c7fa] via-[#e3e3e3] to-[#f28b82] rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 group-hover:duration-200 ${isDragging ? 'opacity-100 scale-105 animate-pulse' : ''}`}></div>
          
          {/* Button Surface */}
          <button className="relative flex items-center justify-center gap-3 bg-[#131314] px-10 py-4 rounded-full text-[#e3e3e3] font-medium text-[16px] border border-[#444746] transition-all group-hover:bg-[#1e1f20]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${isDragging ? 'text-[#f28b82]' : 'text-[#a8c7fa]'}`}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {isDragging ? "Drop CSV Here" : "Upload CSV File"}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="absolute bottom-[20%] w-[90%] max-w-[500px] bg-[#3c1f1f]/80 backdrop-blur-xl border border-[#f28b82]/40 text-[#f28b82] px-6 py-4 rounded-3xl text-[15px] flex items-center justify-center gap-4 shadow-[0_10px_40px_rgba(242,139,130,0.2)] animate-in slide-in-from-bottom-8 fade-in duration-500 z-50">
            <span className="shrink-0 animate-pulse text-[#f28b82]"><FileIcon /></span>
            <span className="leading-snug font-medium tracking-wide">{error}</span>
          </div>
        )}

      </div>

      {/* Sleek Bottom Bar Drawer Replacement */}
      <div className="absolute bottom-0 w-full text-center py-6 px-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-10 pointer-events-none">
         <p className="text-[#8e918f] text-[13px] font-medium tracking-widest uppercase mb-3 pointer-events-auto">Required CSV Format</p>
         <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[13px] opacity-70">
            <span className="font-mono text-[#e3e3e3] px-2 py-1 bg-[#1e1f20]/50 rounded-md">Question</span>
            <span className="font-mono text-[#c4c7c5]">Option_A</span>
            <span className="font-mono text-[#c4c7c5]">Option_B</span>
            <span className="font-mono text-[#c4c7c5]">Option_C</span>
            <span className="font-mono text-[#c4c7c5]">Option_D</span>
            <span className="font-mono text-[#81c995] font-medium border-b border-[#81c995]/30">Correct_Option</span>
            <span className="font-mono text-[#c4c7c5]">Explanation <span className="opacity-50">(opt)</span></span>
         </div>
      </div>

    </div>
  );
}
