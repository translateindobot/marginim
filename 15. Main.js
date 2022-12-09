/*
  kelas utama library GAS
  penjelasan detail cek docs lumpia.js.org
*/

let errorLog = []
let pos_token = undefined // posisi token dari array tokens untuk diambil.
let tokens = [] // storing data token dari init

class Main extends Composer {
  constructor(key, options = {}) {
    super();
    /**
     * Storing token to temp variabel!
     **/
    tokens.push(key)
    this.ctx = false;
    this.enum = false;
    this.options = {
      prefix_command: '/',
      username: '',
      ...options
    }
    this.select_token = this.options.active ?? 0
    this.fetch_counter = []
    this.client = new Telegram(undefined, this.fetch_counter, this.options.log_id);
  }

  get enums() {
    const enumeration = new Enums();
    return enumeration;
  }

  get token() {
    throw ReferenceError("token is not defined")
  }

  get tg() {
    pos_token = this.select_token
    return this.client;
  }

  get telegram() {
    pos_token = this.select_token
    return this.client;
  }

  set log_id(id) {
    this.options.log_id = id;
  }

  set log_error(id) {
    this.options.log_error = id;
  }

  set log_admin(ids) {
    this.options.log_admin = ids;
  }

  handleUpdate(update) {

    // handle update tidak dibuatkan handle error
    // jika ingin direct handleUpdate, gunakan try catch sendiri
    if (verbose) console.log('Update: ' + update);

    pos_token = this.select_token

    const ctx = new Context(update, this.telegram, this.select_token, this.options.log_id);

    // PERIKSA AGAR USER MEMASUKKAN -- LOG ID
    if (!this.options.log_id) {
      try {
        let notify_logid = '❌ <i>Log id or adminbot not set!\nPlease set first on initiate ...</i>'
        return this.client.sendMessage(ctx.update.message.chat.id, notify_logid, { parse_mode: 'HTML' })
      } catch (e) {
        return console.log('❌ Log id or adminbot not set!\nPlease set first on initiate ...')
      }
    }

    // PERIKSA AGAR USER MEMASUKKAN -- LOG ERROR (CHANNEL)
    if (!this.options.log_error) {
      let notify = '❌ <i>Channel for handling error not set!\nPlease set first on initiate ...</i>'
      if (this.options.log_id) {
        return this.client.sendMessage(this.options.log_id, notify, { parse_mode: 'HTML' })
      } else {
        return console.log('❌ Channel for handling error not set!\nPlease set first on initiate ...')
      }
    }

    //---- CUSTOM ERROR LOG

    let updType = ctx.updateType
    let msg = update[updType]

    let isChannel = msg.sender_chat ? true : false
    let isUser = msg.from ? true : false

    if (isChannel) {
      var fromId = msg.sender_chat.id
      var fromUsername = msg.sender_chat.username || false
      if (fromUsername) {
        var mentionName = `├ Title : ${msg.sender_chat.title}\n├ Username : @${fromUsername}\n`
      } else {
        var mentionName = `├ Nama : ${helper.name(msg.sender_chat).mention}\n`
      }
    } else if (isUser) {
      var fromId = msg.from.id
      var fromUsername = msg.from.username || false
      if (fromUsername) {
        var mentionName = `├ Nama : ${helper.name(msg.from).fullname_html}\n├ Username : @${fromUsername}\n`
      } else {
        var mentionName = `├ Nama : ${helper.name(msg.from).mention}\n`
      }

    } else {
      var fromId = '<code>--</code>'
      var mentionName = '<code>--</code>'
    }

    /**
     * Set this first!
     * 
     * telegramlib.isPrivate = true
     * bot.options.log_admin = [ADMIN_BOT]
    */

    if (isPrivate) {
      // console.log("🚫 Private mode is Enabled!")
      if (helper.typeCheck(this.options.log_admin) == "array") {
        // console.log("Admin list : " + this.options.log_admin)
        if (this.options.log_admin.indexOf(fromId) < 0) {
          console.log("⚠️ Public is trying to reach update process!")
          return;
        }
      } else {
        throw new Error("⛔️ isPrivate turning on but log_admin is not an Array!")
        // console.log("✳️ Processing update ...")
      }
    } else {
      // console.log("✅ Private mode is Disabled!")
    }

    let command = msg.text ? "<b>[Text]</b>\n<i>" + msg.text + "</i>"
      : msg.caption ? "<b>[Caption]</b>\n<i>" + msg.caption + "</i>"
        : msg.data ? "<b>[Callback_data]</b>\n<i>" + msg.data + "</i>"
          : false;
    ;

    if (!command) {

      let obj_key = ctx.update.message ?? ctx.update
      let hasObj = Object.keys(obj_key).filter((k) => typeof obj_key[k] === 'object')
      // console.log(hasObj[0])

      if (hasObj.length > 1) {
        var hasObjKey = hasObj[hasObj.length - 1]
      } else {
        var hasObjKey = hasObj[0]
      }

      command = msg.sticker ? '<b>[Sticker]</b>'
        : msg.video_note ? '<b>[Video Note]</b>'
          : msg.dice ? '<b>[Dice]</b>'
            : msg.poll ? '<b>[Poll]</b>'
              : '<b>[JSON : ' + hasObjKey + ']</b>\n<i>' + helper.outToJSON(msg) + '</i>';
      ;

    }

    if (command.length > 3500) {
      command = command.substring(0, 3500) + '<i>...</i>'
    }

    let tgl = msg.date ? msg.date : false

    if (!tgl) {
      tgl = Utilities.formatDate(new Date(), 'GMT+7', 'dd-MMM-yyyy HH:mm:ss')
    } else {
      tgl = Utilities.formatDate(new Date(tgl * 1000), 'GMT+7', 'dd-MMM-yyyy HH:mm:ss')
    }

    let hasil = `🔖 <u><b>REQUESTER INFORMATION</b></u>\n${mentionName}├ ID : <code>${fromId}</code>\n├ Date : <code>${tgl}</code>\n├ Update : <b>${updType.toUpperCase()}</b>\n└ Command : ${command}`

    errorLog.push(hasil)

    //---- END OF CUSTOM ERROR LOG ----

    this.handler[0](ctx, this.execute(ctx));
    this.execTrigger();

    return this.fetch_counter.length

  }

