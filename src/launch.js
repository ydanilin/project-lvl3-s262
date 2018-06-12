import program from 'commander';
import process from 'process';
import Listr from 'listr';
import pkgjson from '../package.json';
import fetchAndSave from './';

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
          task: () => fetchAndSave(host),
        },
      ]);
      tasks.run().catch(err => console.error(err));
    })
    .parse(process.argv);
  if (!program.args.length) {
    program.help();
  }
};
