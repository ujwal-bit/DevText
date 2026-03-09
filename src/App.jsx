import React, { useState, useEffect, useRef } from 'react';
import { Settings, Sparkles, UploadCloud, FileText, Download, Copy, Check, ChevronRight, FileUp } from 'lucide-react';
import { parseNotesToQuiz } from './services/groq';

const TenorEmbed = () => {
  return (
    <div className="relative w-[180px] sm:w-[220px] mx-auto rounded-2xl overflow-hidden aspect-square">
      <img
        src="https://media1.tenor.com/m/-WEizP3LZb8AAAAC/ha-ha.gif"
        alt="Ha Ha"
        decoding="async"
        fetchPriority="high"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
};

export default function App() {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const [outputResult, setOutputResult] = useState('');
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('groq_api_key');
    if (savedKey) setApiKey(savedKey);
    else setShowSettings(true);
  }, []);

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
    setShowSettings(false);
  };

  const handleFileUpload = (file) => {
    setError(null);
    if (!file) return;
    
    setFileName(file.name);
    
    // Read arbitrary files as text for simplicity
    const reader = new FileReader();
    reader.onload = (e) => setInputText(e.target.result);
    reader.onerror = () => setError("Failed to read the file.");
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }
    if (!inputText.trim()) {
      setError("Please paste some notes or upload a file first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setOutputResult('');

    try {
      const generatedQuiz = await parseNotesToQuiz(apiKey, inputText);
      setOutputResult(generatedQuiz);
    } catch (err) {
      setError(err.message || "An error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTxt = () => {
    if (!outputResult) return;
    const blob = new Blob([outputResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] font-['Outfit'] relative overflow-x-hidden selection:bg-[#a8c7fa]/30">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center overflow-hidden opacity-40">
        <div className="absolute top-[-20%] w-[800px] h-[600px] bg-[#a8c7fa]/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute top-[30%] -right-32 w-[600px] h-[600px] bg-[#f28b82]/5 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] -left-32 w-[500px] h-[500px] bg-[#81c995]/5 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      <header className="fixed top-0 w-full z-40 bg-[#131314]/80 backdrop-blur-xl border-b border-[#444746]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="w-10 h-10 rounded-2xl bg-transparent flex items-center justify-center text-[#131314] shrink-0 overflow-hidden border-2 border-transparent hover:border-[#a8c7fa]/50 transition-all">
                {/* Fallback to Sparkles if raiden.png is not found, otherwise use raiden.png */}
                <img 
                  src="/raiden.png" 
                  alt="DevText" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none'; 
                    e.currentTarget.nextElementSibling.style.display = 'block'; 
                  }} 
                />
                <Sparkles size={22} className="fill-current hidden" />
             </div>
             <div>
               <h1 className="text-xl sm:text-[22px] font-medium tracking-tight text-[#e3e3e3] leading-none mb-1">DevText</h1>
               <p className="text-[#a8c7fa] text-[10px] sm:text-xs font-medium uppercase tracking-widest opacity-80">AI Document Converter</p>
             </div>
          </div>

          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#1e1f20] hover:bg-[#2a2a2b] border border-[#444746]/50 transition-colors text-sm font-medium"
          >
            <Settings size={16} className={apiKey ? "text-[#81c995]" : "text-[#f28b82]"} />
            <span className="hidden sm:inline">{apiKey ? 'API Configured' : 'Setup Required'}</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-24 sm:pt-32 pb-24 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 sm:gap-8 min-h-[calc(100vh-80px)]">
        
        {/* Left Column (Input) */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:w-1/2">
          
          <div className="flex flex-col gap-1 sm:gap-2">
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight flex items-center gap-2">
              <FileUp className="text-[#a8c7fa] w-5 h-5 sm:w-6 sm:h-6" /> Source Material
            </h2>
            <p className="text-xs sm:text-sm text-[#c4c7c5] font-light">
              Paste your messy notes, copied articles, or upload unstructured text files. DevText will extract the facts and generate perfectly formatted Quiz txt files.
            </p>
          </div>

          {/* Upload Dropzone */}
          {(!inputText && !fileName) && (
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[220px] bg-[#1e1f20]/30 backdrop-blur-sm
                ${isDragging ? 'border-[#a8c7fa] bg-[#a8c7fa]/5 scale-[1.02]' : 'border-[#444746] hover:border-[#a8c7fa]/50 hover:bg-[#1e1f20]/60'}
              `}
            >
              <div className="w-16 h-16 rounded-full bg-[#2a2a2b] flex items-center justify-center mb-4 text-[#a8c7fa]">
                <UploadCloud size={32} />
              </div>
              <p className="text-base font-medium text-[#e3e3e3] mb-1">Drag & drop your file here</p>
              <p className="text-xs text-[#8e918f]">Supports .txt, .md, .csv, and unstructured notes</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden" 
              />
            </div>
          )}

          {/* Or separator */}
          {(!inputText && !fileName) && (
             <div className="flex items-center justify-center gap-4 py-2">
                <div className="h-[1px] bg-[#444746] flex-1"></div>
                <span className="text-[#8e918f] text-xs font-medium uppercase tracking-widest">OR</span>
                <div className="h-[1px] bg-[#444746] flex-1"></div>
             </div>
          )}

          {/* Text Area Input */}
          <div className="flex-1 flex flex-col relative group min-h-[250px] sm:min-h-[300px]">
            {(fileName || inputText) && (
              <div className="absolute -top-3 sm:-top-4 left-2 sm:left-4 flex gap-2 z-10 overflow-x-auto w-full max-w-[calc(100%-1rem)] no-scrollbar shadow-sm px-1 py-1 -mx-1 -my-1">
                {fileName && (
                  <div className="bg-[#81c995]/20 text-[#81c995] border border-[#81c995]/30 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1.5 sm:gap-2 backdrop-blur-md whitespace-nowrap">
                    <FileText size={12} className="shrink-0" /> <span className="truncate max-w-[120px] sm:max-w-none">{fileName}</span>
                  </div>
                )}
                <button 
                  onClick={() => { setFileName(''); setInputText(''); setOutputResult(''); setError(null); }}
                  className="bg-[#2a2a2b]/80 hover:bg-[#f28b82] text-[#c4c7c5] hover:text-[#131314] border border-[#444746] hover:border-[#f28b82]/80 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1.5 sm:gap-2 backdrop-blur-md transition-all shadow-sm shrink-0"
                >
                  <span className="shrink-0 leading-none mt-[-1px] text-[14px]">✕</span> Clear Input
                </button>
              </div>
            )}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={(inputText || fileName) ? "" : "Paste your messy notes, articles, or unstructured data directly here..."}
              className={`flex-1 w-full bg-[#1e1f20]/50 rounded-3xl border ${fileName ? 'border-[#81c995]/30 pt-8' : 'border-[#444746] hover:border-[#a8c7fa]/50'} p-6 text-[#e3e3e3] placeholder-[#8e918f] focus:outline-none focus:border-[#a8c7fa] focus:ring-1 focus:ring-[#a8c7fa]/50 transition-all resize-none shadow-inner leading-relaxed text-[15px] font-['Google_Sans_Flex',sans-serif] no-scrollbar`}
            />
          </div>

        </div>

        {/* Generate Divider */}
        <div className="hidden lg:flex flex-col items-center justify-center">
             <div className="w-[1px] bg-gradient-to-b from-transparent via-[#444746] to-transparent h-full relative">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim()}
                  className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 z-10
                    ${isGenerating ? 'bg-[#a8c7fa] rotate-180 scale-90' : 'bg-gradient-to-br from-[#a8c7fa] to-[#f28b82] hover:scale-110 shadow-[0_0_30px_rgba(168,199,250,0.3)]'}
                    ${!inputText.trim() && !isGenerating ? 'opacity-50 grayscale cursor-not-allowed hover:scale-100 shadow-none' : ''}
                  `}
                >
                   {isGenerating ? (
                      <div className="animate-spin text-[#131314]"><Sparkles size={24} /></div>
                   ) : (
                      <ChevronRight size={32} className="text-[#131314]" />
                   )}
                </button>
             </div>
        </div>

        {/* Mobile Generate Button */}
        <div className="lg:hidden w-full flex justify-center py-2">
            <button
                onClick={handleGenerate}
                disabled={isGenerating || !inputText.trim()}
                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all duration-300
                  ${isGenerating ? 'bg-[#a8c7fa]/20 text-[#a8c7fa]' : 'bg-gradient-to-r from-[#a8c7fa] to-[#f28b82] text-[#131314] hover:opacity-90'}
                  ${!inputText.trim() && !isGenerating ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                `}
              >
                 {isGenerating ? (
                    <><div className="animate-spin"><Sparkles size={20} /></div> Parsing AI...</>
                 ) : (
                    <>Generate Output <ChevronRight size={20} /></>
                 )}
              </button>
        </div>

        {/* Right Column (Output) */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:w-1/2">
          
          <div className="flex flex-col gap-1 sm:gap-2">
            <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-[#f28b82] w-5 h-5 sm:w-6 sm:h-6" /> Strict Output Format
            </h2>
            <p className="text-xs sm:text-sm text-[#81c995] font-light">
              This result is perfectly formatted and mathematically ready to rock exactly as the Gemini Quiz App expects.
            </p>
          </div>

          <div className="flex-1 flex flex-col relative group min-h-[300px] sm:h-[400px] lg:h-auto">
             {outputResult ? (
                <>
                  <textarea
                    readOnly
                    value={outputResult}
                    className="flex-1 w-full bg-[#1e1f20]/80 rounded-3xl border border-[#81c995]/30 p-6 text-[#81c995] focus:outline-none transition-all resize-none font-mono text-sm sm:text-base leading-relaxed shadow-lg no-scrollbar selection:bg-[#81c995]/20 selection:text-[#a8c7fa]"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2 sm:gap-2 flex-col sm:flex-row">
                     <button 
                       onClick={copyToClipboard}
                       className="flex items-center justify-center gap-2 px-4 py-2 sm:py-3 rounded-xl bg-[#2a2a2b]/80 backdrop-blur-md hover:bg-[#a8c7fa] hover:text-[#131314] transition-colors text-xs sm:text-sm font-medium border border-[#444746]"
                     >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied' : 'Copy'}
                     </button>
                     <button 
                       onClick={downloadTxt}
                       className="flex items-center justify-center gap-2 px-5 sm:px-6 py-2 sm:py-3 rounded-xl bg-[#a8c7fa] hover:bg-white text-[#131314] transition-colors text-xs sm:text-sm font-medium shadow-[0_4px_14px_rgba(168,199,250,0.4)]"
                     >
                        <Download size={16} className="sm:w-[18px] sm:h-[18px]" /> Download .txt
                     </button>
                  </div>
                </>
             ) : (
                <div className="flex-1 w-full bg-[#131314] rounded-3xl border border-[#444746] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                   {isGenerating ? (
                      <div className="flex flex-col items-center gap-4 w-full">
                        <TenorEmbed />
                        <div className="text-[#a8c7fa] font-medium tracking-wide animate-pulse">Processing Document...</div>
                      </div>
                   ) : (
                      <>
                        <FileText size={48} className="mb-4 text-[#444746]" />
                        <p className="text-[#8e918f] max-w-[250px] leading-relaxed">Generated multiple-choice questions will appear here.</p>
                      </>
                   )}
                </div>
             )}
          </div>
        </div>
      </main>

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#3c1f1f]/90 backdrop-blur-xl border border-[#f28b82]/40 text-[#f28b82] px-6 py-4 rounded-2xl flex items-center justify-between gap-4 shadow-2xl z-50 animate-in slide-in-from-bottom-8">
           <span className="font-medium text-sm">{error}</span>
           <button onClick={() => setError(null)} className="opacity-50 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-[#131314]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e1f20] border border-[#444746] rounded-3xl max-w-md w-full p-8 shadow-2xl relative">
             <button 
               onClick={() => setShowSettings(false)}
               className="absolute top-6 right-6 text-[#8e918f] hover:text-white transition-colors"
             >✕</button>
             
             <div className="w-12 h-12 rounded-full bg-[#a8c7fa]/10 flex items-center justify-center mb-6">
                <Settings className="text-[#a8c7fa]" size={24} />
             </div>
             
             <h2 className="text-2xl font-medium text-white mb-2 tracking-tight">API Setup</h2>
             <p className="text-[#c4c7c5] text-sm mb-6 leading-relaxed">
               DevText uses the Groq API to format documents. Your key is stored securely in your browser's local storage.
             </p>
             
             <input
               type="password"
               placeholder="Enter Groq API Key..."
               defaultValue={apiKey}
               id="api-key-input"
               className="w-full bg-[#131314] border border-[#444746] rounded-xl px-4 py-3 text-[#e3e3e3] focus:outline-none focus:border-[#a8c7fa] mb-6"
               onKeyDown={(e) => {
                 if(e.key === 'Enter') saveApiKey(e.target.value);
               }}
             />

             <div className="flex gap-3">
               <button 
                 onClick={() => saveApiKey(document.getElementById('api-key-input').value)}
                 className="flex-1 bg-[#a8c7fa] text-[#131314] font-medium py-3 rounded-xl hover:bg-white transition-colors"
               >
                 Save & Continue
               </button>
               <a 
                 href="https://console.groq.com/keys" 
                 target="_blank" rel="noopener noreferrer"
                 className="flex-1 bg-[#2a2a2b] text-[#e3e3e3] font-medium py-3 rounded-xl hover:bg-[#444746] transition-colors flex justify-center items-center"
               >
                 Get API Key
               </a>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
