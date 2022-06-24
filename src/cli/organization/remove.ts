import type { Arguments, CommandBuilder } from "yargs";
import { API, DELETE } from "../../lib/index.js";
import { Options } from "../../types.js";
import { confirmRemoval, promptOrganization } from "../../lib/util.js";
import { Config } from "../../lib/config.js";
import chalk from "chalk";

export const command = "remove [slug]";
export const desc = "Remove the organization";

export const builder: CommandBuilder = (_) =>
  _.positional("slug", {
    type: "string",
    demandOption: false,
    desc: "slug of the organization",
  }).option("force", {
    type: "boolean",
    desc: "skip confrimation prompt",
  });

export const handler = async (argv: Arguments<Options>) => {
  const organization = argv.slug
    ? { name: argv.slug, value: argv.slug }
    : await promptOrganization(argv);
  const proceed = await confirmRemoval(
    argv,
    `organization ${organization.name}`
  );

  if (proceed) {
    (await DELETE(API.Organization, {
      ...argv,
      organization: organization.value,
    })) as any;
    const { organization_slug } = await Config.get();
    if (organization.value === organization_slug) {
      await Config.remove("organization_slug");
      await Config.remove("environment_id");
    }

    console.log(
      chalk.green("✔"),
      chalk.bold("Organization has been successfuly removed")
    );
  }
};
