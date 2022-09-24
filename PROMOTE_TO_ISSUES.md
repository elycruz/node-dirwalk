### Todos to promote:

- [ ] Consider exposing `DirectoryWalker` constructor(s).
- [ ] Controls should be 'stat method' agnostic, we should accept a 'stat getter' which would allow user to react to file and return the stat type they're looking for - Allows for more flexibility.

### Legacy Todos

- [x] - ~~Rename functions appropriately (they are recursive and should be named in a way that indicates so).~~
- [x] - ~~Expose other useful parts from internals (readDirectory, readLStat etc.)~~
- [x] - ~~Create iterable types for use with `yield` and or `for..of` comprehensions.~~
