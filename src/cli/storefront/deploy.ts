import chalk from 'chalk';
import fs from 'fs-extra';
import GitUrlParse from 'git-url-parse';
import path from 'path';
import type { CommandBuilder } from 'yargs';

import { useVercel } from '../../middleware/index.js';
import {
  createProjectInVercel,
  getRepoUrl,
  triggerDeploymentInVercel,
} from '../app/deploy.js';

export const command = 'deploy';
export const desc = 'Deploy this `react-storefront` to Vercel';

export const builder: CommandBuilder = (_) => _;

export const handler = async () => {
  const { name } = JSON.parse(
    await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  console.log(
    `\nDeploying... ${chalk.cyan(name)} (the name inferred from ${chalk.yellow(
      'package.json'
    )})`
  );

  const repoUrl = await getRepoUrl(name);
  const { owner, name: repoName } = GitUrlParse(repoUrl);

  console.log('\nDeploying to Vercel');
  // 2. Create a project in Vercel
  const { projectId, newProject } = await createProjectInVercel(
    name,
    owner,
    repoName
  );
  // 3. Deploy the project in Vercel
  await triggerDeploymentInVercel(name, owner, projectId, newProject);

  process.exit(0);
};

export const middlewares = [useVercel];
