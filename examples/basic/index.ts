import * as express from 'express';
import * as Redis from 'ioredis';
import { PercentageOfRequestsCheck } from '../../src/checks/PercentageOfRequestsCheck';
import { QueryStringCheck } from './../../src/checks/QueryStringCheck';
import { UserAgentCheck } from './../../src/checks/UserAgentCheck';
import { FeatureBouncer } from './../../src/FeatureBouncer';

const app = express();
const redis = new Redis();

const features = new FeatureBouncer({
  store: redis,
  getContext: (req: express.Request) => {
    return {
      key: 1,
      request: req,
      values: {
        isOk: false,
      }
    };
  },
  options: {
    debug: true,
  },
  features: {
    demo: {
      checks: {
        'traffic': PercentageOfRequestsCheck(50),
        'user-agent': UserAgentCheck('IE'),
      },
      overrides: {
        'querycheck': QueryStringCheck('foo', 'pass'),
      },
    },
    demo2: {
      checks: {
        'dummy': PercentageOfRequestsCheck(50),
      }
    },
  }
});

app.use(features.middleware);

app.get('/', async (_: any, res: any) => {
  const check = await features.get('demo');
  const debug = `
    <pre>${JSON.stringify(features.debug(), null, 2)}</pre>
  `;

  res.send(check
    ? `<div>Yes <br> ${debug}</div>`
    : `<div>No <br> ${debug}</div>`
  );
});

app.listen(3000, () => console.log('listening to port 3000'));
