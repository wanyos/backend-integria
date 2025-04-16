export const decodeHtmlEntities = (str) => {
  if (!str) return str
  return str
    .replace(/&#x20;/g, ' ')
    .replace(/&iacute;/g, 'í')
    .replace(/&eacute;/g, 'é')
    .replace(/&oacute;/g, 'ó')
    .replace(/&aacute;/g, 'á')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&uuml;/g, 'ü')
    .replace(/&#40;/g, '(')
    .replace(/&#41;/g, ')')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
}
