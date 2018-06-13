import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import { getAssetNameToSave } from './names';

const neededTags = {
  link: 'href',
  img: 'src',
  script: 'src',
};

export default (html, assetDir, ourHost) => {
  const $ = cheerio.load(html);

  const checkNoLinkOrOffsite = tagName => (i, elem) => {
    const link = $(elem).attr(neededTags[tagName]);
    if (!link) {
      return false;
    }
    const { host } = url.parse(link);
    return host === ourHost || !host;
  };

  const filtered = _.flatten(Object.keys(neededTags)
    .map(tag => $(tag).filter(checkNoLinkOrOffsite(tag)).toArray()));

  // replace link in html is a side effect in this map:
  const assetsToDownload = filtered.map((x) => {
    const address = $(x).attr(neededTags[x.name]);
    const localPath = `${assetDir}/${getAssetNameToSave(address)}`;
    $(x).attr(neededTags[x.name], localPath);
    return { name: x.name, address, localPath };
  });
  console.log(assetsToDownload);
  return Promise.resolve([$.html(), assetsToDownload]);
};
