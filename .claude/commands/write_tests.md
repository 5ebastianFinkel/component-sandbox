Write comprehensive tests for: $ARGUMENTS

Testing conventions:
* Use Vitests with @testing-library/vue
* Do not use vue test utils, if possible
* Place test files in a __tests__ directory in the same folder as the source file
* For compound components create a separate fixture
* Name test files as [filename].test.ts
* Use @/ prefix for imports

Coverage:
* Test happy paths
* Test edge cases
* Test error states

API Testing:
* Use msw (mock service worker) for RestAPI calls
* Use vitest mocking for all other mocks