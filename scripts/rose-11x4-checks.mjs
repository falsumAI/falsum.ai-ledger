import fs from "node:fs";

const errors = [];
const inCI = process.env.GITHUB_ACTIONS === "true";

// 1) source PDF check
const has28 = fs.existsSync("docs/continuedmemory10-28.pdf");
const has30 = fs.existsSync("docs/continuedmemory10-30.pdf");
if (!has28 && !has30) {
  errors.push("B1: source PDF missing (put continuedmemory10-28.pdf OR continuedmemory10-30.pdf in docs/)");
}

// 2) required folders
for (const dir of ["exports", "receipts", "scripts", "config"]) {
  if (!fs.existsSync(dir)) {
    errors.push(`F3: missing folder ${dir}`);
  }
}

let cfg = null;
try {
  cfg = JSON.parse(fs.readFileSync("config/payment.json", "utf-8"));
} catch {
  errors.push("L5: cannot read config/payment.json");
}

if (cfg) {
  if (!cfg.payments?.enabled) errors.push("L4/F5: payments must be enabled");
  if (!cfg.crm?.enabled) errors.push("L5/F6: CRM must be enabled");
}

// 3) receipts shape
if (fs.existsSync("receipts")) {
  const files = fs.readdirSync("receipts").filter(f => f.endsWith(".json"));
  for (const f of files) {
    const j = JSON.parse(fs.readFileSync(`receipts/${f}`, "utf-8"));
    if (!j.sha256) errors.push(`D1: ${f} missing sha256`);
    if (!j.created_utc) errors.push(`D3: ${f} missing created_utc`);
    if (!("qr_svg" in j)) errors.push(`D4: ${f} missing qr_svg`);
    if (!("signatures" in j)) errors.push(`D4: ${f} missing signatures`);
  }
}

// ===== CI-friendly exit =====
if (errors.length) {
  const onlyPdfMissing = errors.every(e => e.startsWith("B1: source PDF missing"));

  // in CI, and ONLY pdf is missing → allow
  if (inCI && onlyPdfMissing) {
    console.warn("⚠️ 11x11x11x11: PDF missing in CI, allowing PR.");
    process.exit(0);
  }

  console.error("❌ 11x11x11x11 protocol violations:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("✅ 11x11x11x11 protocol passed.");
process.exit(0);
