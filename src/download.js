import getDebugger from './lib/debug';
import axios from './lib/axios';

const debug = getDebugger('download');

const download = (uri, type = 'text') => {
  switch (type) {
    case 'bin':
      debug(`invoked downloading binary from: ${uri}`);
      return axios({
        method: 'get',
        url: uri,
        responseType: 'stream',
      });
    default:
      debug(`invoked downloading text from: ${uri}`);
      return axios.get(uri);
  }
};

export default (uri, type = 'text') => download(uri, type)
  .catch((e) => {
    switch (e.code) {
      case 'ENOTFOUND':
        debug(`ERROR: ENOTFOUND ${uri}`);
        throw new Error(`DNS error: seems like address '${uri}' does not exist`);
      default:
        debug(`ERROR: ${e}`);
        throw new Error(e);
    }
  });

