import Groq from 'groq-sdk';

export const parseNotesToQuiz = async (apiKey, inputData) => {
  if (!apiKey) {
    throw new Error('Groq API Key is required.');
  }
  if (!inputData || inputData.trim() === '') {
    throw new Error('Please provide some notes or text to convert.');
  }

  const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  const systemInstruction = `You are an expert quiz generator. Your job is to convert messy notes, text, or unstructured data into a strict multiple-choice quiz format.

You MUST format your output EXACTLY following these strict technical rules:
1. Use strictly plain text. NO markdown formatting. DO NOT bold any words (e.g., do not use **Question:**).
2. Do not wrap the output in a markdown code block (no \`\`\`). Just output the raw text.
3. Separate each complete question block with at least one blank line.
4. The correct answer must be just the letter (A, B, C, or D).
5. Convert ALL questions found in the input. Do NOT limit the number of questions. If the input has 64 questions, you must output all 64 questions. Never truncate or summarize.

SPECIAL FORMATTING RULES FOR MATH AND CHEMISTRY:
- If the text contains mathematical formulas or equations, you MUST format them using INLINE LaTeX syntax: $ formula $. DO NOT use block syntax ($$ formula $$).
  - Example: $ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $
  - Write ONLY the $ ... $ tag for the option if it is representing a formula, do not add extra text around it.
  - Example for Benzene: \`smiles(c1ccccc1)\`
  - Example for Ethanol: \`smiles(CCO)\`
  - Write ONLY the \`smiles(...)\` tag for the option if it is representing a structure, do not add extra text around it.

Format EVERY question exactly like this template:

Question: [Write the question here]
A: [Option A text]
B: [Option B text]
C: [Option C text]
D: [Option D text]
Correct: [Answer letter A, B, C, or D]
Explanation: [Short explanation of why this is correct]`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: inputData }
      ],
      temperature: 0.2,
      max_tokens: 32768,
    });

    const result = completion.choices[0]?.message?.content || '';
    return result.replace(/```(txt|text)?\n?/gi, '').replace(/```\n?/g, '').trim();
  } catch (error) {
    console.error('Groq Error:', error);
    throw new Error(error.message || 'Failed to generate quiz from notes.');
  }
};
