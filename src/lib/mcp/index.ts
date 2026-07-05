import { defineMcp } from "@lovable.dev/mcp-js";
import listPlans from "./tools/list-plans";
import listWebsiteProducts from "./tools/list-website-products";
import listIntegrations from "./tools/list-integrations";
import searchHelpArticles from "./tools/search-help-articles";

export default defineMcp({
  name: "busistree-mcp",
  title: "Busistree",
  version: "0.1.0",
  instructions:
    "Read-only tools for Busistree — a Pakistan-focused portal for launching WordPress stores. Use these tools to browse subscription plans, marketplace website products (pages/sections/popups), integrations, and help center articles.",
  tools: [listPlans, listWebsiteProducts, listIntegrations, searchHelpArticles],
});
