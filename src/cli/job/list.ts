import { Arguments, CommandBuilder } from "yargs";
import { CliUx } from "@oclif/core";
import chalk from "chalk";

import { API, GET } from "../../lib/index.js";
import { formatDateTime } from "../../lib/util.js";
import { Options } from "../../types.js";

const { ux: cli } = CliUx;

const parseJobName = (name: string) => {
  const [_, type, env, id] = /(\w{3})-(.+)-(\w{32})/g.exec(name) || [];

  return { type, env, id };
};

// TODO environment required in config or as param!!!!!!

export const command = "list";
export const desc = "List jobs";

export const builder: CommandBuilder = (_) =>
  _.option("env", { type: "string" });

export const handler = async (argv: Arguments<Options>) => {
  const result = (await GET(API.Job, argv)) as any[];

  cli.table(result, {
    type: {
      header: "Type",
      minWidth: 2,
      get: ({ job_name }) => {
        const { type } = parseJobName(job_name);

        switch (type) {
          case "crt":
            return chalk.blue("CREATE");
          case "bkp":
            return chalk.blue("BACKUP");
          default:
            return chalk.blue(type.toUpperCase());
        }
      },
    },
    env: {
      header: "Environment",
      minWidth: 2,
      get: ({ job_name }) => parseJobName(job_name).env,
    },
    created_at: {
      minWidth: 2,
      get: ({ created_at }) => chalk.gray(formatDateTime(created_at)),
    },
    status: {
      minWidth: 2,
      get: ({ status }) => {
        switch (status) {
          case "SUCCEEDED":
            return chalk.green(status);
          case "PENDING":
            return chalk.yellow(status);
          default:
            return status;
        }
      },
    },
    job_name: {
      header: "ID",
      minWidth: 2,
      get: ({ job_name }) => parseJobName(job_name).id,
    },
  });

  process.exit(0);
};
