import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';
import SmilesDrawer from 'smiles-drawer';

// SVG Icons matching Gemini style
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

// Advanced Renderer for Math & Chemistry
const Chemistry = ({ smiles }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !smiles) return;
    try {
      const options = { width: 150, height: 150, padding: 0 };
      // Handle different versions of smiles-drawer
      if (SmilesDrawer.Drawer) {
        let sd = new SmilesDrawer.Drawer(options);
        SmilesDrawer.parse(smiles, (tree) => {
          sd.draw(tree, canvasRef.current, "dark", false);
        });
      } else {
        let sd = new SmilesDrawer(options);
        SmilesDrawer.parse(smiles, (tree) => {
          sd.draw(tree, canvasRef.current, "dark", false);
        });
      }
    } catch (e) {
      console.warn("Failed to render SMILES:", e);
    }
  }, [smiles]);

  return <canvas ref={canvasRef} className="my-2" />;
};

const RichText = ({ content }) => {
  if (typeof content !== 'string') return content;

  if (content.includes('[SMILES]')) {
    const parts = content.split(/(\[SMILES\].*?(?:\s|$))/g);
    return (
      <span className="inline-flex items-center flex-wrap gap-2">
        {parts.map((part, i) => {
          if (part.startsWith('[SMILES]')) {
            const smiles = part.replace('[SMILES]', '').trim();
            return <Chemistry key={i} smiles={smiles} />;
          }
          return <Latex key={i}>{part}</Latex>;
        })}
      </span>
    );
  }
  return <Latex>{content}</Latex>;
};


