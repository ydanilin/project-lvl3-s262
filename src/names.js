import url from 'url';

const getHtmlFileName = (link) => {
  const { hostname, path } = url.parse(link);
  const baseStr = path !== '/' ? `${hostname}${path}` : `${hostname}`;
  const replaced = baseStr.replace(/\W/g, '-');
  return `${replaced}.html`;
};

export default getHtmlFileName;
