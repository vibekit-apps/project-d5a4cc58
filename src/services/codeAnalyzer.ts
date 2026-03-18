export interface CodeAnalysisResult {
  id: string;
  language: string;
  metrics: {
    lines: number;
    characters: number;
    functions: number;
    classes: number;
    complexity: number;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    line?: number;
    column?: number;
  }>;
  suggestions: string[];
}

export interface CodeFormatResult {
  id: string;
  original: string;
  formatted: string;
  changes: number;
}

export interface CodeValidationResult {
  id: string;
  valid: boolean;
  errors: Array<{
    rule: string;
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning';
  }>;
}

export interface CodeSearchResult {
  matches: Array<{
    line: number;
    column: number;
    match: string;
    context: string;
  }>;
  total: number;
}

export class CodeAnalyzer {
  static analyze(code: string, language: string): CodeAnalysisResult {
    const lines = code.split('\n');
    const characters = code.length;
    
    // Simple pattern matching for different constructs
    const functionPatterns = {
      javascript: /function\s+\w+|\w+\s*=>|\w+\s*:\s*function/g,
      typescript: /function\s+\w+|\w+\s*=>|\w+\s*:\s*function/g,
      python: /def\s+\w+/g,
      java: /(public|private|protected)\s+(static\s+)?\w+\s+\w+\s*\(/g,
      cpp: /\w+\s+\w+\s*\([^)]*\)\s*\{/g,
      csharp: /(public|private|protected)\s+(static\s+)?\w+\s+\w+\s*\(/g
    };
    
    const classPatterns = {
      javascript: /class\s+\w+/g,
      typescript: /class\s+\w+/g,
      python: /class\s+\w+/g,
      java: /(public\s+)?(abstract\s+)?class\s+\w+/g,
      cpp: /class\s+\w+/g,
      csharp: /(public\s+)?(abstract\s+)?class\s+\w+/g
    };
    
    const functionMatches = code.match(functionPatterns[language as keyof typeof functionPatterns]) || [];
    const classMatches = code.match(classPatterns[language as keyof typeof classPatterns]) || [];
    
    // Simple complexity calculation based on cyclomatic complexity indicators
    const complexityPatterns = /if\s*\(|while\s*\(|for\s*\(|catch\s*\(|case\s+|&&|\|\|/g;
    const complexityMatches = code.match(complexityPatterns) || [];
    const complexity = complexityMatches.length + 1;
    
    // Basic issue detection
    const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string; line?: number; column?: number }> = [];
    
    // Check for common issues
    lines.forEach((line, index) => {
      if (line.length > 120) {
        issues.push({
          type: 'warning',
          message: 'Line too long (>120 characters)',
          line: index + 1
        });
      }
      
      if (line.includes('console.log') && language === 'javascript') {
        issues.push({
          type: 'warning',
          message: 'Console.log statement found',
          line: index + 1
        });
      }
      
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'info',
          message: 'TODO/FIXME comment found',
          line: index + 1
        });
      }
    });
    
    const suggestions = [];
    if (complexity > 10) {
      suggestions.push('Consider breaking down complex functions');
    }
    if (lines.length > 1000) {
      suggestions.push('Consider splitting large files into smaller modules');
    }
    if (functionMatches.length === 0 && classMatches.length === 0) {
      suggestions.push('Consider organizing code into functions or classes');
    }
    
    return {
      id: Date.now().toString(),
      language,
      metrics: {
        lines: lines.length,
        characters,
        functions: functionMatches.length,
        classes: classMatches.length,
        complexity
      },
      issues,
      suggestions
    };
  }
  
  static format(code: string, language: string, indentSize: number = 2): CodeFormatResult {
    const original = code;
    let formatted = code;
    let changes = 0;
    
    // Simple formatting rules
    const lines = code.split('\n');
    const formattedLines: string[] = [];
    let indentLevel = 0;
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Adjust indent level based on brackets
      if (trimmed.includes('}') || trimmed.includes(']') || trimmed.includes(')'))
        indentLevel = Math.max(0, indentLevel - 1);
      
      const expectedIndent = ' '.repeat(indentLevel * indentSize);
      const formattedLine = expectedIndent + trimmed;
      
      if (formattedLine !== line) {
        changes++;
      }
      
      formattedLines.push(formattedLine);
      
      // Increase indent for opening brackets
      if (trimmed.includes('{') || trimmed.includes('[') || trimmed.includes('('))
        indentLevel++;
    });
    
    formatted = formattedLines.join('\n');
    
    return {
      id: Date.now().toString(),
      original,
      formatted,
      changes
    };
  }
  
  static validate(code: string, language: string, rules: string[]): CodeValidationResult {
    const errors: Array<{
      rule: string;
      message: string;
      line?: number;
      column?: number;
      severity: 'error' | 'warning';
    }> = [];
    
    const lines = code.split('\n');
    
    if (rules.includes('syntax')) {
      // Basic syntax checks
      lines.forEach((line, index) => {
        const openBrackets = (line.match(/[{\[(]/g) || []).length;
        const closeBrackets = (line.match(/[}\])]/g) || []).length;
        
        if (openBrackets !== closeBrackets) {
          errors.push({
            rule: 'syntax',
            message: 'Mismatched brackets',
            line: index + 1,
            severity: 'error'
          });
        }
      });
    }
    
    if (rules.includes('style')) {
      lines.forEach((line, index) => {
        if (line.endsWith(' ')) {
          errors.push({
            rule: 'style',
            message: 'Trailing whitespace',
            line: index + 1,
            severity: 'warning'
          });
        }
        
        if (line.includes('\t')) {
          errors.push({
            rule: 'style',
            message: 'Use spaces instead of tabs',
            line: index + 1,
            severity: 'warning'
          });
        }
      });
    }
    
    return {
      id: Date.now().toString(),
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }
  
  static search(code: string, pattern: string, options: { caseSensitive?: boolean; regex?: boolean } = {}): CodeSearchResult {
    const { caseSensitive = false, regex = false } = options;
    const lines = code.split('\n');
    const matches: Array<{
      line: number;
      column: number;
      match: string;
      context: string;
    }> = [];
    
    let searchPattern: RegExp;
    
    try {
      if (regex) {
        const flags = caseSensitive ? 'g' : 'gi';
        searchPattern = new RegExp(pattern, flags);
      } else {
        const flags = caseSensitive ? 'g' : 'gi';
        const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchPattern = new RegExp(escapedPattern, flags);
      }
    } catch (error) {
      throw new Error('Invalid regex pattern');
    }
    
    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = searchPattern.exec(line)) !== null) {
        matches.push({
          line: lineIndex + 1,
          column: match.index + 1,
          match: match[0],
          context: line.trim()
        });
      }
    });
    
    return {
      matches,
      total: matches.length
    };
  }
}