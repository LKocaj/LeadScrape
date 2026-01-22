/**
 * Core lead data types for the scraper
 */
export var Trade;
(function (Trade) {
    Trade["HVAC"] = "HVAC";
    Trade["PLUMBING"] = "Plumbing";
    Trade["ELECTRICAL"] = "Electrical";
    Trade["ROOFING"] = "Roofing";
    Trade["GENERAL"] = "General Contractor";
    Trade["UNKNOWN"] = "Unknown";
})(Trade || (Trade = {}));
export var LeadSource;
(function (LeadSource) {
    LeadSource["GOOGLE_MAPS"] = "Google Maps";
    LeadSource["YELP"] = "Yelp";
    LeadSource["LINKEDIN"] = "LinkedIn";
    LeadSource["HOMEADVISOR"] = "HomeAdvisor";
    LeadSource["ANGI"] = "Angi";
    LeadSource["THUMBTACK"] = "Thumbtack";
    LeadSource["BBB"] = "BBB";
    LeadSource["MANUAL"] = "Manual";
})(LeadSource || (LeadSource = {}));
export var LeadStatus;
(function (LeadStatus) {
    LeadStatus["NEW"] = "New";
    LeadStatus["ENRICHED"] = "Enriched";
    LeadStatus["VERIFIED"] = "Verified";
    LeadStatus["EXPORTED"] = "Exported";
    LeadStatus["INVALID"] = "Invalid";
    LeadStatus["DUPLICATE"] = "Duplicate";
})(LeadStatus || (LeadStatus = {}));
//# sourceMappingURL=lead.types.js.map