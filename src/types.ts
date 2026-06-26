export interface HistoryEntry {
  id?: string;
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
  | 'explore'
  | 'calculator'
  | 'graphing'
  | 'periodic'
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
  | 'k5worksheets'
  | 'exercises'
  | 'history'
  | 'about'
  | 'contact'
  | 'terms'
  | 'settings'
  | 'help'
  | 'study-guides'
  | 'exercise-references'
  | 'feedback'
  | 'privacy'
  | 'core-license'
  | 'support'
  | 'sandbox'
  | 'calendar'
  | 'local-profile';