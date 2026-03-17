import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callAnalyticsApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerReportCommands(program: Command): void {
  program
    .command("report")
    .description("Run a YouTube Analytics report")
    .requiredOption("--metrics <metrics>", "Metrics (e.g. views,likes,subscribersGained)")
    .requiredOption("--start-date <date>", "Start date (YYYY-MM-DD)")
    .requiredOption("--end-date <date>", "End date (YYYY-MM-DD)")
    .option("--dimensions <dims>", "Dimensions (e.g. day,video,country)")
    .option("--filters <filters>", "Filters (e.g. video==VIDEO_ID;country==US)")
    .option("--sort <sort>", "Sort order (e.g. -views)")
    .option("--max-results <n>", "Max results")
    .option("--ids <ids>", "Channel or content owner", "channel==MINE")
    .option("--currency <code>", "Currency code (e.g. USD)")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          ids: opts.ids,
          metrics: opts.metrics,
          startDate: opts.startDate,
          endDate: opts.endDate,
        };
        if (opts.dimensions) params.dimensions = opts.dimensions;
        if (opts.filters) params.filters = opts.filters;
        if (opts.sort) params.sort = opts.sort;
        if (opts.maxResults) params.maxResults = opts.maxResults;
        if (opts.currency) params.currency = opts.currency;
        const data = await callAnalyticsApi("/reports", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
