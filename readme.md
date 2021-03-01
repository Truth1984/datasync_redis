## datasync_redis

One way data sync

#### notice

1. Output result should be READ-ONLY for other tables, because the redis storage does not check & sync with output source.

2. Input source should contain `create` / `update` / `delete` date field, and must have a primary key field

#### example

```js
const DataSync = require("datasync_redis");

// mimic sql select result
let sqlDataSource = [
  { pid: 2, p: 40, create_at: new Date(), update_at: null, deleteAt: new Date() },
  { pid: 3, p: 42, create_at: new Date(), update_at: null, deleteAt: null },
];

// config redisClient with keyPrefix and other settings
let redisClient;

let dsync = new DataSync(redisClient.set, redisClient.mget, { primaryKey: "pid", deleteAt: "deleteAt" });

dsync.sync(sqlDataSource);
/**
 * {
  create: {
    2: { p: 40, create_at: new Date(), update_at: null, deleteAt: new Date() },
    3: { p: 42, create_at: new Date(), update_at: null, deleteAt: null },
  },
  update: {},
  remove: {},
}
 */

dsync.sync([
  { pid: 2, p: 50, create_at: new Date(), update_at: new Date(), deleteAt: new Date() },
  { pid: 3, p: 42, create_at: new Date(), update_at: null, deleteAt: new Date() },
]);
/**
 * {
  create: {},
  update: {},
  remove: { 3: { p: 42, create_at: new Date(), update_at: null, deleteAt: new Date() } },
}
 */
```
