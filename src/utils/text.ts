/** Add an indefinite form prefix to a word. E.g., "apple" -> "an apple" */
export const ana = (input: string) => {
  if (!input) return input
  if (input.toLowerCase() === 'water') {
    return 'some water'
  }
  const vowels = ['a', 'e', 'i', 'o', 'u']
  const prefix = vowels.includes(input.toLowerCase().at(0)!) ? 'an' : 'a'
  return `${prefix} ${input}`
}

/** Uppercase the first letter of a string. */
export const sentence = (input: string) => {
  if (!input) return input
  return input.charAt(0).toUpperCase() + input.slice(1)
}

/**
 * Concatenate the string fragments and interpolated values
 * to get a single string.
 * @url https://adamcoster.com/blog/prettify-your-javascript-strings
 */
function populateTemplate(strings: TemplateStringsArray, ...interps: string[]) {
  let string = ''
  for (let i = 0; i < strings.length; i++) {
    string += `${strings[i] || ''}${interps[i] || ''}`
  }
  return string
}

/**
 * Shift all lines left by the *smallest* indentation level,
 * and remove initial newline and all trailing spaces.
 * @url https://adamcoster.com/blog/prettify-your-javascript-strings
 */
export function undent(strings: TemplateStringsArray, ...interps: string[]) {
  let string = populateTemplate(strings, ...interps)
  // Remove initial and final newlines
  string = string.replace(/^[\r\n]+/, '').replace(/\s+$/, '')
  const dents = string.match(/^([ \t])*/gm)
  if (!dents || dents.length == 0) {
    return string
  }
  dents.sort((dent1, dent2) => dent1.length - dent2.length)
  const minDent = dents[0]
  if (!minDent) {
    // Then min indentation is 0, no change needed
    return string
  }
  const dedented = string.replace(new RegExp(`^${minDent}`, 'gm'), '')
  return dedented
}

/**
 * Remove linebreaks and extra spacing in a template string.
 * @url https://adamcoster.com/blog/prettify-your-javascript-strings
 */
export function oneline(strings: TemplateStringsArray, ...interps: string[]) {
  return populateTemplate(strings, ...interps)
    .replace(/^\s+/, '')
    .replace(/\s+$/, '')
    .replace(/\s+/g, ' ')
}
