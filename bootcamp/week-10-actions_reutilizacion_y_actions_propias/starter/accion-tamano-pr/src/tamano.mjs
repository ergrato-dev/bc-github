// La lógica pura: sin GitHub, sin red, sin variables de entorno.
// Separarla así es lo que permite probarla con `node --test` en dos segundos.

/**
 * Decide la etiqueta de tamaño de un pull request.
 *
 * @param {number} lineas  Líneas añadidas + eliminadas.
 * @param {number} umbral  Líneas a partir de las cuales el PR es "xl".
 * @returns {"s"|"m"|"l"|"xl"}
 */
export function calcularTamano(lineas, umbral = 400) {
  // ----------------------------------------------------------------- PASO 1
  // Completa los umbrales intermedios. Los tests de test/tamano.test.mjs
  // describen el comportamiento esperado: hazlos pasar.
  //
  // Criterio sugerido (Semana 06):  s < 30 ≤ m < 100 ≤ l < umbral ≤ xl
  if (lineas >= umbral) return "xl";
  return "s"; // ← sustituye esta línea por los tramos que faltan
}
