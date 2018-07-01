# FeatureBouncer  [![Build Status](https://api.travis-ci.com/ClaudiuCeia/feature-toggles.svg?branch=master)](https://travis-ci.org/ClaudiuCeia/feature-toggles)

_A simple feature toggle library with persistance in Redis, built for Express. You can use it for feature gating, AB testing, etc._ 

`NOTE: This is a very early development version, use at your own risk. Contributions welcome.`

## Why

I was looking for a feature gating solution for one of my projects and couldn't find anything that really satisfies my needs. 

- [ ] TypeScript types
- [ ] Ability to add my own, computed checks, dependent on context (such as user data)
- [ ] Active repository (many options out there seem abandoned)
- [ ] Optimized for Express

That being said, this is also an excuse for me to learn more about building Node packages. If you want a mature solution, these two stood out for me while researching:

- **[Unleash](https://github.com/unleash/unleash)** - A mature, enterprise ready, feature toggles service. Comes with a great UI and all the features you could hope for.
- **[React Feature Toggles](https://github.com/paralleldrive/react-feature-toggles)** - A great client-side solution, built for React. 

## Usage

**AB testing**

```ts
import * as express from 'express';
import * as Redis from 'redis';
import { FeatureBouncer, PercentageOfRequestsCheck } from 'feature-bouncer';

const app = express();
const redis = new Redis();

// Initialize FeatureBouncer
const bouncer = new FeatureBouncer({
  store: redis,
  features: {
    example: {
      // 50-50 AB testing
      checks: {
        'fiftyPercent': PercentageOfRequestsCheck(50),
      },
      // Manual override by passing in a `?abtest=show` query string
      overrides: {
        'cheatCode': QueryStringCheck('abtest', 'show'),
      }
    },
  }
});

// Apply middleware
app.use(bouncer.middleware);

app.get('/', async (_: any, res: any) => {
  const check = await bouncer.get('example');
  res.send(check ? "You passed!" : "You didn't pass :(");
});

app.listen(3000, () => console.log('listening to port 3000'));
```

## API

```ts
FeatureBouncer.constructor(params: {
  store: any,
  features: IMap<FeatureToggle>,
  getContext?: ((request: express.Request) => IFeaturesContext) | undefined,
  options?: IFeatureBouncerOptions
})
```

 - **store** (object) _not implemented_  Allows persisting the data in Redis. You should be able to pass in your own client instance or configure the FeatureBouncer client.  
 - **features** (object) A Map of features you want to check. Each feature is composed of two sets of checks (regular and overrides). A feature passes when either one of the overrides checks passes, or the regular checks pass.
 - **getContext** (function) Often times, gating features doesn't make sense without additional context (excluding the HTTP request). You can implement `getContext` such that you make extra data available to the checkers (user id, country, etc.) 
 - **options** (object) allows setting additional options, at the moment only the `debug` key is available (see `debug()` function).


```ts
FeatureBouncer.middleware(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
)
```

Pass to `app.use()` or to `app.get()` in order to initialize the context data, needed by the feature checkers.
Usage:

```ts
app.use(bouncer.middleware);
// or
app.get('/yourRoute', bouncer.middleware, () => {})
```



```ts
async FeatureBouncer.getX(name: string): Promise<boolean>
async FeatureBouncer.get(name: string): Promise<boolean>
```

 - **name** (string) The name of the feature you want to check (for the AB test example above, that would be `example`). Returns a Promise containing the result of the check. `getX()` can throw, `get()` will just return `false` if there's an error.

 This part needs quite a bit of rework. Not happy with this as it is, and for the `getX()` version, which is the desirable option IMO, you need to remember to call `.catch()` on the Promise, otherwise it might hang. 



 ``` ts
 FeatureBouncer.debug()
 ```

If you passed `{ debug: true }` for options in the constructor, this will return an object showing you the results for each individual checks. Checks bail early, so if it hits `false` before finishing all of the checks, you won't see them all in here.



## Implementing new checks

This library will contain a few general-purpose checks (like the percentage and query string ones implemented now) - but the idea is that you should build your own.

The type for the check functions is:

```
type Check = ((
  idx: string, 
  context: IFeaturesContext
) => Promise<[string, boolean]>);
```

The string in the return tuple should almost always be the `idx` that you receive as a parameter. This is used for debugging (see `debug()` method above). 

## Roadmap
- [ ] Implement Redis storage
- [ ] Refine `get()/getX()` functions
- [ ] CLI utility to easily check if a certain context passes a test
- [ ] Support different persistance layers / Remove Redis dependency
- [x] Add tests

## License
MIT © [Claudiu Ceia](https://github.com/ClaudiuCeia)
