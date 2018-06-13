import url from 'url';
import axios from './lib/axios';
import { getRootNameToSave, getBaseUrl } from './names';
import download from './download';
import parse from './parse';
import saveFile from './save';

export default (weblink, dir = process.cwd()) => {
  axios.defaults.baseURL = getBaseUrl(weblink);
  const rootNameToSave = getRootNameToSave(weblink);
  const assetDir = `${dir}/${rootNameToSave}_files`;
  const { host } = url.parse(weblink);
  return download(weblink)
    .then(response => parse(response.data, assetDir, host))
    .then(([html, assetsToDownload]) => saveFile(dir, `${rootNameToSave}.html`, html, 'text')
      .then(() => assetsToDownload));
};
