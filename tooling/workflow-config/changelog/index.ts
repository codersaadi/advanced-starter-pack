import { consola } from 'consola';

import { buildStaticChangelog } from './build-static-changelog';

const run = () => {
  consola.start('Building static changelog...');
  buildStaticChangelog.run();
};

run();
