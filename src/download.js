import getDebugger from './lib/debug';
import axios from './lib/axios';

const debug = getDebugger('download');

export default (uri, type = 'text') => {
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

