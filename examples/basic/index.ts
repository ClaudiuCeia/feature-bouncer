import * as express from 'express';
import * as Redis from 'ioredis';
import { PercentageOfRequestsCheck, QueryStringCheck } from './../../src/Checks';
import { FeatureToggles } from './../../src/FeatureToggles';

const app = express();
const redis = new Redis();

const features = new FeatureToggles({
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
  features: {
    demo: {
      checks: {
        'traffic': PercentageOfRequestsCheck(50),
      },
      overrides: {
        'querycheck': QueryStringCheck('foo', 'pass'),
      }
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
  console.log(features.debug());

  res.send(check ? 'yay' : 'nay');
});

app.listen(3000, () => console.log('listening to port 3000'));
