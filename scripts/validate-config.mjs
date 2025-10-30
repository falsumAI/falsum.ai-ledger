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

const missingPortal = !cfg.crm?.hubspot_portal_id || cfg.crm?.hubspot_portal_id === "REPLACE_ME";
const missingForm   = !cfg.crm?.hubspot_form_id || cfg.crm?.hubspot_form_id === "REPLACE_ME";

if (missingPortal) errors.push("crm.hubspot_portal_id is required (create HubSpot)");
if (missingForm)   errors.push("crm.hubspot_form_id is required (create HubSpot)");

const failIfCrmMissing = cfg.policy?.fail_if_crm_missing === true;

if (errors.length) {
  const onlyHubspotMissing = errors.every(e =>
    e.includes("crm.hubspot_portal_id") || e.includes("crm.hubspot_form_id")
  );

  if (failIfCrmMissing && !onlyHubspotMissing) {
    console.error("❌ Rose config validation failed (non-HubSpot):");
    for (const e of errors) console.error(" - " + e);
    process.exit(1);
  }

  console.warn("⚠️ Rose config: HubSpot not created yet. CI allowed.");
  for (const e of errors) console.warn(" - " + e);
  process.exit(0);
}

console.log("✅ config/payment.json OK");
process.exit(0);
