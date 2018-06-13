import url from 'url';
import pathlib from 'path';

export const getRootNameToSave = (link) => {
  const { hostname, path } = url.parse(link);
  const baseStr = path !== '/' ? `${hostname}${path}` : `${hostname}`;
  return baseStr.replace(/\W/g, '-');
};

export const getBaseUrl = (fullUrl) => {
  const { protocol, host, port } = url.parse(fullUrl);
  return url.format({ protocol, host, port });
};

export const getAssetNameToSave = (link) => {
  const { path } = url.parse(link);
  const { dir, ext, name } = pathlib.parse(path);
  const dirpath = dir.replace(/^\W/g, '').replace(/\W/g, '-');
  return `${dirpath}-${name}${ext}`;
};
