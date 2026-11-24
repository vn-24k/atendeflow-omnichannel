import { handleApiRequest } from './router.js';

export default async function handler(req, res) {
  return handleApiRequest(req, res);
}