const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function Quiz({ questions, onRestart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex | 'skipped' }
  const [isFinished, setIsFinished] = useState(false);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!questions || questions.length === 0) {
    return <div className="p-8 text-center text-[#e3e3e3]">No questions available.</div>;
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  // Calculate scores and stats
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;
  let attemptedCount = 0;

  Object.entries(answers).forEach(([qIndex, selectedOptIndex]) => {
    if (selectedOptIndex === 'skipped') {
      skippedCount++;
      return;
    }
    attemptedCount++;
    const isCorrect = questions[qIndex].options[selectedOptIndex].isCorrect;
    if (isCorrect) correctCount++;
    else incorrectCount++;
  });

  const remainingCount = totalQuestions - (attemptedCount + skippedCount);

  const handleOptionClick = (optionIndex) => {
    if (hasCompletedQuiz) return;
    if (answers[currentIndex] !== undefined && answers[currentIndex] !== 'skipped') return;
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIndex
    }));
  };

  const advance = () => {
    if (answers[currentIndex] === undefined) {
      setAnswers(prev => ({
        ...prev,
        [currentIndex]: 'skipped'
      }));
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true); // Reached the end
      setHasCompletedQuiz(true);
    }
  };

  const goBack = () => {
    if (answers[currentIndex] === undefined) {
      setAnswers(prev => ({
        ...prev,
        [currentIndex]: 'skipped'
      }));
    }
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
  
  const jumpToQuestion = (index) => {
    if (answers[currentIndex] === undefined) {
      setAnswers(prev => ({
        ...prev,
        [currentIndex]: 'skipped'
      }));
    }
    setIsMenuOpen(false);
    setCurrentIndex(index);
  };

  // ----- COMPLETION SCREEN -----
  if (isFinished) {
    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const finalSkippedCount = totalQuestions - (correctCount + incorrectCount);

    return (
      <div className="gemini-quiz-root flex flex-col h-full bg-[#131314]">
        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-[26px] pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-[22px] font-normal tracking-wide text-[#e3e3e3]">Gemini</div>
          </div>
          <button 
            onClick={onRestart}
            className="text-[14px] font-medium text-[#131314] bg-[#a8c7fa] hover:bg-[#d3e3fd] px-5 py-[10px] rounded-full transition-colors"
          >
            Home
          </button>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 px-6 pt-6 pb-32 overflow-y-auto no-scrollbar">
          <h1 className="text-[22px] font-normal text-[#e3e3e3] mb-[32px]">
            You did it! Quiz complete.
          </h1>

          <div className="flex gap-4">
            {/* Score Card */}
            <div className="flex-[1.2] bg-[#1e1f20] rounded-[24px] p-5 flex flex-col justify-between min-h-[144px]">
              <div>
                <span className="text-[15px] font-medium text-[#e3e3e3] mb-1 block">Score</span>
                <span className="text-[40px] font-light text-[#e3e3e3] leading-none block mb-4">
                  {correctCount}/{totalQuestions}
                </span>
              </div>
              <div className="flex flex-col text-[14px] text-[#c4c7c5] leading-relaxed">
                <span>Incorrect: {incorrectCount}</span>
                <span>Skipped: {finalSkippedCount}</span>
              </div>
            </div>

            {/* Accuracy Card */}
            <div className="flex-1 bg-[#1e1f20] rounded-[24px] p-5 flex flex-col justify-start min-h-[144px]">
              <span className="text-[15px] font-medium text-[#e3e3e3] mb-1 block">Accuracy</span>
              <span className="text-[40px] font-light text-[#e3e3e3] leading-none block">
                {accuracy}%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Absolute Navbar Actions */}
        <div className="absolute bottom-0 w-full z-10 flex flex-col pb-6 pt-10 px-6 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
          <button
            onClick={() => setIsFinished(false)} // Set array back to viewing mode
            className="py-[14px] w-full max-w-[200px] border border-[#a8c7fa] rounded-full font-medium text-[15px] text-[#a8c7fa] hover:bg-[#a8c7fa]/10 transition-colors mx-auto"
          >
            Review quiz
          </button>
        </div>
      </div>
    );
  }

  // ----- STANDARD QUIZ SCREEN -----
  return (
    <>
      <style>{`
        .gemini-quiz-root {
          font-family: 'Google Sans Flex', 'Google Sans', 'Outfit', system-ui, -apple-system, sans-serif;
          font-weight: 300;
          color: #e3e3e3;
        }
        /* KaTeX overrides for dark theme readability and exact font matching */
        .katex {
          font-size: 1.15em;
          color: #e3e3e3; 
        }
        .katex * {
           font-family: 'Times New Roman', Times, serif !important;
        }
        /* Hide the annoying default mathml that Katex outputs sometimes causing double text */
        .katex-mathml {
          display: none;
        }
      `}</style>
      
      <div className="gemini-quiz-root flex flex-col h-full bg-[#131314] relative overflow-hidden text-[#e3e3e3]">
        
        {/* HAMBURGER MENU OVERLAY */}
        {/* Backdrop */}
        {isMenuOpen && (
          <div 
            className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMenuOpen(false)}
          ></div>
        )}
        
        {/* Slide-out Drawer */}
        <div className={`absolute top-0 right-0 h-full w-[85%] max-w-[320px] bg-[#1e1f20] z-50 transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-6 border-b border-[#444746]/50">
            <h2 className="text-[18px] font-medium text-[#e3e3e3]">Quiz Overview</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-[#c4c7c5] hover:text-white transition-colors">
              <CloseIcon />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#131314] p-4 rounded-2xl flex flex-col items-center justify-center border border-[#444746]/30 shadow-sm">
                <span className="text-[28px] text-[#81c995] leading-none mb-1 font-normal">{correctCount}</span>
                <span className="text-[12px] text-[#c4c7c5] font-medium">Correct</span>
              </div>
              <div className="bg-[#131314] p-4 rounded-2xl flex flex-col items-center justify-center border border-[#444746]/30 shadow-sm">
                <span className="text-[28px] text-[#f28b82] leading-none mb-1 font-normal">{incorrectCount}</span>
                <span className="text-[12px] text-[#c4c7c5] font-medium">Incorrect</span>
              </div>
              <div className="bg-[#131314] p-4 rounded-2xl flex flex-col items-center justify-center border border-[#444746]/30 shadow-sm">
                <span className="text-[28px] text-[#e3e3e3] leading-none mb-1 font-normal">{attemptedCount}</span>
                <span className="text-[12px] text-[#c4c7c5] font-medium">Attempted</span>
              </div>
              <div className="bg-[#131314] p-4 rounded-2xl flex flex-col items-center justify-center border border-[#444746]/30 shadow-sm">
                <span className="text-[28px] text-[#f28b82] leading-none mb-1 font-normal">{skippedCount}</span>
                <span className="text-[12px] text-[#c4c7c5] font-medium">Skipped</span>
              </div>
            </div>

            <h3 className="text-[14px] font-medium text-[#8e918f] mb-4 uppercase tracking-wider">Jump to Question</h3>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const state = answers[i];
                const isActive = i === currentIndex;
                
                let tileStyle = "bg-[#131314] text-[#c4c7c5] border border-[#444746]/50"; // Unanswered / Skipped default

                if (state !== undefined && state !== 'skipped') {
                   // Evaluate if the answer they gave is correct
                   const isCorrect = questions[i].options[state].isCorrect;
                   if (isCorrect) {
                      tileStyle = "bg-[#0f3622] text-[#81c995] font-medium border border-[#81c995]/40"; // Correct
                   } else {
                      tileStyle = "bg-[#3c1f1f] text-[#f28b82] font-medium border border-[#f28b82]/40"; // Incorrect
                   }
                }

                if (isActive) tileStyle += " ring-2 ring-[#a8c7fa] ring-offset-2 ring-offset-[#1e1f20]";

                return (
                  <button
                    key={i}
                    onClick={() => jumpToQuestion(i)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-[15px] transition-all hover:scale-105 ${tileStyle}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Header */}
        <header className="flex items-center justify-between px-6 pt-[26px] pb-5 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="text-[#e3e3e3] hover:text-white transition-colors"
            >
              <MenuIcon />
            </button>
            <div className="text-[22px] font-normal tracking-wide">Gemini</div>
          </div>
          <button 
            onClick={onRestart}
            className="text-[14px] font-medium text-[#131314] bg-[#a8c7fa] hover:bg-[#d3e3fd] px-5 py-[10px] rounded-full transition-colors"
          >
            Home
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          
          {/* Top Progress Bar & Score Pills */}
          <div className="px-[24px] flex items-center justify-between mb-8 mt-2">
            <div className="flex items-center gap-[10px] flex-1 pr-[12px]">
              {/* Dashed Progress Indicators */}
              <div className="flex gap-[6px] items-center flex-1 max-w-[200px]">
                {Array.from({ length: Math.min(15, totalQuestions) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-[4px] rounded-full transition-all duration-300 ${
                      i === currentIndex 
                        ? 'w-[20px] bg-[#a8c7fa]' 
                        : 'w-[10px] bg-[#444746]' 
                    }`}
                  />
                ))}
              </div>
              
              {/* Horizontal fractional counter aligned right */}
              <div className="flex items-center font-medium text-[14px] ml-auto">
                <span className="text-[#a8c7fa]">{currentIndex + 1}</span>
                <span className="text-[#c4c7c5] mx-0.5">/</span>
                <span className="text-[#c4c7c5]">{totalQuestions}</span>
              </div>
            </div>

            <div className="flex gap-[8px]">
              <div className="bg-[#3c1f1f] text-[#f28b82] flex items-center gap-1.5 px-[10px] py-[4px] rounded-full text-[13px] font-medium">
                <XIcon /> <span>{incorrectCount}</span>
              </div>
              <div className="bg-[#0f3622] text-[#81c995] flex items-center gap-1.5 px-[10px] py-[4px] rounded-full text-[13px] font-medium">
                <CheckIcon /> <span>{correctCount}</span>
              </div>
            </div>
          </div>

          {/* Question Section */}
          <div className="px-6 flex gap-4 text-[18px] leading-[1.6] mb-[28px] font-normal">
            <span className="shrink-0">{currentIndex + 1}.</span>
            <div>
              <RichText content={currentQuestion.text} />
            </div>
          </div>

          {/* Options List */}
          <div className="px-6 flex flex-col gap-[12px]">
            {currentQuestion.options.map((option, index) => {
              const answerState = answers[currentIndex];
              const hasAnswered = answerState !== undefined;
              const isSelected = answerState === index;
              const isSkipped = answerState === 'skipped';
              
              let containerStyle = "bg-[#1e1f20] border border-transparent";
              let showExplanation = false;
              let isRed = false;
              let isGreen = false;

              if (hasAnswered && !isSkipped) {
                if (isSelected) {
                  if (option.isCorrect) {
                    containerStyle = "bg-[#0f3622]/20 border border-[#81c995]";
                    isGreen = true;
                    showExplanation = true;
                  } else {
                    containerStyle = "bg-[#3c1f1f]/20 border border-[#f28b82]";
                    isRed = true;
                    showExplanation = true;
                  }
                }
              }

              if (hasCompletedQuiz && !isSelected && option.isCorrect) {
                  containerStyle = "bg-[#0f3622]/20 border border-[#81c995]";
                  isGreen = true;
                  showExplanation = true;
              }

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(index)}
                  disabled={hasCompletedQuiz || hasAnswered}
                  className={`w-full text-left p-[20px] rounded-[18px] transition-all duration-300 group ${
                    !(hasCompletedQuiz || hasAnswered) ? 'hover:bg-[#2a2a2b]' : ''
                  } ${containerStyle}`}
                >
                  <div className="flex items-start text-[17px] font-normal leading-[1.6]">
                    <span className="w-[32px] shrink-0 font-normal mt-0.5">
                      {option.id}.
                    </span>
                    <span className="flex-1">
                      <RichText content={option.text} />
                    </span>
                  </div>

                  {showExplanation && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 pt-1">
                      <div className={`flex items-center gap-2 mb-[6px] text-[15px] font-medium ${isGreen ? 'text-[#81c995]' : 'text-[#f28b82]'}`}>
                        {isGreen ? <CheckIcon /> : <XIcon />}
                        {option.explanationTitle || (isGreen ? "Right answer" : "Not quite")}
                      </div>
                      <div className="text-[15px] opacity-90 leading-[1.6] font-light pl-6">
                        <RichText content={option.explanation} />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-6 mt-[24px] mb-[40px]">
             <button className="flex items-center gap-2 text-[14px] font-medium text-[#e3e3e3] hover:text-white transition-colors pl-1">
              Show hint <ChevronDownIcon />
            </button>
          </div>
          
        </div>

        {/* Bottom Absolute Navbar Actions */}
        <div className="absolute bottom-0 w-full z-10 flex flex-col items-center justify-between pb-[18px] pt-10 px-6 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent">
          <div className="w-full flex justify-between items-center gap-3">
            {currentIndex > 0 && (
              <button
                onClick={goBack}
                className="py-[14px] px-8 rounded-full font-medium text-[15px] text-[#a8c7fa] bg-transparent hover:bg-[#1e1f20] transition-colors shrink-0"
              >
                Back
              </button>
            )}
            
            <button
              onClick={advance}
              className={`py-[14px] rounded-full font-medium text-[15px] transition-colors w-full bg-[#a8c7fa] text-[#062e6f] hover:bg-[#d3e3fd] ${currentIndex > 0 ? "max-w-[280px]" : ""}`}
            >
              {currentIndex === questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
