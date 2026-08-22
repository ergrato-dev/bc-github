import { test } from "node:test";
import assert from "node:assert/strict";
import { calcularTamano } from "../src/tamano.mjs";

test("un PR diminuto es s", () => {
  assert.equal(calcularTamano(12), "s");
});

test("a partir de 30 líneas es m", () => {
  assert.equal(calcularTamano(30), "m");
  assert.equal(calcularTamano(99), "m");
});

test("a partir de 100 líneas es l", () => {
  assert.equal(calcularTamano(100), "l");
  assert.equal(calcularTamano(399), "l");
});

test("el umbral marca el salto a xl y es inclusivo", () => {
  assert.equal(calcularTamano(400), "xl");
  assert.equal(calcularTamano(4000), "xl");
});

test("el umbral se puede cambiar", () => {
  assert.equal(calcularTamano(50, 40), "xl");
  assert.equal(calcularTamano(39, 40), "m");
});
