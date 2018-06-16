import program from 'commander';
import process from 'process';
import Listr from 'listr';
import pkgjson from '../package.json';
import { fetchAndSave, fetchAsset } from './';

export default () => {
  program
    .version(pkgjson.version)
    .description(pkgjson.description)
    .option('-o, --output [dir]', 'output directory')
    .arguments('<host>')
    .action((host) => {
      const tasks = new Listr([
        {
          title: `Download HTML from ${host}`,
          task: ctx => fetchAndSave(host, program.output)
            .then((assetsToDownload) => {
              ctx.assetsToDownload = assetsToDownload;
            }),
        },
        {
          title: 'Fetch page assets',
          task: (ctx) => {
            const taskList = ctx.assetsToDownload.map(asset => ({
              title: `${host}${asset.address}`,
              task: (_, task) => fetchAsset(asset, host).catch(() => task.skip('Error downloading this asset')),
            }));
            return new Listr(taskList, { concurrent: true, collapse: false });
          },
        },
      ], { collapse: false });
      return tasks.run().catch(() => console.error('An error occured'));
    })
    .parse(process.argv);
  if (!program.args.length) {
    program.help();
  }
};
