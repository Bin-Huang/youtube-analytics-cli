import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callAnalyticsApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerGroupCommands(program: Command): void {
  program
    .command("groups")
    .description("List YouTube Analytics groups")
    .option("--id <id>", "Group ID(s) to retrieve (comma-separated)")
    .option("--next-page-token <token>", "Pagination token")
    .action(async (opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {};
        if (opts.id) {
          params.id = opts.id;
        } else {
          params.mine = "true";
        }
        if (opts.nextPageToken) params.pageToken = opts.nextPageToken;
        const data = await callAnalyticsApi("/groups", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });

  program
    .command("group-items <group-id>")
    .description("List items in a YouTube Analytics group")
    .option("--next-page-token <token>", "Pagination token")
    .action(async (groupId: string, opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          groupId,
        };
        if (opts.nextPageToken) params.pageToken = opts.nextPageToken;
        const data = await callAnalyticsApi("/groupItems", { creds, params });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
