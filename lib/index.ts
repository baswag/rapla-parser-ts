export { RaplaEvent, TimeInterval } from './raplaEvent';
export { RaplaHttpClient } from './raplaHttpClient';
export { RaplaParser } from './raplaParser';

import { RaplaHttpClient } from './raplaHttpClient';
async function t() {
  const client = new RaplaHttpClient(
    'http://193.196.6.13/rapla?page=calendar&user=Kibler&file=AlleKurse'
  );
  await client.getAll();
}

t();
