import {
  Wrench,
  Beaker,
  Binary,
  TestTube,
  Landmark,
  Calendar,
  HeartPulse,
  FileText,
  Code,
  Terminal,
  GraduationCap,
  Smile,
  BookOpen,
  Scale,
  Banknote
} from 'lucide-react';

export const toolCategories = [
  {
    label: 'Tools',
    Icon: Wrench,
    items: [
      { id: 'math-tools', label: 'Math Tools', Icon: Beaker },
      { id: 'programmer', label: 'Programmer', Icon: Binary },
      { id: 'periodic', label: 'Periodic Table', Icon: TestTube },
      { id: 'financial', label: 'Financial', Icon: Landmark },
      { id: 'date', label: 'Date & Time', Icon: Calendar },
      { id: 'health', label: 'Health', Icon: HeartPulse },
      { id: 'text', label: 'Text Tools', Icon: FileText },
      { id: 'developer', label: 'Developer', Icon: Code },
      { id: 'sandbox', label: 'Math Sandbox', Icon: Terminal },
      { id: 'student', label: 'Academic', Icon: GraduationCap },
      { id: 'k5worksheets', label: 'K-5 Math Lab', Icon: Smile },
      { id: 'exercises', label: 'Exercises', Icon: BookOpen },
      { id: 'study-guides', label: 'DBE Study Guides', Icon: GraduationCap },
    ]
  },
  {
    label: 'Converters',
    Icon: Scale,
    items: [
      { id: 'units', label: 'Units', Icon: Scale },
      { id: 'currency', label: 'Currency', Icon: Banknote },
      { id: 'base', label: 'Base', Icon: Binary },
    ]
  }
];
