import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import getDebugger from './lib/debug';
import { getAssetNameToSave } from './names';

const debug = getDebugger('parse');

const neededTags = {
  link: { attr: 'href', type: 'text' },
  img: { attr: 'src', type: 'bin' },
  script: { attr: 'src', type: 'text' },
};

export default (html, assetDir, ourHost) => {
  const $ = cheerio.load(html);

  const checkNoLinkOrOffsite = tagName => (i, elem) => {
    const link = $(elem).attr(neededTags[tagName].attr);
    if (!link) {
      debug(`dropped tag '${elem.name}' with no ${neededTags[tagName].attr} attribute`);
      return false;
    }
    const { host } = url.parse(link);
    const result = host === ourHost || !host;
    if (!result) {
      debug(`dropped offsite link '${link}'`);
    }
    return result;
  };

  const filtered = _.flatten(Object.keys(neededTags)
    .map(tag => $(tag).filter(checkNoLinkOrOffsite(tag)).toArray()));

  // replace link in html is a side effect in this map:
  const assetsToDownload = filtered.map((x, i) => {
    var address = $(x).attr(neededTags[x.name].attr);
    const localPath = `${assetDir}/${getAssetNameToSave(address)}`;
    $(x).attr(neededTags[x.name].attr, localPath);
    debug(`extracted asset: ${address}, path changed to local: ${localPath}`);
    // hack for error - delete then!!!
    if (i === 1) {
      address = '/fake/path';
    }
    // hack for error ends
    return {
      name: x.name, address, localPath, type: neededTags[x.name].type,
    };
  });
  debug(`total ${assetsToDownload.length} local asset links are extracted`);
  return [$.html(), assetsToDownload];
};
