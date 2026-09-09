import { Buffer } from "node:buffer";
import { sanitizeMathMarkdown } from "./lkpd-utils";

const xml = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]!);
const text = (value: string) => `<m:r><m:t xml:space="preserve">${xml(value)}</m:t></m:r>`;
const run = (value: string, bold = false) => `<w:r>${bold ? "<w:rPr><w:b/></w:rPr>" : ""}<w:t xml:space="preserve">${xml(value)}</w:t></w:r>`;
const operators: Record<string, string> = { times: "×", div: "÷", pm: "±", le: "≤", leq: "≤", ge: "≥", geq: "≥", neq: "≠", to: "→", rightarrow: "→", cdot: "·", sum: "∑", prod: "∏", infty: "∞", pi: "π", theta: "θ", alpha: "α", beta: "β", gamma: "γ" };

function group(source: string, start: number): [string, number] {
  if (source[start] !== "{") return [source[start] || "", start + 1];
  let depth = 1;
  for (let index = start + 1; index < source.length; index++) {
    if (source[index] === "{") depth++;
    if (source[index] === "}" && --depth === 0) return [source.slice(start + 1, index), index + 1];
  }
  return [source.slice(start + 1), source.length];
}

function mathParts(source: string): string {
  let output = "";
  for (let index = 0; index < source.length;) {
    if (source.startsWith("\\frac", index)) {
      let cursor = index + 5;
      while (/\s/.test(source[cursor] || "")) cursor++;
      const [numerator, afterNumerator] = group(source, cursor);
      cursor = afterNumerator;
      while (/\s/.test(source[cursor] || "")) cursor++;
      const [denominator, afterDenominator] = group(source, cursor);
      output += `<m:f><m:num>${mathParts(numerator)}</m:num><m:den>${mathParts(denominator)}</m:den></m:f>`;
      index = afterDenominator;
      continue;
    }
    if (source.startsWith("\\sqrt", index)) {
      let cursor = index + 5;
      while (/\s/.test(source[cursor] || "")) cursor++;
      const [radicand, after] = group(source, cursor);
      output += `<m:rad><m:radPr><m:degHide m:val="on"/></m:radPr><m:deg/><m:e>${mathParts(radicand)}</m:e></m:rad>`;
      index = after;
      continue;
    }
    if (source[index] === "^" || source[index] === "_") {
      const superscript = source[index] === "^";
      const [value, after] = group(source, index + 1);
      output = `<m:${superscript ? "sSup" : "sSub"}><m:e>${output || text(" ")}</m:e><m:${superscript ? "sup" : "sub"}>${mathParts(value)}</m:${superscript ? "sup" : "sub"}></m:${superscript ? "sSup" : "sSub"}>`;
      index = after;
      continue;
    }
    if (source[index] === "\\") {
      const match = source.slice(index + 1).match(/^[A-Za-z]+/);
      if (match) {
        const name = match[0];
        if ((name === "text" || name === "mathrm" || name === "mathit") && source[index + name.length + 1] === "{") {
          const [value, after] = group(source, index + name.length + 1);
          output += text(value);
          index = after;
          continue;
        }
        if ((name === "mathbf" || name === "textbf" || name === "boldsymbol") && source[index + name.length + 1] === "{") {
          const [value, after] = group(source, index + name.length + 1);
          output += `<m:r><m:rPr><m:b/></m:rPr><m:t xml:space="preserve">${xml(value)}</m:t></m:r>`;
          index = after;
          continue;
        }
        output += text(operators[name] || name);
        index += name.length + 1;
        continue;
      }
    }
    if (!"{}".includes(source[index])) output += text(source[index]);
    index++;
  }
  return output;
}

export function latexToOmml(source: string, block = false): string {
  const math = `<m:oMath>${mathParts(source.trim().replace(/\\left|\\right/g, ""))}</m:oMath>`;
  return block ? `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/></w:pPr><m:oMathPara>${math}</m:oMathPara></w:p>` : math;
}

function inline(source: string): string {
  const parts = source.split(/(\$[^$\n]+\$)/g);
  return parts.map(part => part.startsWith("$") && part.endsWith("$") ? latexToOmml(part.slice(1, -1)) : run(part)).join("");
}

function paragraph(content: string, style?: string, properties = ""): string {
  return `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ""}${properties}</w:pPr>${inline(content)}</w:p>`;
}

function cell(content: string, header: boolean): string {
  return `<w:tc><w:tcPr><w:tcW w:w="0" w:type="auto"/><w:tcBorders><w:top w:val="single" w:sz="4" w:color="CCCCCC"/><w:left w:val="single" w:sz="4" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:color="CCCCCC"/><w:right w:val="single" w:sz="4" w:color="CCCCCC"/></w:tcBorders></w:tcPr><w:p>${header ? `<w:r><w:rPr><w:b/></w:rPr><w:t>${xml(content.trim())}</w:t></w:r>` : inline(content.trim())}</w:p></w:tc>`;
}

