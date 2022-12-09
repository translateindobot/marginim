// daftar field yang tidak dibroadcast
FIELD_NOT_BC = [
  'update_id',
  'message_id',
  'from',
  'chat',
  'date'
];

function escapeRegExp(s) {
  // $& means the whole matched string
  return s.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&')
}

class Composer extends EventEmitter {
  constructor() {
    super();
    this.handler = [(ctx, next) => { next() }];
    this.trigger = [];
  }

  /**
   * Registers a middleware.
   */
  use(...fns) {
    this.compose(...fns);
  }

  // alias for use
  middleware(...fns) {
    this.compose(...fns);
  }

  // -- konsep event trigger

  // command( ['anu', 'ani'], (ctx, next) => {})
  cmd(keys, callback, isEdit = false) {
    return this.addTrigger('text', this.setRegex(keys, true), callback, "command", isEdit, "[" + this.options.prefix_command + "]" + keys);
  }

  // alias cmd
  command(...args) {
    this.cmd(...args);
  }

  start(callback) {
    let username = this.options.username;
    let regex = new RegExp(`^(?<cmd>[${escapeRegExp(this.options.prefix_command)}]start(?:@${username})?)\\s?(?<payload>.+)?`, 'i');
    return this.addTrigger('text', regex, callback, "start", false);
  }

  hear(keys, callback, isEdit = false) {
    return this.addTrigger('text', this.setRegex(keys), callback, "hears", isEdit, keys);
  }

  // alias hear
  hears(...args) {
    this.hear(...args)
  }

  // handle callback
  action(keys, callback) {
    return this.addTrigger('action', this.setRegex(keys), callback, "action", false, keys);
  }

  // handle tambahan trigger: cmd, hear, action
  addTrigger(type, keys, callback, method, edited, original_key) {
    keys = this.setRegex(keys);
    let data = {
      type, keys,
      callback, method, edited, original_key
    }
    return this.trigger.push(data);
  }

  // eksekusi seluruh trigger
  execTrigger(index = 0) {
    let trigger = this.trigger;
    if (!trigger[index]) return;

    let msg;
    let edit = false;
    let update = this.ctx;
    let { type, keys, callback } = trigger[index];

    if (update.editedMessage || update.editedChannelPost) {
      if (trigger[index].edited === false) return this.execTrigger(index + 1);
      edit = true;
    }

    if (verbose) {
      // Mengambil seluruh triggers
      // Hanya akan aktif saat verbose di set true
      // dengan syarat harus menggunakan bot.hears dan diletakkan di paling akhir
      Logger.log('>> Trigger[' + index + '][' + trigger[index].method + ']: ' + trigger[index].keys.join(', '));
      // Logger.log(trigger[index].callback)
    }

    if (type == 'text') {
      // Logger.log("This is edit? " + edit)
      if (edit) {
        msg = update.editedMessage ?? update.editedChannelPost
      } else {
        msg = update.message ?? update.channelPost;
      }
    }

    if (type == 'action') {
      msg = update.callbackQuery;
    }

    let text = this.getText(msg);
    if (!text) return this.execTrigger(index + 1);

    let match, payload;
    keys.forEach(key => {
      // if (verbose) console.log(key + ' vs ' + text);
      let m = key.exec(text);
      if (m) {
        match = m;
        if (m.groups?.payload) payload = m.groups.payload;
      }
    });

    if (match) {
      update.match = match;
      if (payload) update.payload = payload;
      return callback(update, () => this.execTrigger(index + 1));
    }

    return this.execTrigger(index + 1);
  }

  // --- pembuatan middleware (dipisah, biar ga rumit ^^)
  compose(...fns) {
    if (!fns) return;
    fns.forEach(fn => {
      if (typeof fn === 'function') this.handler.push(fn);
    });
  }

  // -- eksekusi middleware
  execute(update, index = 1) {
    let handler = this.handler || [];
    if (handler.length === 0) {
      this.ctx = update;
      return this.broadcast();
    }
    return () => {
      if (!handler[index]) {
        this.ctx = update;
        return this.broadcast();
      }
      return this.handler[index](update, this.execute(update, index + 1));
    }
  }

  // --- fungsi-fungsi

  setRegex(keys, prefix = false) {
    if (!Array.isArray(keys)) keys = [keys];
    let username = this.options.username;

    return keys.map((key) => {
      if (!key) {
        throw new Error('Invalid trigger');
      }
      if (typeof key === 'function') {
        throw new Error('Invalid trigger');
      }

      // if (key instanceof RegExp) return key;
      let type = helper.typeCheck(key);
      if (type == 'regexp') return key;

      if (type == 'string' || type == 'number') {
        //
      } else {
        throw Error('Invalid key.');
      }

      let regex = prefix
        ? new RegExp(`^[${escapeRegExp(this.options.prefix_command)}]${escapeRegExp(key)}(?:@${username})?$`, 'i')
        : new RegExp(`^${escapeRegExp(key)}$`);
      return regex;
    });
  }

  getText(msg) {
    /* if (!update) return undefined;
    let msg = update.message ?? update.channelPost ?? update.callback_query */
    if (!msg) return undefined;
    if ('caption' in msg) return msg.caption;
    if ('text' in msg) return msg.text;
    if ('data' in msg) return msg.data;
    if ('game_short_name' in msg) return msg.game_short_name;
    return undefined;
  }

  // membroadcast event on
  broadcast() {
    let bc = {};
    let ctx = this.ctx;
    let update = ctx.update;
    Object.keys(update).forEach(updateType => bc[updateType] = 1);
    if (update.message) {
      let msg = update.message;
      Object.keys(update.message).forEach(updateSubType => bc[updateSubType] = 1);
      let entities = msg.entities ?? msg.caption_entities;
      if (entities) {
        Object.values(entities).forEach(entity => bc[entity.type] = 1)
      }
    }

    let broadcasters = [];
    for (let key in bc) {
      if (FIELD_NOT_BC.indexOf(key) >= 0) continue;
      broadcasters.push(key);
    }
    ctx.broadcast = broadcasters;
    if (broadcasters.length > 0) this.emit(broadcasters, ctx);
    if (verbose) console.log('broadcast: ' + broadcasters.join(', '));
  }

}
