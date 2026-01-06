/**
 * Advanced JSON Parser for LLM Responses
 * Handles malformed JSON with multiple recovery strategies
 */

interface ParseOptions {
  attemptFix?: boolean
  maxBlocks?: number
  preferFirst?: boolean
  allowPartial?: boolean
}

/**
 * Main JSON parsing function with fallback strategies
 */
export default function parseLLMJson(
  text: string,
  options: ParseOptions = {}
): any {
  const {
    attemptFix = true,
    maxBlocks = 5,
    preferFirst = true,
    allowPartial = false,
  } = options

  // Trim whitespace
  let cleaned = text.trim()

  // Remove markdown code blocks
  cleaned = cleaned.replace(/^```(?:json|JSON)?\s*\n?/gm, '')
  cleaned = cleaned.replace(/\n?```\s*$/gm, '')
  cleaned = cleaned.trim()

  // Try direct parse first
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    // Continue to recovery strategies
  }

  if (!attemptFix) {
    return null
  }

  // Strategy 1: Fix common JSON issues
  let fixed = cleaned

  // Remove trailing commas
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

  // Fix single quotes to double quotes (simple approach)
  fixed = fixQuotes(fixed)

  // Fix Python-style booleans and None
  fixed = fixed.replace(/\bTrue\b/g, 'true')
  fixed = fixed.replace(/\bFalse\b/g, 'false')
  fixed = fixed.replace(/\bNone\b/g, 'null')

  // Remove BOM if present
  fixed = fixed.replace(/^\uFEFF/, '')

  try {
    return JSON.parse(fixed)
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Extract JSON blocks
  const jsonBlocks = extractJsonBlocks(fixed, maxBlocks)

  for (const block of jsonBlocks) {
    try {
      const fixed2 = block
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')

      const result = JSON.parse(fixed2)
      if (result && typeof result === 'object') {
        return result
      }
    } catch (e) {
      // Try next block
    }
  }

  // Strategy 3: Try with aggressive fixes
  let aggressive = cleaned
    .replace(/,(\s*[}\]])/g, '$1') // Trailing commas
    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Unquoted keys
    .replace(/'/g, '"') // Single to double quotes

  try {
    return JSON.parse(aggressive)
  } catch (e) {
    // Last resort
  }

  // If all else fails, return null
  return null
}

/**
 * Fix quote issues in JSON strings
 */
function fixQuotes(text: string): string {
  // This is a simplified approach - protect already-quoted strings
  let result = ''
  let inDoubleQuote = false
  let inSingleQuote = false
  let i = 0

  while (i < text.length) {
    const char = text[i]

    if (char === '"' && (i === 0 || text[i - 1] !== '\\')) {
      inDoubleQuote = !inDoubleQuote
      result += char
    } else if (char === "'" && (i === 0 || text[i - 1] !== '\\')) {
      if (!inDoubleQuote) {
        inSingleQuote = !inSingleQuote
        result += '"'
      } else {
        result += char
      }
    } else {
      result += char
    }

    i++
  }

  return result
}

/**
 * Extract potential JSON blocks from text
 */
function extractJsonBlocks(text: string, maxBlocks: number): string[] {
  const blocks: string[] = []
  let braceCount = 0
  let bracketCount = 0
  let startIndex = -1

  for (let i = 0; i < text.length && blocks.length < maxBlocks; i++) {
    const char = text[i]

    if ((char === '{' || char === '[') && startIndex === -1) {
      startIndex = i
    }

    if (char === '{') braceCount++
    if (char === '}') braceCount--
    if (char === '[') bracketCount++
    if (char === ']') bracketCount--

    // End of a complete JSON block
    if (startIndex !== -1 && braceCount === 0 && bracketCount === 0) {
      blocks.push(text.substring(startIndex, i + 1))
      startIndex = -1
    }
  }

  return blocks
}
