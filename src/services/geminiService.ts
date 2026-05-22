import { GoogleGenAI, Type } from "@google/genai";
import { Explanation } from '../types';

export const secureStorage = {
    setItem: (key: string, value: string) => {
        try {
            // Basic obfuscation to prevent casual plaintext scraping
            const obfuscated = btoa(encodeURIComponent(value)).split('').reverse().join('');
            localStorage.setItem(key, obfuscated);
        } catch (e) {
            console.error("Storage error");
        }
    },
    getItem: (key: string): string | null => {
        try {
            const obfuscated = localStorage.getItem(key);
            if (!obfuscated) return null;
            // Attempt to de-obfuscate
            const deobfuscated = decodeURIComponent(atob(obfuscated.split('').reverse().join('')));
            return deobfuscated;
        } catch (e) {
            // Fallback for older plaintext keys if they exist
            try {
                const plaintext = localStorage.getItem(key);
                if (plaintext && plaintext.startsWith('AIzaSy')) {
                    // Re-save as obfuscated
                    secureStorage.setItem(key, plaintext);
                    return plaintext;
                }
            } catch (fallbackErr) {
                console.error("Fallback storage error", fallbackErr);
            }
            return null;
        }
    },
    removeItem: (key: string) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error("Storage error");
        }
    }
};

export class AiServiceError extends Error {
    constructor(public reason: 'MISSING_KEY' | 'INVALID_KEY' | 'QUOTA_EXCEEDED' | 'UNKNOWN', message: string) {
        super(message);
        this.name = 'AiServiceError';
    }
}

export const getApiKey = (): string => {
  try {
    const customKey = secureStorage.getItem('CUSTOM_GEMINI_API_KEY');
    if (customKey) return customKey;
  } catch(e) {
    // Ignore storage errors
  }
  return process.env.GEMINI_API_KEY || '';
};

export const getGeminiModel = (): string => {
  try {
    const selectedModel = localStorage.getItem('CUSTOM_GEMINI_MODEL');
    if (selectedModel) return selectedModel;
  } catch(e) {
    console.warn("Could not retrieve custom model selection.");
  }
  return "gemini-3.5-flash"; // default
};

export const getSystemInstructionSuffix = (): string => {
  try {
    const tone = localStorage.getItem('CUSTOM_AI_TONE') || 'academic';
    switch (tone) {
      case 'student':
        return "\nEXPLANATION TONE: Explain concepts like a friendly, encouraging high-school tutor. Keep descriptions simple, use super relatable metaphors, and avoid overly technical terms unless defining them first.";
      case 'kid':
        return "\nEXPLANATION TONE: Explain concepts simply as if talking to a curious 8-year-old child. Use playful, high-energy language and funny real-world analogies (like toys or space rockets!).";
      case 'professional':
        return "\nEXPLANATION TONE: Explain concepts in a highly professional, concise, and technically rigorous format. Focus on speed, mathematical precision, and engineering application.";
      case 'academic':
      default:
        return "\nEXPLANATION TONE: Explain concepts in a balanced, informative, educational tone. Perfect for academic self-study and learning.";
    }
  } catch (e) {
    return "";
  }
};

const getAiClient = (): GoogleGenAI => {
  const apiKey = getApiKey();
    
  if (!apiKey) {
    throw new AiServiceError('MISSING_KEY', "Gemini API key is missing. It should be configured in the environment.");
  }
  return new GoogleGenAI({ 
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
};

export const validateApiKey = async (apiKey: string): Promise<{ success: boolean; message: string }> => {
  try {
    const tempAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    const model = getGeminiModel();
    const response = await tempAi.models.generateContent({
        model: model,
        contents: "Respond only with standard system greeting 'Quantum Server Operational'. Keep it under 5 words.",
    });
    return { 
      success: true, 
      message: response.text?.trim() || "Connected successfully." 
    };
  } catch (error: any) {
    console.error("API Key validation error:", error);
    return { 
      success: false, 
      message: error?.message || "Invalid API key or network error." 
    };
  }
};

const getErrorMessage = (error: any): string => {
    if (error instanceof AiServiceError) {
        return error.message;
    }
    const message = error?.message || String(error);
    if (message.includes('API_KEY_INVALID')) return "Your API key is invalid. Please check your settings.";
    if (message.includes('quota')) return "API quota exceeded. Please try again later or use your own API key.";
    return "The AI service is temporarily unavailable. Please try again later.";
};

const genericErrorExplanation: Explanation = {
    functionName: "Error",
    formula: "N/A",
    description: "Could not fetch an explanation at this time.",
    example: "Please try again later."
};


export const getFormulaExplanation = async (expression: string): Promise<Explanation | null> => {
  try {
    const prompt = `
      Analyze the primary mathematical, statistical, or financial function in this expression: "${expression}".
      Ignore basic arithmetic. Focus on the most significant function (e.g., sqrt, sin, log, nCr, mean, pmt).

      Return a JSON object with this exact structure:
      {
        "functionName": "Name (e.g., 'Square Root')",
        "formula": "User-friendly text formula (e.g., 'sqrt(x)')",
        "latexFormula": "Simplified LaTeX version (e.g., '\\sqrt{x}')",
        "description": "A clear, one-paragraph explanation.",
        "parameters": [
          { "param": "x", "description": "The number to find the square root of (radicand)." }
        ],
        "example": "A simple usage example (e.g., 'sqrt(16) = 4')."
      }

      GUIDELINES:
      - For statistical functions that take a list of numbers like mean or std, use 'x₁, x₂, ..., xₙ' for parameters and describe it as 'A set of numbers'. Example: 'mean(2, 4, 9)'.
      - For the financial function 'pmt', assume the signature is 'pmt(annualRate, termYears, principal)'. Clearly define each parameter.
      - For trigonometric functions like sin, use 'θ' as the parameter. For logarithms, use 'log_b(x)'. For combinations, use 'nCr(n, k)'.
      - The 'parameters' array should describe each variable in the formula. If there are no parameters (like for Pi), return an empty array.
      - If no specific function is found, return null.
    ` + getSystemInstructionSuffix();

    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              functionName: { type: Type.STRING },
              formula: { type: Type.STRING },
              latexFormula: { type: Type.STRING },
              description: { type: Type.STRING },
              parameters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    param: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["param", "description"]
                }
              },
              example: { type: Type.STRING }
            },
            required: ["functionName", "formula", "description", "example"]
          },
        }
    });

    const jsonText = response.text?.trim() || "";
    if (!jsonText) return null;
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error fetching formula explanation from Gemini:", error);
    return {
        ...genericErrorExplanation,
        description: getErrorMessage(error)
    };
  }
};

