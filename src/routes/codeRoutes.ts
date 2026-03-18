import { Router, Request, Response, NextFunction } from 'express';
import { CodeValidator } from '../validators/codeValidator';
import { CodeAnalyzer } from '../services/codeAnalyzer';
import { z } from 'zod';

const router = Router();

// Validation middleware
const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// POST /api/code/analyze - Analyze code quality and metrics
router.post('/analyze', validate(CodeValidator.analyze), (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    const analysis = CodeAnalyzer.analyze(code, language);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Analysis failed',
      code: 'ANALYSIS_ERROR',
      details: error.message
    });
  }
});

// POST /api/code/format - Format and prettify code
router.post('/format', validate(CodeValidator.format), (req: Request, res: Response) => {
  try {
    const { code, language, indentSize } = req.body;
    const result = CodeAnalyzer.format(code, language, indentSize);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Formatting failed',
      code: 'FORMAT_ERROR',
      details: error.message
    });
  }
});

// POST /api/code/validate - Validate code against rules
router.post('/validate', validate(CodeValidator.validate), (req: Request, res: Response) => {
  try {
    const { code, language, rules } = req.body;
    const validation = CodeAnalyzer.validate(code, language, rules);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Validation failed',
      code: 'VALIDATION_SERVICE_ERROR',
      details: error.message
    });
  }
});

// POST /api/code/search - Search for patterns in code
router.post('/search', validate(CodeValidator.search), (req: Request, res: Response) => {
  try {
    const { pattern, caseSensitive, regex } = req.body;
    
    // For this stateless API, we'll search in the provided code
    // In a real implementation, this might search across a codebase
    const sampleCode = `
function hello(name) {
  console.log('Hello, ' + name);
  return 'Hello, ' + name;
}

class Calculator {
  add(a, b) {
    return a + b;
  }
  
  multiply(a, b) {
    return a * b;
  }
}

const calc = new Calculator();
console.log(calc.add(2, 3));
`;
    
    const searchResult = CodeAnalyzer.search(sampleCode, pattern, { caseSensitive, regex });
    
    res.json({
      success: true,
      data: {
        ...searchResult,
        searchedIn: 'sample code',
        query: {
          pattern,
          caseSensitive,
          regex
        }
      }
    });
  } catch (error: any) {
    res.status(400).json({
      error: 'Search failed',
      code: 'SEARCH_ERROR',
      details: error.message
    });
  }
});

// GET /api/code/languages - Get supported languages
router.get('/languages', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      languages: ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp'],
      default: 'javascript'
    }
  });
});

// GET /api/code/rules - Get available validation rules
router.get('/rules', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      rules: ['syntax', 'style'],
      descriptions: {
        syntax: 'Check for syntax errors and structural issues',
        style: 'Check for code style and formatting issues'
      }
    }
  });
});

export { router as codeRoutes };