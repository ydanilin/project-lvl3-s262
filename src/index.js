import url from 'url';
import axios from './lib/axios';
import { getRootNameToSave, getBaseUrl } from './names';
import download from './download';
import saveFile from './save';

export default (weblink, dir = process.cwd()) => {
  axios.defaults.baseURL = getBaseUrl(weblink);
  const rootNameToSave = getRootNameToSave(weblink);
  return download(weblink)
    .then(response => saveFile(dir, `${rootNameToSave}.html`, response.data, 'text'));
};