export function markdownToWordXml(markdown: string): string {
  const sanitized = sanitizeMathMarkdown(markdown);
  const lines = sanitized.replace(/\r/g, "").split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (line.trim().startsWith("$$")) {
      let value = line.trim().slice(2);
      while (!value.endsWith("$$") && ++index < lines.length) value += ` ${lines[index].trim()}`;
      output.push(latexToOmml(value.replace(/\$\$$/, ""), true));
      index++;
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { output.push(paragraph(heading[2], `Heading${heading[1].length}`)); index++; continue; }
    if (line.includes("|") && lines[index + 1]?.match(/^\s*\|?\s*:?-{3}/)) {
      const rows: string[][] = [];
      rows.push(line.replace(/^\||\|$/g, "").split("|"));
      index += 2;
      while (index < lines.length && lines[index].includes("|")) rows.push(lines[index++].replace(/^\||\|$/g, "").split("|"));
      const colCount = Math.max(1, rows[0]?.length || 1);
      const grid = `<w:tblGrid>${Array.from({ length: colCount }).map(() => `<w:gridCol w:w="${Math.floor(8600 / colCount)}"/>`).join("")}</w:tblGrid>`;
      output.push(`<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/></w:tblPr>${grid}${rows.map((row, rowIndex) => `<w:tr>${row.map(value => cell(value, rowIndex === 0)).join("")}</w:tr>`).join("")}</w:tbl>`);
      continue;
    }
    const list = line.match(/^\s*([-*+] |\d+[.)] )(.+)$/);
    if (list) { output.push(paragraph(list[2], undefined, `<w:numPr><w:ilvl w:val="0"/><w:numId w:val="${/\d/.test(list[1]) ? 2 : 1}"/></w:numPr>`)); index++; continue; }
    const blockquote = line.match(/^>\s?(.*)$/);
    if (blockquote) { output.push(paragraph(blockquote[1], undefined, `<w:ind w:left="720"/>`)); index++; continue; }
    const paragraphLines = [line.trim()];
    while (lines[index + 1]?.trim() && !/^(#{1,3})\s|^\s*([-*+] |\d+[.)] )|^>|^\$\$/.test(lines[index + 1]) && !(lines[index + 1].includes("|") && lines[index + 2]?.match(/^\s*\|?\s*:?-{3}/))) paragraphLines.push(lines[++index].trim());
    output.push(paragraph(paragraphLines.join(" ")));
    index++;
  }
  return output.join("");
}

const crcTable = Array.from({ length: 256 }, (_, value) => { let crc = value; for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; return crc >>> 0; });
function crc32(data: Uint8Array): number { let crc = 0xffffffff; for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
function u16(value: number) { const data = Buffer.alloc(2); data.writeUInt16LE(value); return data; }
function u32(value: number) { const data = Buffer.alloc(4); data.writeUInt32LE(value >>> 0); return data; }

function zip(files: Record<string, string>): Uint8Array<ArrayBuffer> {
  const local: Buffer[] = [], central: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const filename = Buffer.from(name), data = Buffer.from(content), crc = crc32(data);
    const header = Buffer.concat([u32(0x04034b50), u16(20), u16(0x800), u16(0), u16(0x4000), u16(0x5cbd), u32(crc), u32(data.length), u32(data.length), u16(filename.length), u16(0), filename]);
    local.push(header, data);
    central.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x800), u16(0), u16(0x4000), u16(0x5cbd), u32(crc), u32(data.length), u32(data.length), u16(filename.length), u16(0), u16(0), u16(0), u16(0), u32(0x20), u32(offset), filename]));
    offset += header.length + data.length;
  }
  const directory = Buffer.concat(central);
  return Buffer.concat([...local, directory, u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length), u32(directory.length), u32(offset), u16(0)]);
}

export function createDocx(markdown: string, title: string): Uint8Array<ArrayBuffer> {
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${paragraph(title, "Title")}${markdownToWordXml(markdown)}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body></w:document>`;
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "word/document.xml": document,
    "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/></Relationships>`,
    "word/settings.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:mathPr><m:mathFont m:val="Cambria Math"/><m:defJc m:val="centerGroup"/></m:mathPr></w:settings>`,
    "word/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="32"/><w:szCs w:val="32"/><w:color w:val="1E3A8A"/></w:rPr></w:style>${[1,2,3].map(level => `<w:style w:type="paragraph" w:styleId="Heading${level}"><w:name w:val="heading ${level}"/><w:pPr><w:spacing w:before="200" w:after="80"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:b/><w:sz w:val="${30-level*2}"/><w:szCs w:val="${30-level*2}"/><w:color w:val="1E3A8A"/></w:rPr></w:style>`).join("")}</w:styles>`,
    "word/numbering.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:abstractNum w:abstractNumId="1"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%1."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr></w:lvl></w:abstractNum><w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num><w:num w:numId="2"><w:abstractNumId w:val="1"/></w:num></w:numbering>`,
  };
  return zip(files);
}

