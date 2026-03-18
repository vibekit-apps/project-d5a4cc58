import { z } from 'zod';

export const CodeValidator = {
  analyze: z.object({
    code: z.string().min(1, 'Code is required').max(100000, 'Code too large'),
    language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp']).optional().default('javascript')
  }),
  
  format: z.object({
    code: z.string().min(1, 'Code is required').max(100000, 'Code too large'),
    language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp']).optional().default('javascript'),
    indentSize: z.number().int().min(1).max(8).optional().default(2)
  }),
  
  validate: z.object({
    code: z.string().min(1, 'Code is required').max(100000, 'Code too large'),
    language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp']).optional().default('javascript'),
    rules: z.array(z.string()).optional().default(['syntax', 'style'])
  }),
  
  search: z.object({
    pattern: z.string().min(1, 'Search pattern is required'),
    language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp']).optional(),
    caseSensitive: z.boolean().optional().default(false),
    regex: z.boolean().optional().default(false)
  })
};