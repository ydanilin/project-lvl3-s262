import fs from 'mz/fs';
import pathlib from 'path';
import getDebugger from './lib/debug';

const debug = getDebugger('save');

const mkdirWithExplain = dir => fs.mkdir(dir)
  .catch((e) => {
    const { dir: place, base: end } = pathlib.parse(dir);
    switch (e.code) {
      case 'EACCES':
        throw new Error(`You are trying to create directory '${end}' in a system-protected place '${place}'`);
      case 'ENOENT':
        throw new Error(`Impossible to create directory '${end}' because there are non-existing dir(s) in path '${place}'`);
      default:
        throw new Error(e);
    }
  });

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
      return mkdirWithExplain(dir);
    })
    .then(() => saveToFile[type](filepath, data))
    .catch((e) => {
      const { dir: place, base } = pathlib.parse(filepath);
      switch (e.code) {
        case 'EACCES':
          throw new Error(`You selected a system-protected directory '${place}' to save file '${base}'`);
        default:
          throw new Error(e);
      }
    });
};
