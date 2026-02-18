import axios from 'axios';
import { getThemePrompt } from './themePrompts.js';

const OLLAMA_URL = 'http://localhost:11434/api/chat';
const VALID_API_KEYS = ['demo-key-123', 'presentation-key-456'];


// safety filter 
function isUnsafeTopic(text) {
  const lower = text.toLowerCase();
  const forbidden = [
    /should i buy/i,
    /should i sell/i,
    /invest in (tesla|apple|bitcoin|stock|etf)/i,
    /what stock should/i,
    /give me specific financial advice/i,
  ];
  return forbidden.some(pattern => pattern.test(lower));
}

export async function getAIResponse(userMessage, userTheme = 'cosmic', userContext = {}, conversationHistory = []) {
  try {
    // safety filter on input
    if (isUnsafeTopic(userMessage)) {
      return {
        success: true,
        message: "I can only provide general financial education. For specific investment advice, please consult a professional financial advisor.",
        agent: getThemePrompt(userTheme).name
      };
    }

    const themeConfig = getThemePrompt(userTheme);
    
    // build financial context
    const financialContext = `
Current user financial info:
- Balance: $${userContext.balance || 0}
- Monthly spending: $${userContext.monthlySpending || 0}
- Budget status: ${userContext.budgetRemaining ? `$${userContext.budgetRemaining} remaining` : 'not set'}
    `.trim();

    // build messages array (system + history + new message)
    const messages = [
      { role: 'system', content: `${themeConfig.systemPrompt}\n\n${financialContext}` },
      ...conversationHistory.slice(-10), // Keep last 5 exchanges (10 messages)
      { role: 'user', content: userMessage }
    ];

    // call Ollama (using his exact setup)
    const ollamaResponse = await axios.post(OLLAMA_URL, {
      model: 'llama3.2', // Using llama3.2 instead of qwen3:4b
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 500,
      }
    });

    const assistantMessage = ollamaResponse.data.message.content;

    // safety filter on output
    if (isUnsafeTopic(assistantMessage)) {
      return {
        success: true,
        message: "I'm sorry, I can't provide that specific advice. Let me know if you have general questions about budgeting or saving!",
        agent: themeConfig.name
      };
    }

    return {
      success: true,
      message: assistantMessage.trim(),
      agent: themeConfig.name,
    };

  } catch (error) {
    console.error('AI Service Error:', error.message);
    
    // fallback response
    const themeConfig = getThemePrompt(userTheme);
    return {
      success: false,
      message: "having trouble connecting to my brain right now. try again in a sec!",
      agent: themeConfig.name,
    };
  }
}