#!/usr/bin/env node
import fs from "node:fs";

const inCI = process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true";
const envPortal = process.env.HUBSPOT_PORTAL_ID;
const envForm   = process.env.HUBSPOT_FORM_ID;

const errors = [];
let cfg = null;

const readJson = (p) => {
  try {
    const txt = fs.readFileSync(p, "utf-8").replace(/^\uFEFF/, "");
    return JSON.parse(txt);
  } catch {
    return null;
  }
};

cfg = readJson("config/payment.json");

if (!cfg) {
  errors.push("config/payment.json missing or invalid");
} else {
  if (!cfg.payments?.enabled) errors.push("payments must be enabled");
  if (!cfg.payments?.product_url) errors.push("payments.product_url is required");
  if (!cfg.crm?.enabled) errors.push("crm must be enabled");
}

const portal = envPortal || cfg?.crm?.hubspot_portal_id;
const form   = envForm   || cfg?.crm?.hubspot_form_id;

if (!portal) errors.push("hubspot_portal_id missing");
if (!form)   errors.push("hubspot_form_id missing");

if (errors.length) {
  const onlyHubspot = errors.every(e => e.includes("hubspot_"));
  const missingOnlyCfg = errors.length === 1 && errors[0].startsWith("config/payment.json");
  if (inCI && (onlyHubspot || missingOnlyCfg)) {
    console.warn("⚠️ CI lenient: " + errors.join(" | "));
    process.exit(0);
  }
  console.error("❌ Rose config validation failed:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("✅ Rose config OK (env/file)");
