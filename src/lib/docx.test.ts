import assert from "node:assert/strict";
import { test } from "node:test";
import { latexToOmml, markdownToWordXml } from "./docx";

test("frac nested braces", () => {
  const omml = latexToOmml("\\frac{a+b}{c}");
  assert.match(omml, /<m:f><m:num>.*a\+b.*<\/m:num><m:den>.*c.*<\/m:den><\/m:f>/);
});

test("sup and sub", () => {
  assert.match(latexToOmml("x^{2}"), /<m:sSup>/);
  assert.match(latexToOmml("a_{n}"), /<m:sSub>/);
});

test("xml escaping inside math", () => {
  const omml = latexToOmml("a & b < c");
  assert.ok(omml.includes("&amp;") && omml.includes("&lt;"), omml);
});

test("sqrt plain and with degree", () => {
  assert.match(latexToOmml("\\sqrt{x}"), /<m:rad><m:radPr><m:degHide m:val="on"\/><\/m:radPr><m:deg\/><m:e>/);
  assert.match(latexToOmml("\\sqrt[3]{x}"), /<m:deg>.*3.*<\/m:deg>/);
});

test("percent literal", () => {
  const omml = latexToOmml("50\\%");
  assert.ok(!omml.includes("\\"), omml);
  assert.ok(omml.includes("50%") || omml.includes(">50<"), omml);
});

test("degree symbol", () => {
  const omml = latexToOmml("45^{\\circ}");
  assert.ok(omml.includes("°"), omml);
});

test("unknown token falls back to text, not dropped", () => {
  const omml = latexToOmml("\\alpha + \\foobarsym");
  assert.ok(omml.includes("α"), omml);
  assert.ok(omml.includes("foobarsym"), omml);
});

test("block math wrapped in oMathPara", () => {
  const omml = latexToOmml("a = b", true);
  assert.match(omml, /<m:oMathPara><m:oMath>/);
});

test("markdown heading and table structure", () => {
  const xml = markdownToWordXml("# Judul\n\n| a | b |\n|---|---|\n| 1 | 2 |");
  assert.ok(xml.includes('w:val="Heading1"'), xml);
  assert.ok(xml.includes("<w:tbl>"), xml);
});
