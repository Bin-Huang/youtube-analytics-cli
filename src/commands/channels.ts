import { Command } from "commander";
import { loadCredentials } from "../auth.js";
import { callDataApi } from "../api.js";
import { output, fatal } from "../utils.js";

export function registerChannelCommands(program: Command): void {
  program
    .command("channels [channel-id]")
    .description("Get channel details (omit ID for authenticated user's channel)")
    .option("--part <parts>", "Parts to include", "snippet,statistics,contentDetails")
    .action(async (channelId: string | undefined, opts) => {
      try {
        const creds = loadCredentials(program.opts().credentials);
        const params: Record<string, string> = {
          part: opts.part,
        };
        // mine=true requires OAuth, cannot use API key
        const requireOAuth = !channelId;
        if (channelId) {
          params.id = channelId;
        } else {
          params.mine = "true";
        }
        const data = await callDataApi("/channels", { creds, params, requireOAuth });
        output(data, program.opts().format);
      } catch (err) {
        fatal((err as Error).message);
      }
    });
}
