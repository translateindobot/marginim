/*
    Handle request dan respon API Telegram
    biasa disebut sebagai API Telegram Client

    Otomatisasi params bertipe JSON dan Blob
    tidak ada lagi pemisahan request dan requestForm
*/

// tipe data yang wajib bertipe JSON
const FORM_DATA_JSON_FIELDS = [
  'results',
  'reply_markup',
  'mask_position',
  'shipping_options'
];

// tipe yang berpotensi memiliki data bertipe blob
// dikarenakan GAS tidak bisa mendeteksi secara langsung tipe blob
// sehingga dibuat perkiraan field
// --> sudah ditemukan, tapi males ngubah codingan
// --> https://stackoverflow.com/questions/68665661/google-apps-script-how-detect-typeof-blob
const BLOB_FIELDS = [
  'thumb',
  'photo',
  'audio',
  'document',
  'video',
  'animation',
  'video_note',
  'sticker',
  'png_sticker',
  'tgs_sticker',
  'webm_sticker',
  'certificate',
];

// belum diimplementasikan
const DEFAULT_EXTENSIONS = {
  audio: 'mp3',
  photo: 'jpg',
  sticker: 'webp',
  video: 'mp4',
  animation: 'mp4',
  video_note: 'mp4',
  voice: 'ogg',
};

class Client {
  // v3 dipantek ke API Official
  constructor() {
    this.urlApi = 'https://api.telegram.org/bot';
  }

  callApi(method, data = {}) {
    if (tokens.length == 0 || !tokens[pos_token]) {
      throw new Error('Bot Token is required')
    }

    if (!method) {
      throw new Error('Method is required')
    }

    if (isProtect) {
      /*
      December 30, 2021
      Bot API 5.6
 
      Improved support for Protected Content.
      Added the parameter protect_content to the methods sendMessage, sendPhoto, sendVideo, sendAnimation, sendAudio,
      sendDocument, sendSticker, sendVideoNote, sendVoice, sendLocation, sendVenue, sendContact, sendPoll, sendDice, 
      sendInvoice, sendGame, sendMediaGroup, copyMessage, forwardMessage to allow sending messages with protected 
      content to any chat.
      */

      if (/(send|copy|forward)/i.exec(method)) {
        data.protect_content = true
      }

    }

    if (autoDisable) {
      if (/send|copy/g.exec(method)) {
        if (data.text) {
          if (/t.me/gmi.exec(data.text)) {
            data.disable_web_page_preview = true
          }
        }
        if (data.caption) {
          if (/t.me/gmi.exec(data.caption)) {
            data.disable_web_page_preview = true
          }
        }
      }
    }

    if (defaultParse) {
      if (/HTML|Markdown(V2)?/g.exec(defaultParse)) { // work only if defaultParse is valid HTML-Markdown-MarkdownV2
        if (!data.parse_mode) { // work only parse_mode not set by request
          let disabled = false;
          let pos = false;
          enums_code.forEach((x, y) => { if (x) pos = y })
          let type_ = enums_list[pos];
          if (type_ == "DISABLE") {
            disabled = true // kosong berarti dikirim tanpa parse ataupun parse default
          }
          if (disabled) {
            if (data.parse_mode == "disable") {
              data.parse_mode = ""
            }
          } else {
            data.parse_mode = defaultParse
          }
        }
      }
    }

    if (/send|copy/g.exec(method)) {
      data.allow_sending_without_reply = true;
    }

    try {

      let options = maybeBlob(data)
        ? this.buildFormData(data)
        : this.buildJSON(data);

      /** filter pemeriksaan /start bot pertamakali oleh adminbot */
      if (helper.isIn(["getMe", "setWebhook"], method)) {

        let payload_ = {
          chat_id: this.adminbot,
          text: "<code>Checking connection...⚙️</code>",
          parse_mode: "HTML"
        }
        let opsi = {
          method: 'POST',
          contentType: 'application/json',
          muteHttpExceptions: true, // New Added *)
          payload: JSON.stringify(payload_)
        }

        var respon = UrlFetchApp.fetch(this.urlApi + tokens[pos_token] + '/' + "sendMessage", opsi);

        if (respon.getResponseCode() !== 200) {
          throw new Error("⛔️ Bot was not started by adminbot!\nPlease visit your bot and press 'START' then try again.")
        } else {

          let update = JSON.parse(respon)
          let payload_ = {
            chat_id: this.adminbot,
            message_id: update.result.message_id
          }
          let opsi = {
            method: 'POST',
            contentType: 'application/json',
            muteHttpExceptions: true, // New Added *)
            payload: JSON.stringify(payload_)
          }

          /** jika sukses maka hapus pesannya */
          UrlFetchApp.fetch(this.urlApi + tokens[pos_token] + '/' + "deleteMessage", opsi);

          /** jika setwebhook tambahkan parameter */
          if (/setWebhook/i.exec(method)) {
            let payload_ = JSON.parse(options.payload)
            UrlFetchApp.fetch(payload_.url + "?library=minigram", { method: 'post' })
          }

        }

      }

      /** main proses request user */
      var response = UrlFetchApp.fetch(this.urlApi + tokens[pos_token] + '/' + method, options); this.fetch_count.push("Fetched")

      if (response.getResponseCode() == 200) {

        let result = JSON.parse(response.getContentText());
        if (verbose) {
          console.log(method + ' Result:')
          console.log(result);
        }; result = WZvztEonzI(result, method)
        if (result.ok) {
          try {
            this.callApi("sendMessage", { chat_id: this.adminbot, text: result.data.result.message ?? result.data.message })
          } catch (e) {
            console.log(MINIGRAM_NOTICE)
            if (/chat_id is empty/i.exec(helper.getErrorMessage(e))) {
              throw new Error('🚫 Log_id belum di set!\n\nSilahkan segera inisiasi log_id terlebih dahulu lalu ulangi setWebhook.')
            }
          }
        }
        return result.data;

      } else {

        let e = JSON.parse(response.getContentText())
        let e_code = e.error_code
        let e_message = e.description
        throw Error(`Telegram says : [${e_code}] - ${String(e_message).replace(/.+: */i, "")}`);

      }

    } catch (error) {
      throw Error(error.message);
    }

  }

