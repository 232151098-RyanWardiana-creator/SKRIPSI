import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createDocx, latexToOmml, markdownToWordXml } from "./docx";

assert.ok(latexToOmml("\\frac{1}{2}").includes("<m:f><m:num><m:r><m:t xml:space=\"preserve\">1</m:t></m:r></m:num>"));
assert.ok(latexToOmml("\\sqrt{x}").includes("<m:rad>"));
assert.ok(latexToOmml("x^{2}").includes("<m:sSup>"));
assert.ok(latexToOmml("a_{1}").includes("<m:sSub>"));
assert.ok(latexToOmml("3 \\times 4").includes("×"));
assert.ok(latexToOmml("y = x", true).includes("<m:oMathPara>"));

const body = markdownToWordXml("# Judul\n\nTeks $x^2$ di sini.\n\n- satu\n- dua\n\n1. urut\n\n> kutipan\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n$$\\frac{a}{b}$$\n");
assert.ok(body.includes('<w:pStyle w:val="Heading1"/>'));
assert.ok(body.includes("<m:sSup>"));
assert.ok(body.includes('<w:numId w:val="1"/>') && body.includes('<w:numId w:val="2"/>'));
assert.ok(body.includes("<w:tbl>") && body.includes("<w:tc>") && body.includes("<w:tblGrid>"));
assert.ok(body.includes("<m:oMathPara>"));
assert.ok(!/[<>]/.test("&") || markdownToWordXml("a < b & c").includes("&lt;"));

const docx = Buffer.from(createDocx("# T\n\n$$\\frac{1}{2}$$\n", "Uji"));
assert.equal(docx.readUInt32LE(0), 0x04034b50);
assert.equal(docx.readUInt32LE(docx.length - 22), 0x06054b50);
assert.equal(docx.readUInt16LE(docx.length - 14), 7);
for (const part of ["[Content_Types].xml", "word/document.xml", "word/styles.xml", "word/numbering.xml", "word/settings.xml", "_rels/.rels", "word/_rels/document.xml.rels"]) {
  assert.ok(docx.includes(Buffer.from(part)), part);
}

console.log("docx self-check OK");
