const htmlEntities = {
  iacute: "í",
  eacute: "é",
  oacute: "ó",
  aacute: "á",
  uacute: "ú",
  ntilde: "ñ",
  uuml: "ü",
  Iacute: "Í",
  Eacute: "É",
  Oacute: "Ó",
  Aacute: "Á",
  Uacute: "Ú",
  Ntilde: "Ñ",
  Uuml: "Ü",
  quot: '"',
  amp: "&",
  lt: "<",
  gt: ">",
  apos: "'",
  nbsp: " ",
  iexcl: "¡",
  iquest: "¿",
  deg: "°",
  sect: "§",
  lsquo: "'",
  rsquo: "'",
  ldquo: '"',
  rdquo: '"',
  euro: "€",
};

export const decodeHtmlEntities = (str) => {
  if (!str) return "";

  // 1. Decodificar entidades numéricas (hex y decimal)
  let decoded = str
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));

  // 2. Decodificar entidades con nombre (case-sensitive)
  decoded = decoded.replace(/&([a-zA-Z]+);/g, (match, entity) => {
    return htmlEntities[entity] || match;
  });

  // 3. Limpiar espacios y caracteres especiales
  return decoded
    .replace(/[\r\n\t]/g, " ") // Reemplazar saltos de línea y tabs
    .replace(/\s{2,}/g, " ") // Espacios múltiples a uno
    .trim();
};
