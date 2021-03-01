const u = require("awadau");

let SyncStorage = require("./index");
let redisStore = {};

let source = [
  { pid: 2, price: 32, quantity: 40, create_at: new Date(), update_at: null, delete_at: new Date() },
  { pid: 3, price: 34, quantity: 42, create_at: new Date(), update_at: u.dateAdd({ day: 1 }), delete_at: null },
  {
    pid: 4,
    price: 38,
    quantity: 44,
    create_at: new Date(),
    update_at: u.dateLong(u.dateAdd({ day: 1 })),
    delete_at: null,
  },
  { pid: 5, price: 33, quantity: 45, create_at: new Date(), update_at: null, delete_at: null },
  { pid: 6, price: 49, quantity: 46, create_at: new Date(), update_at: null, delete_at: null },
];

let sync = new SyncStorage(
  async (key, val) => {
    // console.log("set", key, val);
    redisStore[key] = val;
  },
  async (...key) => {
    // console.log("get", key);
    return u.mapValues(u.mapGet(redisStore, ...key));
  },
  { primaryKey: "pid" }
);

sync
  .sync(source)
  .then((data) => {
    // console.log({ redisStore_init: redisStore });
    // console.log("sync data", data);
    if (!u.equal(u.mapKeys(data.create), ["2", "3", "4", "5", "6"]))
      return Promise.reject("first init failed, not initialize properlly");
  })
  .then(() =>
    sync.sync([
      {
        pid: 2,
        price: 1000,
        quantity: "should not be updated because delete_at activated",
        update_at: u.dateAdd({ month: 1 }),
        delete_at: new Date(),
      },
      { pid: 5, price: 33, quantity: 45, create_at: new Date(), update_at: null, delete_at: new Date() },
    ])
  )
  .then((data) => {
    // console.log({ redisStore });
    // console.log("sync data", data);
    if (!(u.len(data.create) == 0 && u.len(data.update) == 0 && u.len(data.remove) == 1))
      return Promise.reject("sync to existing storage failed");
  })
  .then(() => console.log("all test passed"));

let p = {
  create: {
    2: { p: 40, create_at: new Date(), update_at: null, deleteAt: new Date() },
    3: { p: 42, create_at: new Date(), update_at: null, deleteAt: null },
  },
  update: {},
  remove: {},
};
