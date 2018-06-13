import url from 'url';
import _ from 'lodash';
import cheerio from 'cheerio';

const neededTags = {
  link: 'href',
  img: 'src',
  script: 'src',
};

export default (html, host = 'ru.hexlet.io') => {
  const checkNoLinkOrOffsite = (tagName, ourHost) => (i, elem) => {
    const link = $(elem).attr(neededTags[tagName]);
    if (!link) {
      return false;
    }
    const { host } = url.parse(link);
    return host === ourHost || !host;
  }

  const $ = cheerio.load(html);
  const filtered = _.flatten(
    Object.keys(neededTags)
      .map(tag => $(tag).filter(checkNoLinkOrOffsite(tag, host)).toArray())
  );
  // filtered.map(x => replaceLink(x))
  filtered.map(x => $(x).attr(neededTags[x.name], 'some link'));
  // const assetsToDownload = filtered.map(x => {name, address})
  // return [$.html(), assetsToDownload];
  console.log($.html());
};