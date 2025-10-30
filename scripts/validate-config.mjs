import fs from "node:fs";

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
if (!cfg.crm?.hubspot_portal_id || cfg.crm?.hubspot_portal_id === "REPLACE_ME")
  errors.push("crm.hubspot_portal_id is required (create HubSpot)");
if (!cfg.crm?.hubspot_form_id || cfg.crm?.hubspot_form_id === "REPLACE_ME")
  errors.push("crm.hubspot_form_id is required (create HubSpot)");

if (cfg.policy?.fail_if_crm_missing && errors.length) {
  console.error("❌ Rose config validation failed:");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("✅ config/payment.json OK (placeholders present)");
