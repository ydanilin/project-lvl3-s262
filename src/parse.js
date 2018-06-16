import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';
import parseDomain from 'parse-domain';
import getDebugger from './lib/debug';
import { getAssetNameToSave, getWeblinkInfo } from './names';

const debug = getDebugger('parse');

const neededTags = {
  link: { attr: 'href', type: 'text' },
  img: { attr: 'src', type: 'bin' },
  script: { attr: 'src', type: 'text' },
};

const resolveToFullLink = (link, weblinkInfo) => {
  const cleanLink = link.replace(/^\/\//g, `${weblinkInfo.protocol}//`);
  const { host } = url.parse(cleanLink);
  return host ? cleanLink : `${weblinkInfo.protocol}//${weblinkInfo.host}${cleanLink}`;
};

export default (html, assetDir, weblink) => {
  const $ = cheerio.load(html);
  const weblinkInfo = getWeblinkInfo(weblink);
  debug('for weblink %s got info structure %o', weblink, weblinkInfo);

  const checkNoLinkOrOffsite = tagName => (i, elem) => {
    const link = $(elem).attr(neededTags[tagName].attr);
    if (!link) {
      debug(`dropped tag '${elem.name}' with no ${neededTags[tagName].attr} attribute`);
      return false;
    }
    const cleanLink = link.replace(/^\/\//g, `${weblinkInfo.protocol}//`);
    debug(`cleaned link is: ${cleanLink}`);
    const { host } = url.parse(cleanLink);
    debug(`extracted host from cleaned link: ${host}`);
    if (!host) {
      debug(`local link passed filter: ${link}`);
      return true;
    }
    const { domain, tld } = parseDomain(host);
    const result = domain === weblinkInfo.domain && tld === weblinkInfo.tld;
    if (!result) {
      debug(`dropped offsite link '${link}'`);
      return result;
    }
    debug(`domain link passed: ${link}`);
    return result;
  };

  const filtered = _.flatten(Object.keys(neededTags)
    .map(tag => $(tag).filter(checkNoLinkOrOffsite(tag)).toArray()));

  // replace link in html is a side effect in this map:
  const assetsToDownload = filtered.map((x) => {
    const address = $(x).attr(neededTags[x.name].attr);
    const localPath = `${assetDir}/${getAssetNameToSave(address)}`;
    $(x).attr(neededTags[x.name].attr, localPath);
    debug(`extracted asset: ${address}, path changed to local: ${localPath}`);
    return {
      name: x.name,
      address: resolveToFullLink(address, weblinkInfo),
      localPath,
      type: neededTags[x.name].type,
    };
  });
  debug(`total ${assetsToDownload.length} local asset links are extracted`);
  return [$.html(), assetsToDownload];
};
