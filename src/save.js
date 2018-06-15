import fs from 'mz/fs';
import pathlib from 'path';
import getDebugger from './lib/debug';

const debug = getDebugger('save');

const saveToFile = {
  text: (filepath, data) => {
    debug(`write text file to: ${filepath}`);
    return fs.writeFile(filepath, data, 'utf8');
  },
  bin: (filepath, data) => {
    debug(`write binary file to: ${filepath}`);
    data.pipe(fs.createWriteStream(filepath));
  },
};

export default (filepath, data = '', type) => {
  debug(`invoked file saving: ${filepath}`);
  const { dir } = pathlib.parse(filepath);
  return fs.exists(dir)
    .then((exists) => {
      if (exists) {
        debug(`directory ${dir} already exists`);
        return Promise.resolve();
      }
      debug(`will make directory ${dir}`);
      return fs.mkdir(dir);
    })
    .then(() => saveToFile[type](filepath, data));
};
