import 'reflect-metadata';
import 'zone.js';
import 'source-map-support/register';

import { suite } from 'razmin';
import '../src/index';

suite()
    .withOptions({execution: {timeout: 15000}})
    .include(['**/*.test.js'])
    .run()
;