export const getCurrencyForecast = async (from: string, to: string): Promise<string> => {
  try {
    const prompt = `
      Provide a brief, general, and educational analysis of the typical factors influencing the exchange rate between ${from} and ${to}.
      Do NOT give financial advice, predict future prices, or use speculative language like "will rise" or "will fall".
      Focus on general economic principles.
      For example: "The ${from}/${to} rate is often influenced by factors such as the interest rate decisions of their respective central banks, inflation data, and trade balances."
      Keep the response under 60 words.
    ` + getSystemInstructionSuffix();
    
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
    });
    
    return response.text || "";

  } catch (error) {
    console.error("Error fetching currency forecast from Gemini:", error);
    return getErrorMessage(error);
  }
};

export const getExerciseAiExplanation = async (category: string, title: string, latexQuery: string): Promise<string> => {
  try {
    const prompt = `
      You are the Quantum Premium AI Math Coach. 
      Help a student understand and solve the following math exercise:
      - Category: ${category}
      - Topic: ${title}
      - Problem (LaTeX): $$ ${latexQuery} $$

      Provide a concise, encouraging, and highly clear breakdown of this problem.
      - First, explain the core mathematical concept briefly in 1-2 simple sentences.
      - Next, break down the key steps or formulas required to solve this kind of problem (using beautiful inline LaTeX where appropriate, e.g., $f(x)$ or $\\frac{dy}{dx}$).
      - Finally, give a helpful tip or common mistake to avoid when solving this.
      
      RULES:
      - Keep it under 150 words.
      - Fully use the tone settings.
      - Do not directly print the final computational answer, guide them step-by-step so they can calculate it themselves.
      - Maintain a friendly, engaging, coaching tone.
    ` + getSystemInstructionSuffix();

    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
    });
    
    return response.text || "AI Coach was unable to formulate feedback. Verify connection settings.";
  } catch (error) {
    console.error("Error fetching math exercise coach explanation:", error);
    return getErrorMessage(error);
  }
};

export interface AutoLoanDetails {
  loanAmount: number;
  interestRate: number;
  termYears: number;
  vehiclePrice: number;
  downPayment: number;
}

export const getAutoLoanAnalysis = async (details: AutoLoanDetails): Promise<string> => {
  try {
    const { loanAmount, interestRate, termYears, vehiclePrice, downPayment } = details;
    const prompt = `
      Analyze the following auto loan details for a user. Provide a brief, helpful, and educational analysis in 2-3 short bullet points.
      - Loan Amount: ${loanAmount.toFixed(2)}
      - Interest Rate (APR): ${interestRate}%
      - Loan Term: ${termYears} years
      - Vehicle Price: ${vehiclePrice.toFixed(2)}
      - Down Payment: ${downPayment.toFixed(2)}
      
      Focus on providing general insights. For example, comment on the interest rate (is it generally low, average, or high for the current market?), the impact of the down payment on the loan, or suggest the potential savings from making extra payments.
      
      RULES:
      - DO NOT give financial advice.
      - DO NOT use speculative language (e.g., "you will save"). Use conditional language (e.g., "you could save").
      - Keep the tone encouraging and informative.
      - The entire response should be under 100 words.
      - Start the response with a concise summary sentence, followed by bullet points.
    ` + getSystemInstructionSuffix();
    
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
    });
    
    return response.text || "";

  } catch (error) {
    console.error("Error fetching auto loan analysis from Gemini:", error);
    return getErrorMessage(error);
  }
};

export const getFinancialInsight = async (data: any, calculatorType: string): Promise<string> => {
  try {
    // Safely stringify data, plucking only plain properties if it's a complex object
    let safeData = '';
    try {
      safeData = JSON.stringify(data);
    } catch (e) {
      console.warn("Circular reference detected in financial insight data, using safe stringify");
      const seen = new WeakSet();
      safeData = JSON.stringify(data, (_, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      });
    }

    const prompt = `
      Provide a brief, educational, and professional analysis for the following ${calculatorType} calculation results:
      ${safeData}
      
      Focus on general financial principles. For example, explain why compound interest grows faster over longer terms, or the trade-off between monthly payments and total interest in a loan.
      
      RULES:
      - DO NOT provide specific financial advice or recommendations.
      - DO NOT use speculative language. Use conditional language ("could", "may").
      - Maximum 80 words.
      - Keep it insightful and encouraging.
    ` + getSystemInstructionSuffix();
    
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: getGeminiModel(),
        contents: prompt,
    });
    
    return response.text || "Insight unavailable at this time.";
  } catch (error) {
    console.error("Error fetching financial insight from Gemini:", error);
    return getErrorMessage(error);
  }
};
