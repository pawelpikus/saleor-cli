import type { Arguments, CommandBuilder } from "yargs";

import { API, GET } from "../../lib/index.js";
import { Options } from "../../types.js";
import { interactiveProject } from "../../middleware/index.js";
import { showResult } from "../../lib/util.js";

export const command = "show [project]";
export const desc = "Show a specific project";

export const builder: CommandBuilder = (_) =>
  _.positional("project", { type: "string", demandOption: false });

export const handler = async (argv: Arguments<Options>) => {
  const result = (await GET(API.Project, argv)) as any;
  showResult(result, argv);
};

export const middlewares = [interactiveProject];
