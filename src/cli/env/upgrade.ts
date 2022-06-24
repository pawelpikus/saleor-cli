import type { Arguments, CommandBuilder } from "yargs";

import { API, GET, PUT } from "../../lib/index.js";
import { Options } from "../../types.js";
import { promptCompatibleVersion, waitForTask } from "../../lib/util.js";
import { useEnvironment } from "../../middleware/index.js";

export const command = "upgrade [key|environment]";
export const desc = "Upgrade a Saleor version in a specific environment";

export const builder: CommandBuilder = (_) =>
  _.positional("key", {
    type: "string",
    demandOption: false,
    desc: "key of the environment",
  });

export const handler = async (argv: Arguments<Options>) => {
  const env = (await GET(API.Environment, argv)) as any;
  const service = await promptCompatibleVersion({
    ...argv,
    region: env.service.region,
    serviceName: `?compatible_with=${env.service.version}`,
  });

  const result = (await PUT(API.UpgradeEnvironment, argv, {
    json: { service: service.value },
  })) as any;
  await waitForTask(
    argv,
    result.task_id,
    "Upgrading",
    "Yay! Upgrade finished!"
  );
};

export const middlewares = [useEnvironment];
