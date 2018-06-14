import fs from 'mz/fs';
import pathlib from 'path';

const saveToFile = {
  text: (filepath, data) => fs.writeFile(filepath, data, 'utf8'),
  bin: (filepath, data) => data.pipe(fs.createWriteStream(filepath)),
};

const dirCreationError = err => Promise.reject(err);

export default (filepath, data = '', type) => {
  const { dir } = pathlib.parse(filepath);
  return fs.exists(dir)
    .then(exists => (exists ? Promise.resolve() : fs.mkdir(dir)))
    .then(() => saveToFile[type](filepath, data), dirCreationError);
};
