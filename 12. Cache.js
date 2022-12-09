/**
* Kelas untuk Cache Properti
* @type {Class} klass utama
*
*/
var cache = class Cache {
  /**
  *initialize constructor
  */
  constructor() {
    this.service = CacheService.getUserCache();
  }

  /**
   * put(key, value, expiration) - Adds a key/value pair to the cache.
   * 
   * @params {kunci} - the key to store the value under
   * @params {nilai} - the value to be cached
   * @params {expiration} - the maximum time the value remains in the cache, in seconds. The minimum is 1 second and the maximum is 21600 seconds (6 hours).
   */
  put(kunci, nilai, expiration) {

    if (!expiration) expiration = 60 * 15
    // contoh: setValue('token', '123:xxxx');
    return this.service.put(kunci, nilai, expiration);
  }

  /**
   * putAll(key, expiration) - Adds a set of key/value pairs to the cache, with an expiration time (in seconds).
   * 
   * @params {data} - A JavaScript Object containing string keys and values
   * @params {expiration} - the maximum time the value remains in the cache, in seconds. The minimum is 1 second and the maximum is 21600 seconds (6 hours).
   */
  putAll(data, expiration) {

    if (!expiration) expiration = 60 * 15
    // contoh {nickname: 'Bob', region: 'US', language: 'EN'};
    if (helper.typeCheck(data) !== "object") throw new Error("this data is not a JSON Object.")
    return this.service.putAll(data, expiration);
  }

  /**
   * get(key) - Gets the cached value for the given key, or null if none is found.
   * 
   * @params {kunci} - the key to look up in the cache
   */
  get(kunci) {
    // contoh: getValue('token');
    return this.service.get(kunci);
  }

  /**
   * getAll(data) - Returns a JavaScript Object containing all key/value pairs found in the cache for an array of keys.
   * 
   * @params {data} - the keys to lookup
   */
  getAll(data) {
    // contoh ["key1", "key2"]
    if (helper.typeCheck(data) !== "array") throw new Error("this data is not an array of keys.")
    return this.service.getAll(data);
  }

  /**
   * remove(key) - Removes an entry from the cache using the given key.
   * 
   * @params {kunci} - the key to remove from the cache
   */
  remove(kunci) {
    return this.service.remove(kunci);
  }

  /**
   * removeAll(keys) - Removes a set of entries from the cache.
   * 
   * @params {data} - the array of keys to remove
   */
  removeAll(data) {
    // contoh ["key1", "key2"]
    if (helper.typeCheck(data) !== "array") throw new Error("this data is not an array of keys.")
    return this.service.removeAll(data);
  }
}

