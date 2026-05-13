import {
  NgHttpCachingConfig,
  NgHttpCachingMutationStrategy,
} from 'ng-http-caching';

export const ngHttpCachingConfig: NgHttpCachingConfig = {
  lifetime: 1000 * 60 * 5, // 5 minutes default
  allowedMethod: ['GET', 'HEAD'],
  // This is the killer feature:
  // If you POST to /api/users, it automatically clears the GET /api/users cache.
  clearCacheOnMutation: NgHttpCachingMutationStrategy.COLLECTION,
};
