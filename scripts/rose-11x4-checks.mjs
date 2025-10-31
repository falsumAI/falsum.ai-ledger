#!/usr/bin/env node
import fs from "node:fs";

const inCI = process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true";
const errors = [];

// 1) source PDF
const has28 = fs.existsSync("docs/continuedmemory10-28.pdf");
const has30 = fs.existsSync("docs/continuedmemory10-30.pdf");
if (!has28 && !has30) {
  errors.push("B1: source PDF missing (need continuedmemory10-28.pdf OR continuedmemory10-30.pdf in docs/)");
}

// 2) required folders
for (const dir of ["exports", "receipts", "scripts", "config"]) {
  if (!fs.existsSync(dir)) {
    errors.push(`F3: missing folder ${dir}`);
  }
}

// 3) receipts shape (tolerate BOM)
if (fs.existsSync("receipts")) {
  const files = fs.readdirSync("receipts").filter(f => f.endsWith(".json"));
  for (const f of files) {
    const raw = fs.readFileSync(`receipts/${f}`, "utf8").replace(/^\uFEFF/, "");
    let j;
    try {
      j = JSON.parse(raw);
    } catch (e) {
      errors.push(`D0: ${f} invalid JSON (${e.message})`);
      continue;
    }
    if (!j.sha256) errors.push(`D1: ${f} missing sha256`);
    if (!j.created_utc) errors.push(`D3: ${f} missing created_utc`);
    if (!("qr_svg" in j)) errors.push(`D4: ${f} missing qr_svg`);
    if (!("signatures" in j)) errors.push(`D4: ${f} missing signatures`);
  }
}

if (errors.length) {
  const onlyPdf = errors.every(e => e.startsWith("B1: source PDF missing"));
  if (inCI && onlyPdf) {
    console.warn("⚠️ 11x11x11x11: PDF missing in CI, allowing.");
    process.exit(0);
  }
  console.error("❌ 11x11x11x11 protocol violations:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("✅ 11x11x11x11 protocol passed.");
process.exit(0);
