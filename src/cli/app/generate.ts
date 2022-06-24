import { Arguments, CommandBuilder } from "yargs";
import Enquirer from "enquirer";
import { request } from "graphql-request";
import path from "path";
import fs from "fs-extra";
import { render } from "tplv";

import { Options } from "../../types.js";
import { verifyIsSaleorAppDirectory } from "../../lib/common.js";
import { GetWebhookEventEnum } from "../../generated/graphql.js";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { capitalize, uncapitalize } from "../../lib/util.js";
import { DefaultSaleorEndpoint } from "../../lib/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const command = "generate <resource>";
export const desc = "Generate a resource for a Saleor App";

export const builder: CommandBuilder = (_) =>
  _.positional("resource", {
    type: "string",
    demandOption: true,
    choices: ["webhook", "query", "mutation", "subscription"],
  });

export const handler = async (argv: Arguments<Options>) => {
  const { resource } = argv;

  switch (resource) {
    case "webhook":
      const {
        __type: { enumValues },
      } = await request(DefaultSaleorEndpoint, GetWebhookEventEnum);

      const without = (name: string) => (record: any) => record.name !== name;
      const choices = enumValues.filter(without("ANY_EVENTS"));

      const prompt = new (Enquirer as any).AutoComplete({
        name: "event",
        message: "Select a web hook event (start typing)",
        limit: 10,
        choices,
      });

      const form: string = await prompt.run();

      const webhookName = form.toLowerCase().replaceAll("_", "-");
      const camelcaseName = webhookName.split("-").map(capitalize).join("");

      const appWebhookPath = path.join(
        "pages",
        "api",
        "webhooks",
        `${webhookName}.ts`
      );
      const webhookPath = path.join(process.cwd(), appWebhookPath);
      const rootPath = path.resolve(__dirname, "..", "..", "..");
      const webhookHandlerFn = await fs.readFile(
        path.join(rootPath, "template", "webhook-handler.ts"),
        "utf-8"
      );
      await fs.outputFile(webhookPath, webhookHandlerFn);

      console.log(
        `\nGenerated a webhook handler for the '${form}' event in '${appWebhookPath}'`
      );

      const subscriptionPath = path.join(
        process.cwd(),
        "graphql",
        "subscriptions",
        `${camelcaseName}Subscription.graphql`
      );
      const subscriptionTemplatePath = path.join(
        rootPath,
        "template",
        "event-subscription.graphql"
      );
      const subscriptionTemplate = await fs.readFile(
        subscriptionTemplatePath,
        "utf-8"
      );

      const operationName = uncapitalize(
        webhookName.split("-").slice(0, -1).map(capitalize).join("")
      );
      const subscriptionCompiledTemplate = render(subscriptionTemplate, {
        name: camelcaseName,
        operationName,
      });
      await fs.outputFile(subscriptionPath, subscriptionCompiledTemplate);

      break;
    default:
      break;
  }

  process.exit(0);
};

export const middlewares = [verifyIsSaleorAppDirectory];
