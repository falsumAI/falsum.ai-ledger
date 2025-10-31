#!/usr/bin/env node
import fs from "node:fs";

const inCI = process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true";
const envPortal = process.env.HUBSPOT_PORTAL_ID;
const envForm   = process.env.HUBSPOT_FORM_ID;

const errs = [];
let cfg;

try {
  cfg = JSON.parse(fs.readFileSync("config/payment.json", "utf-8"));
} catch {
  console.error("❌ config/payment.json missing or invalid");
  process.exit(1);
}

if (!cfg.payments?.enabled) errs.push("payments must be enabled");
if (!cfg.payments?.product_url) errs.push("payments.product_url is required");
if (!cfg.crm?.enabled) errs.push("crm must be enabled");

const portal = envPortal || cfg.crm?.hubspot_portal_id;
const form   = envForm   || cfg.crm?.hubspot_form_id;

if (!portal) errs.push("crm.hubspot_portal_id missing");
if (!form)   errs.push("crm.hubspot_form_id missing");

if (errs.length) {
  const onlyHubspot = errs.every(e => e.includes("hubspot_"));
  if (inCI && onlyHubspot) {
    console.warn("⚠️ HubSpot IDs missing in CI, allowing.");
    process.exit(0);
  }
  console.error("❌ Rose config validation failed:");
  for (const e of errs) console.error(" - " + e);
  process.exit(1);
}

console.log("✅ Rose config OK");