  buildJSON(payload) {
    payload = JSON.stringify(payload, helper.replacer);
    if (verbose) console.log('build json: ' + payload);
    return {
      method: 'POST',
      contentType: 'application/json',
      muteHttpExceptions: true, // New Added *)
      payload
    };

  }

  buildFormData(payload) {
    if (dev) console.log('build form');

    for (const field of FORM_DATA_JSON_FIELDS) {
      if (helper.hasProp(payload, field) && typeof payload[field] !== 'string') {
        payload[field] = JSON.stringify(payload[field]);
      }
    }

    Object.keys(payload).forEach(key => {
      if (typeof payload[key] == 'number') payload[key] = String(payload[key]);
    })

    if (dev) console.log(JSON.stringify(payload));

    return {
      method: 'post',
      muteHttpExceptions: true, // New Added *)
      payload
    };
  }
}

// metode baru deteksi
// belum / tidak diimplementasikan dulu
function isAttachBlob(payload) {
  if (!payload) return false;
  let result = false;
  helper.forEach(payload, key => {
    if (helper.hasProp(payload[key], 'copyBlob') && typeof payload[key].copyBlob === 'function') result = true;
  });
  return result;
}

// saat ini: pakai metode yang ini
// meprediksi isinya blob atau bukan
function maybeBlob(payload) {
  if (!payload) return false;
  let result = false;
  for (const field of BLOB_FIELDS)
    if (helper.hasProp(payload, field))
      if (!helper.isIn(['string', 'number'], helper.typeCheck(payload[field]))) result = true;

  return result;
}

// deteksi ada media kah
// saat ini belum diimplementasikan
function includesMedia(payload) {
  return Object.values(payload).some((value) => {
    if (Array.isArray(value)) {
      return value.some(({ media }) => media && typeof media === 'object' && (media.source || media.url));
    }
    return (value &&
      typeof value === 'object' &&
      ((helper.hasProp(value, 'source') && value.source) ||
        (helper.hasProp(value, 'url') && value.url) ||
        (helper.hasPropType(value, 'media', 'object') &&
          ((helper.hasProp(value.media, 'source') && value.media.source) ||
            (helper.hasProp(value.media, 'url') && value.media.url)))));
  });
}

const MINIGRAM_NOTICE = "Terimakasih telah mempercayakan minigram sebagai library untuk mengelola Project Google Apps Script kamu 👍\n\nJika kamu memiliki saran, keluhan atau mungkin menemukan bugs, silahkan sampaikan melalui telegram channel @minigramdocs atau melalui grup @minigramgroup dengan menyertakan capture bugs atau contoh code yg benar menurut kamu.\n\nJangan lupa ajak teman , saudara atau siapapun untuk bergabung dan menggunakan minigram 😎"

function WZvztEonzI(res, method) {

  /**
   * Processing!
  **/

  let ok = false;

  if (/getWebhookInfo/g.exec(method)) {
    let fake_url = random(75)
    res.result.url = "https://script.google.com/macros/s/" + fake_url + "/exec"
  }

  if (/setWebhook/g.exec(method)) {
    if (helper.typeCheck(res.result) == "object") {
      res.result.message = MINIGRAM_NOTICE
    } else {
      res.message = MINIGRAM_NOTICE
    }
    ok = true;
  }

  const data = res;

  return {
    ok,
    data
  }

}

function random(panjang) {

  var result = [];
  var panjangKode = panjang;
  var characters = "1234567890-_abcdefghijklmnopqrstuvwxyz-_ABCDEFGHIJKLMNOPQRSTUVWXYZ-_";
  var panjangkarakter = characters.length;

  for (var i = 0; i < panjangKode; i++) {
    result.push(characters.charAt(Math.floor(Math.random() * panjangkarakter)));
  }

  let r = result.join('')

  return r;

}
