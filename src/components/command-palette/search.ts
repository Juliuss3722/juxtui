/**
 * Ranking for the command palette. Cheap enough to run on every keystroke
 * over a few thousand items, and ordered the way people expect:
 * exact › prefix › word start › substring › in-order letters.
 */

export type MatchRange = [start: number, end: number]

export interface MatchResult {
  score: number
  ranges: MatchRange[]
}

const NO_MATCH: MatchResult = { score: 0, ranges: [] }

export function matchText(query: string, text: string): MatchResult {
  const q = query.trim().toLowerCase()
  if (!q) return { score: 1, ranges: [] }
  const t = text.toLowerCase()
  if (!t) return NO_MATCH

  if (t === q) return { score: 1000, ranges: [[0, t.length]] }
  if (t.startsWith(q)) return { score: 900 - Math.min(t.length - q.length, 100), ranges: [[0, q.length]] }

  const wordStart = findWordStart(t, q)
  if (wordStart > 0) return { score: 700 - Math.min(wordStart, 100), ranges: [[wordStart, wordStart + q.length]] }

  const index = t.indexOf(q)
  if (index > 0) return { score: 500 - Math.min(index, 100), ranges: [[index, index + q.length]] }

  return subsequence(q, t)
}

function findWordStart(t: string, q: string): number {
  let from = 0
  while (from < t.length) {
    const index = t.indexOf(q, from)
    if (index === -1) return -1
    if (index > 0 && /[\s\-_/.:]/.test(t[index - 1]!)) return index
    from = index + 1
  }
  return -1
}

/** Letters in order, not necessarily adjacent | "gtst" finds "Go to settings". */
function subsequence(q: string, t: string): MatchResult {
  const ranges: MatchRange[] = []
  let ti = 0
  let score = 100
  let previous = -2
  for (const char of q) {
    if (char === ' ') continue
    const found = t.indexOf(char, ti)
    if (found === -1) return NO_MATCH
    if (found === previous + 1 && ranges.length) {
      ranges[ranges.length - 1]![1] = found + 1
      score += 12
    } else {
      ranges.push([found, found + 1])
      if (found === 0 || /[\s\-_/.:]/.test(t[found - 1]!)) score += 8
    }
    // Spread-out matches rank lower.
    score -= Math.min(found - ti, 10)
    previous = found
    ti = found + 1
  }
  return { score: Math.max(score, 1), ranges }
}

/** Split text into highlighted and plain runs. */
export function splitByRanges(text: string, ranges: MatchRange[]): Array<{ text: string, match: boolean }> {
  if (!ranges.length) return [{ text, match: false }]
  const parts: Array<{ text: string, match: boolean }> = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (start > cursor) parts.push({ text: text.slice(cursor, start), match: false })
    parts.push({ text: text.slice(start, end), match: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
  return parts
}
