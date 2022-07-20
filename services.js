import http from '@/utils/http';
import { CONTEXT_URL } from './constants';
const baseUrl = CONTEXT_URL;

const get = params =>
  http.get({
    url: `${baseUrl}/default`,
    params,
  });

const post = data =>
  http.post({
    url: `${baseUrl}/default`,
    data: data,
  });

export default {
  get,
  post,
};
