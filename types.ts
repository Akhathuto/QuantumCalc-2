export interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: string;
  isFavorite?: boolean;
}

export interface Explanation {
  functionName: string;
  formula: string;
  latexFormula?: string;
  description: string;
  parameters?: {
    param: string;
    description: string;
  }[];
  example: string;
}

export type AppTab =
  | 'landing'
  | 'calculator'
  | 'graphing'
  | 'math-tools'
  | 'programmer'
  | 'units'
  | 'currency'
  | 'base'
  | 'financial'
  | 'date'
  | 'health'
  | 'text'
  | 'developer'
  | 'student'
  | 'history'
  | 'about'
  | 'terms'
  | 'settings'
  | 'help';