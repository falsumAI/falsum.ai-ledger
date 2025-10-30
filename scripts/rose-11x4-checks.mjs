import fs from "node:fs";

const errors = [];

if (!fs.existsSync("docs/continuedmemory10-28.pdf") && !fs.existsSync("docs/continuedmemory10-30.pdf")) {
  errors.push("B1: source PDF missing (put it in docs/)");
}
if (!fs.existsSync("rose/DRIFT_CONTRACT.yml")) {
  errors.push("B2: rose/DRIFT_CONTRACT.yml missing");
}

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

if (errors.length) {
  console.error("❌ 11x11x11x11 protocol violations:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
} else {
  console.log("✅ 11x11x11x11 protocol passed.");
}
