import url from 'url';
import pathlib from 'path';
import axios from './lib/axios';
import getDebugger from './lib/debug';
import { getRootNameToSave, getBaseUrl } from './names';
import download from './download';
import parse from './parse';
import saveFile from './save';

const debug = getDebugger('indexjs');

export const fetchAndSave = (weblink, dir = process.cwd()) => {
  axios.defaults.baseURL = getBaseUrl(weblink);
  const rootNameToSave = getRootNameToSave(weblink);
  const saveHtmlPathName = pathlib.resolve(dir, `${rootNameToSave}.html`);
  debug('rootNameToSave: %s', rootNameToSave);
  const assetDir = pathlib.resolve(dir, `${rootNameToSave}_files`);
  const { host } = url.parse(weblink); // delete, see next
  return download(weblink)
    // pass whole response, parse() will figure out host by himself
    .then(response => parse(response.data, assetDir, host))
    .then(([html, assetsToDownload]) => saveFile(saveHtmlPathName, html, 'text')
      .then(() => assetsToDownload));
};

export const fetchAsset = (assetRecord) => {
  const { address, localPath, type } = assetRecord;
  return download(address, type)
    .then(response => saveFile(localPath, response.data, type))
    .then(() => Promise.resolve());
};
