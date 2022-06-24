import chalk from "chalk";
import type { Arguments, CommandBuilder } from "yargs";

import { Config } from "../../lib/config.js";
import { promptEnvironment } from "../../lib/util.js";

type Options = {
  key?: string;
};

export const command = "switch [key|environment]";
export const desc = "Make the provided environment the default one";

export const builder: CommandBuilder = (_) =>
  _.positional("key", {
    type: "string",
    demandOption: false,
    desc: "key of the environment",
  });

export const handler = async (argv: Arguments<Options>) => {
  const environment = await getEnvironment(argv);

  await Config.set("environment_id", environment.value);
  console.log(
    chalk.green("✔"),
    chalk.bold("Environment ·"),
    chalk.cyan(environment.value)
  );
};

const getEnvironment = async (argv: Arguments<Options>) => {
  if (argv.environment) {
    return { name: argv.key, value: argv.key };
  }

  return await promptEnvironment(argv);
};
