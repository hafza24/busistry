import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "search_help_articles",
  title: "Search help articles",
  description: "Search Busistree help center articles by keyword in title or content.",
  inputSchema: {
    query: z.string().min(1).describe("Search term to match against article title/content."),
    limit: z.number().int().min(1).max(20).optional().describe("Max results (default 5)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const n = limit ?? 5;
    const { data, error } = await supabase
      .from("help_articles")
      .select("id, slug, title, content, category_id")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(n);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { articles: data ?? [] },
    };
  },
});