  doPost(e) {
    if (!e) return console.log("⛔️ Sorry! doPost(e) is automatic run when any update received from webhook to the webApp.");
    if (verbose) console.log('Processing update');

    pos_token = this.select_token

    if (e.parameter.library) {
      if (e.parameter.library == "minigram") {
        if (this.options.log_id) {
          try {
            return this.client.sendMessage(this.options.log_id, "🎊 Selamat! Function doPost (e) berhasil terdeteksi dan telah terpasang dengan benar!")
          } catch (e) {
            console.log("[NOTIFIKASI] - 🎊 Selamat! Function doPost (e) berhasil terdeteksi dan telah terpasang dengan benar!")
          }
        } else {
          console.log("[NOTIFIKASI] - 🎊 Selamat! Function doPost (e) berhasil terdeteksi dan telah terpasang dengan benar!")
          throw new Error("🚫 Log_id belum di set!")
        }
      }
    }

    // handle error
    try {
      var update;
      if (e.postData.type == "application/json") {
        update = JSON.parse(e.postData.contents);
        if (!update) throw Error('Update invalid data.');
        if (DEBUG) {
          if (this.options.log_id) return this.client.sendMessage(this.options.log_id, helper.json(update));
          throw new TypeError('❌ Log ID not set!\n\n' + helper.json(update))
        }
      }

      return this.handleUpdate(update);

    } catch (e) {

      let error = helper.getErrorMessage(e)

      // jika log_id dan log_error telah di set
      try {

        if (verbose) console.log('Error: ' + e.message);
        let date = Utilities.formatDate(new Date(), 'GMT+7', '📆 dd MMM yyyy | ⏱ HH:mm:ss')
        let pesanError = errorLog[0] ? errorLog[0] : `<i>${JSON.stringify(update, null, 2)}</i>`

        /** jika alert - hanya proses saat incoming message atau callbackquery */
        if (sendAlert) {

          try {
            if (helper.typeCheck(sendAlert) == "boolean") {
              sendAlert = `<code>${error}</code>`
            } else {
              sendAlert = sendAlert.replace(/{error}/gi, error)
            }
            if (update.message) {
              let chat_id = update.message.chat.id
              let message_id = update.message.message_id
              if (update.message.message_thread_id) {
                this.client.sendMessage(chat_id, sendAlert, {
                  parse_mode: 'HTML',
                  reply_to_message_id: message_id,
                  message_thread_id: update.message.message_thread_id
                });
              } else {
                this.client.sendMessage(chat_id, sendAlert, { parse_mode: 'HTML', reply_to_message_id: message_id });
              }


            }
            if (update.callback_query) {
              let chat_id = update.callback_query.message.chat.id
              let message_id = update.callback_query.message.message_id
              if (update.callback_query.message.message_thread_id) {
                this.client.sendMessage(chat_id, sendAlert, {
                  parse_mode: 'HTML',
                  reply_to_message_id: message_id,
                  message_thread_id: update.callback_query.message.message_thread_id
                });
              } else {
                this.client.sendMessage(chat_id, sendAlert, { parse_mode: 'HTML', reply_to_message_id: message_id });
              }
            }
          } catch (e) { }
          
        }

        if (errorNotification) {
          try {

            if (!this.options.username) {
              var username_bot = "<code>⚠️ Username bot not set!</code>"
            } else {
              var username_bot = `🤖 <i>@${this.options.username}</i>`
            }
            return this.client.sendMessage(this.options.log_error, `🚨 <b>ERROR UPDATE</b>\n\n${username_bot}\n\n<b>Input :</b>\n${pesanError}\n\n<b>Error :</b>\n<code>${error}</code>\n\n<code>${date}</code>`, { parse_mode: 'HTML', disable_web_page_preview: true });

          } catch (err) {

            let e_message = helper.getErrorMessage(err)

            this.client.sendMessage(this.options.log_id, `⚠️ <i>Gagal mengirim pesan error ke log error!</i>\n\n<b>REASON :</b>\n<i>${e_message}</i>`, { parse_mode: 'HTML' });
            return this.client.sendMessage(this.options.log_id, `🚨 <b>ERROR UPDATE</b>\n\n${username_bot}\n\n<b>Input :</b>\n${pesanError}\n\n<b>Error :</b>\n<code>${error}</code>\n\n<code>${date}</code>`, { parse_mode: 'HTML', disable_web_page_preview: true });

          }
        } else {
          return;
        }

      } catch (ee) {
        // error karena gak bisa kirim log ke akun telegram
        // pass ke error dibawah!
      }

      // error karena handle post
      throw Error(e);
    }

  }
}

var init = Main;

