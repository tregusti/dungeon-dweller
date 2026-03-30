/** Add an indefinite form prefix to a word. E.g., "apple" -> "an apple" */
export const ana = (input: string) => {
  if (!input) return input
  const vowels = ['a', 'e', 'i', 'o', 'u']
  const prefix = vowels.includes(input.toLowerCase().at(0)!) ? 'an' : 'a'
  return `${prefix} ${input}`
}

/** Uppercase the first letter of a string. */
export const sentence = (input: string) => {
  if (!input) return input
  return input.charAt(0).toUpperCase() + input.slice(1)
}
