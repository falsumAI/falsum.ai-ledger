import fs from "node:fs";

const fromEnvPortal = process.env.HUBSPOT_PORTAL_ID;
const fromEnvForm = process.env.HUBSPOT_FORM_ID;

const errors = [];
let cfg;

try {
  cfg = JSON.parse(fs.readFileSync("config/payment.json", "utf-8"));
} catch {
  console.error("❌ config/payment.json missing or invalid");
  process.exit(1);
}

if (!cfg.payments?.enabled) errors.push("payments must be enabled");
if (!cfg.payments?.product_url) errors.push("payments.product_url is required");

if (!cfg.crm?.enabled) errors.push("crm must be enabled");

const portal = fromEnvPortal || cfg.crm?.hubspot_portal_id;
const form   = fromEnvForm   || cfg.crm?.hubspot_form_id;

if (!portal) errors.push("crm.hubspot_portal_id is required (secret or file)");
if (!form)   errors.push("crm.hubspot_form_id is required (secret or file)");

if (errors.length) {
  console.error("❌ Rose config validation failed:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("✅ Rose config OK (env/file)");
