const u = require("awadau");

module.exports = class {
  /**
   *
   * @param {(...param)=>Promise} redisSet
   * @param {(...param)=>Promise} redisMGet
   * @param {{createAt:"create_at",updateAt:"update_at", deleteAt:"delete_at", primaryKey:"id"}} keyFieldConfig
   */
  constructor(redisSet = async () => {}, redisMGet = async () => {}, keyFieldConfig = {}) {
    this.redisSet = redisSet;
    this.redisMGet = redisMGet;
    let keyDefault = { createAt: "create_at", updateAt: "update_at", deleteAt: "delete_at", primaryKey: "id" };
    this.keyField = u.mapMerge(keyDefault, keyFieldConfig);
  }

  async sync(input = [{}]) {
    let create = {};
    let update = {};
    let remove = {};

    let { createAt, updateAt, deleteAt, primaryKey } = this.keyField;

    let inputMap = u.arrayOfMapToMap(input, primaryKey);
    let inputKeys = u.mapKeys(inputMap);
    let redisResult = u.arrayToMap(inputKeys, await this.redisMGet(...inputKeys));
    for (let i of inputKeys) {
      // deleted
      if (redisResult[i] == -1) continue;

      //create
      if (!redisResult[i]) {
        let result = inputMap[i][deleteAt] ? -1 : inputMap[i][updateAt] ? inputMap[i][updateAt] : inputMap[i][createAt];
        await this.redisSet(i, result);
        create[i] = inputMap[i];
        continue;
      }

      // to delete
      if (inputMap[i][deleteAt]) {
        await this.redisSet(i, -1);
        remove[i] = inputMap[i];
        continue;
      }

      //update
      if (inputMap[i][updateAt]) {
        if (new Date(inputMap[i][updateAt]) > new Date(redisResult[i])) {
          await this.redisSet(i, inputMap[i][update]);
          update[i] = inputMap[i];
        }
      }
    }

    return {
      create,
      update,
      remove,
    };
  }
};
