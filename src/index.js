import getHtmlFileName from './names';
import download from './download';
import saveFile from './save';

export default async (weblink, dir = './') => {
  const htmlFileName = getHtmlFileName(weblink);
  const response = await download(weblink);
  return saveFile(dir, htmlFileName, response.data, 'text');
};
