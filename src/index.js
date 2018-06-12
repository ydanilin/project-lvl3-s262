import getHtmlFileName from './names';
import download from './download';
import saveFile from './save';

export default (weblink, dir = process.cwd()) => {
  const htmlFileName = getHtmlFileName(weblink);
  return download(weblink)
    .then(response => saveFile(dir, htmlFileName, response.data, 'text'));
};
