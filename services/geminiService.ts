import { GoogleGenAI, Type } from "@google/genai";
import { Explanation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const genericErrorExplanation: Explanation = {
    functionName: "Error",
    formula: "N/A",
    description: "Could not fetch an explanation at this time. The AI service might be temporarily unavailable or the request could not be processed.",
    example: "Please try again later."
};

const genericErrorForecast: string = "Could not retrieve analysis at this time. Please try again later.";


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
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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

    const jsonText = response.text.trim();
    if (!jsonText) return null;
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error fetching formula explanation from Gemini:", error);
    return genericErrorExplanation;
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
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error fetching currency forecast from Gemini:", error);
    return genericErrorForecast;
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
    `;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    return response.text;

  } catch (error) {
    console.error("Error fetching auto loan analysis from Gemini:", error);
    return genericErrorForecast;
  }
};
