import React, { useState } from 'react';
import Home from './components/Home';
import Quiz from './components/Quiz';

export default function App() {
  const [quizQuestions, setQuizQuestions] = useState(null);

  const handleQuizGenerate = (parsedQuestions) => {
    setQuizQuestions(parsedQuestions);
  };

  const handleRestart = () => {
    setQuizQuestions(null);
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] gemini-ui flex justify-center w-full sm:py-8 font-light">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500&display=swap');
        
        .gemini-ui {
          font-family: 'Google Sans Flex', 'Google Sans', 'Outfit', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-weight: 300;
        }
        
        .gemini-ui * {
          font-family: inherit;
        }
        
        .gemini-math {
          font-family: 'Times New Roman', Times, serif;
          font-style: italic;
          letter-spacing: 0.04em;
          font-size: 1.05em;
          font-weight: 400;
        }
      `}</style>
      {/* Mobile Frame Container */}
      <div className="w-full max-w-[400px] bg-[#131314] flex flex-col relative sm:rounded-[2rem] sm:border-[8px] sm:border-[#2a2a2b] shadow-2xl overflow-hidden h-[100dvh] sm:h-[850px]">
        {quizQuestions ? (
          <Quiz questions={quizQuestions} onRestart={handleRestart} />
        ) : (
          <Home onQuizGenerate={handleQuizGenerate} />
        )}
      </div>
    </div>
  );
}