import fs from 'mz/fs';
import pathlib from 'path';

const saveToFile = {
  text: async (filepath, data) => fs.writeFile(filepath, data, 'utf8'),
};

export default async (dir, filename, data = '', type) => {
  const workDir = pathlib.resolve(dir);
  const filepath = pathlib.join(workDir, filename);
  return saveToFile[type](filepath, data);
};
