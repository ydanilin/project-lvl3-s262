import url from 'url';
import pathlib from 'path';
import getDebugger from './lib/debug';
import { getRootNameToSave, getBaseUrl } from './names';
import download from './download';
import parse from './parse';
import saveFile from './save';

const debug = getDebugger('index');

export const fetchAndSave = (weblink, dir = process.cwd()) => {
  const rootNameToSave = getRootNameToSave(weblink);
  const saveHtmlPathName = pathlib.resolve(dir, `${rootNameToSave}.html`);
  const assetDir = pathlib.resolve(dir, `${rootNameToSave}_files`);
  debug(`fetchAndSave - requested URL: ${weblink}, directory for assets: ${assetDir}`);
  const { host } = url.parse(weblink);
  return download(weblink)
    .then(response => parse(response.data, assetDir, host))
    .then(([html, assetsToDownload]) => saveFile(saveHtmlPathName, html, 'text')
      .then(() => assetsToDownload));
};

export const fetchAsset = (assetRecord, weblink) => {
  const { address, localPath, type } = assetRecord;
  const baseURL = getBaseUrl(weblink);
  debug(`fetchAsset - requested resource from: ${baseURL}${address}`);
  return download(`${baseURL}${address}`, type)
    .then(response => saveFile(localPath, response.data, type));
};
