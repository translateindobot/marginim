/*
    helper untuk bantuan saat coding bot
    tidak wajib dipakai, namun akan bermanfaat
*/

class Helper {

  /**
   * 
   * ADDED FROM LIB 2
   * 
   */

  // untuk pengecekkan hak akses
  /* contoh: 
      var adminID = [1, 2, 3, 4]
      if ( tg.util.punyaAkses(adminID, msg.from.id) ) { .. }
  */
  punyaAkses(array, index) {
    if (array.indexOf(index) > -1) {
      return true;
    } else {
      return false;
    }
  }

  // allReplace('Hasanudin', {'a':4, 's': 5, 'n|u': 'o'}) //> H454oodio
  allReplace(str, obj, exact = false) {
    var hasil = str;
    for (var x in obj) {
      if (exact) {
        hasil = hasil.replace(new RegExp(x, 'g'), obj[x]);
      } else {
        hasil = hasil.replace(new RegExp(x, 'gi'), obj[x]);
      }
    }
    return hasil;
  }

  //membuat unik id (contoh : 6b984397-3acc-4a68-b02f-04217f0a8eb7)
  uuID() {
    // unik ID
    return Utilities.getUuid();
  }

  sleep(milidetik) {
    return Utilities.sleep(milidetik);
  }

  // fungsi timeConverter, untuk merubah timestamp ke waktu yang bisa dibaca manusia
  // kadang perlu di x1000 dari timestamp biasa (timestampnya telegram)
  // jika timeConverter(UNIX_timestamp) berarti timestamp biasa hasil dari .getTime() -- format plus milidetik
  // jika timeConverter(UNIX_timestamp, true) berarti akan dikali ribuan 
  timeConverter(UNIX_timestamp, ribuan = false) { //hasil : 1 Januari 1970 00:00:00

    ribuan = (typeof ribuan == 'undefined') ? false : true;

    var a = new Date(UNIX_timestamp * 1000);
    if (ribuan) {
      a = new Date(UNIX_timestamp);
    }

    //buat index bulan
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'Nopember', 'Desember'];

    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

    // ambil pecahan waktu masing-masing
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var day = days[a.getDay()];

    var times = Utilities.formatDate(a, "GMT+7", "HH:mm:ss")
    // var hour = a.getHours();
    // var min = a.getMinutes();
    // var sec = a.getSeconds();

    // gabungkan ke dalam variable time
    var time = day + ', ' + date + ' ' + month + ' ' + year + ' ' + times;
    return time;
  }

  /* RECOMEND ONLY FOR : UNIX_TIME STAMP */
  formatDate(UNIX_timestamp, format_tanggal = "dd-MMM-yyyy HH:mm:ss", time_zone = "GMT+7") {
    let cocok;
    if (!UNIX_timestamp) {
      var time = new Date()
    } else if (cocok = /(\d+)[\/\-](\d+)[\/\-](\d+)\s*([\d:]*)/i.exec(String(UNIX_timestamp))) {
      if (cocok[4]) {
        var time = new Date(`${cocok[2]}/${cocok[1]}/${cocok[3]} ${cocok[4]}`)
      } else {
        var time = new Date(`${cocok[2]}/${cocok[1]}/${cocok[3]}`)
      }
    } else if (helper.typeCheck(UNIX_timestamp) == "date") {
      var time = new Date(UNIX_timestamp)
    } else {
      var time = new Date(UNIX_timestamp * 1000)
    }

    return Utilities.formatDate(time, time_zone, format_tanggal)
  }

  // number format seperti PHP

  /*
  number_format(1234.56)   //   returns  '1,235'
  number_format(1234.56, 2, ',', ' ')  //   returns  '1 234,56'
  number_format(1234.5678, 2, '.', '')   //   returns '1234.57'
  number_format(67, 2, ',', '.')   //   returns '67,00'
  number_format(1000)   //  returns  '1,000'
  number_format(67.311, 2)   //   returns '67.31'
  number_format(1000.55, 1)  //   returns '1,000.6'
  number_format(67000, 5, ',', '.')  //   returns  '67.000,00000'
  number_format(0.9, 0) //  returns '1'
  number_format('1.20', 2)   //  returns  '1.20'
  number_format('1.20', 4)   //  returns '1.2000'
  number_format('1.2000', 3)  //  returns  '1.200'
  number_format('1 000,50', 2, '.', ' ')  //  returns '100 050.00'
  number_format(1e-8, 8, '.', '')  //  returns 14: '0.00000001'
  */

  number_format(number, decimals, decPoint, thousandsSep) {
    number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
    var n = !isFinite(+number) ? 0 : +number
    var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
    var sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
    var dec = (typeof decPoint === 'undefined') ? '.' : decPoint
    var s = ''

    var toFixedFix = function (n, prec) {
      if (('' + n).indexOf('e') === -1) {
        return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
      } else {
        var arr = ('' + n).split('e')
        var sig = ''
        if (+arr[1] + prec > 0) {
          sig = '+'
        }
        return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
      }
    }

    // @todo: for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
    if (s[0].length > 3) {
      s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
    }
    if ((s[1] || '').length < prec) {
      s[1] = s[1] || ''
      s[1] += new Array(prec - s[1].length + 1).join('0')
    }

    return s.join(dec)
  }

  // alias number_format
  formatNumber(...args) {
    return this.number_format(...args)
  }

  /** Fitur Format seperti Python */
  format(string, ...data) {

    if (helper.typeCheck(string) !== "string") throw new Error("🚫 Only string can be formated!")
    if (!data) throw new Error("🚫 There is no value as replacer!")

    // deteksi jumlah {}
    let match_format = string.match(/{}/g)
    if (!match_format) {
      throw new Error("🚫 No replacer format {} can be found on string!")
    }

    if (match_format.length > data.length) {
      throw new Error("🚫 Replacement index " + data.length + " out of range for positional args tuple")
    }

    let content_ = [string]

    data.forEach(x => {

      if (content_[0].match(/{}/g)) {

        let replaced = content_[0].replace(/{}/i, x)
        content_.pop()
        content_.push(replaced)

      } else return;

    })

    return content_[0];

  }

  outToJSON(data, spasi = 2) {
    return JSON.stringify(data, null, spasi);
  }

  // alias outToJSON
  json(...args) {
    return this.outToJSON(...args);
  }

  stringify(data) {
    return JSON.stringify(data);
  }

  parse(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return JSON.stringify(data);
    }
  }

  //=========== END OFF ADDED NEW ADOPTED FROM LIB2 ==============

  /**
   * Checks if a given object has a property with a given name.
   *
   * Example invocation:
   * let obj = { 'foo': 'bar', 'baz': () => {} }
   * hasProp(obj, 'foo') // true
   * hasProp(obj, 'baz') // true
   * hasProp(obj, 'abc') // false
   *
   * @param obj An object to test
   * @param prop The name of the property
   */

  hasProp(obj, prop) {
    return obj && prop in obj;
  }

  /**
   * Checks if a given object has a property with a given name.
   * Furthermore performs a `typeof` check on the property if it exists.
   *
   * Example invocation:
   * let obj = { 'foo': 'bar', 'baz': () => {} }
   * hasPropType(obj, 'foo', 'string') // true
   * hasPropType(obj, 'baz', 'function') // true
   * hasPropType(obj, 'abc', 'number') // false
   *
   * @param obj An object to test
   * @param prop The name of the property
   * @param type The type the property is expected to have
   */
  hasPropType(obj, prop, type) {
    // eslint-disable-next-line valid-typeof
    return this.hasProp(obj, prop) && type === typeof obj[prop];
  }

  compactOptions(options) {
    if (!options) {
      return options;
    }
    const keys = Object.keys(options);
    const compactKeys = keys.filter((key) => options[key] !== undefined);
    const compactKeys_ = compactKeys.filter((key) => options[key] !== null);
    const compactEntries = compactKeys_.map((key) => [key, options[key]]);
    return Object.fromEntries(compactEntries);
  }

  replacer(_, value) {
    if (value == null)
      return undefined;
    return value;
  }

  /*
  let a = [ 1, 2, 3];
  console.log(helper.typeCheck(a)) // result: array
  */
  typeCheck(value) {
    const return_value = Object.prototype.toString.call(value);
    // we can also use regex to do this...
    const type = return_value.substring(
      return_value.indexOf(" ") + 1,
      return_value.indexOf("]"));

    return type.toLowerCase();
  }

  /*
  let admin = [ 123, 456 ];
  if (helper.isIn(admin, msg.from.id)) {
      console.log('dia adalah admin!');
  }
  */
  isIn(array, index) {

    if (helper.typeCheck(array) !== "array") {
      if (helper.typeCheck(array) == "object") {
        array = helper.json(array)
      } else if (helper.typeCheck(array) == "string") {
        array = array.split("")
      } else {
        throw new ReferenceError(array + " is not an array 🚫")
      }
      // return undefined;
    }

    return (array.indexOf(index) > -1);
  }

  isDuplicate(array) {

    if (helper.typeCheck(array) !== "array") {
      if (helper.typeCheck(array) == "object") {
        array = helper.json(array)
      }
      throw new ReferenceError(array + " is not an array 🚫")
      // return undefined;
    }

    /**
     * New fitur deteksi data array yang kembar
     */
    return new Set(array).size !== array.length

  }

  duplicate(array) {

    if (helper.typeCheck(array) !== "array") {
      if (helper.typeCheck(array) == "object") {
        array = JSON.stringify(array)
      }
      throw new ReferenceError(array + " is not an array 🚫")
      // return undefined;
    }

    /**
     * New fitur deteksi data array yang kembar
     */
    return array.filter((item, index) => array.indexOf(item) === index);

  }

  /*
  let data = { satu: 1, dua: 2};
  helper.forEach(data, (isi, index) => console.log(index, isi));
  */
  forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (this.typeCheck(obj) !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (this.typeCheck(obj) == 'array') {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  // bantuan random Array dan Angka
  /*
  random(['aku', 'kamu', 'dia']) // hasil acakan dari aku, kamu, atau dia
  random(0,100) // hasil acakan antara angka 1 - 100
  */
  random() {
    // random(list) : item
    if (arguments.length === 1 && this.typeCheck(arguments[0]) == 'array') {
      var list = arguments[0];
      return list[Math.floor((Math.random() * list.length))];
    }

    // random(min, max) : integer
    if (arguments.length === 2 && typeof (arguments[0]) === 'number' && typeof (arguments[1]) === 'number') {
      var min = arguments[0];
      var max = arguments[1];
      if (max < min) { [min, max] = [max, min]; }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return false;
  }

  //  blob = textBlob('namaFile', 'Hasanudin H Syafaat')
  textBlob(namaFile, isiText, extention = '.txt', mime = MimeType.PLAIN_TEXT) {

    return Utilities.newBlob('')
      .setDataFromString(isiText)
      .setName(namaFile + extention)
      .setContentType(mime);

  }

  // output mode web app url yang diakses secara langsung
  // -------
  outputText(text) {
    return ContentService.createTextOutput(text);
  }

  outputJSON(data) {
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

  outputHTML(text) {
    return HtmlService.createHtmlOutput(text);
  }
  // -------

  /**
  Membersihkan tag HTML
  @param {string} text yang akan dibersihkan
  */
  clearHTML(s) {
    if (!s || helper.typeCheck(s) !== "string") return s
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  parseHTML(s) {

    if (!s || helper.typeCheck(s) !== "string") return s

    let regexp = /(&amp;)|(&lt;)|(&gt;)/gm
    let m = String(s).match(regexp)
    if (m) {
      var s_replace = [s]
      m.forEach(x => {
        let tag = ["&amp;", "&lt;", "&gt;"]
        let parse = ["&", "<", ">"]
        let replaced = s_replace[0].replace(x, parse[tag.indexOf(x)])
        s_replace.splice(0, 1)
        s_replace.push(replaced)
      })
    } else {
      var s_replace = [s]
    }

    s = s_replace[0]

    let pola = /(<s>)|(<u>)|(<i>)|(<b>)|(<tg-spoiler>)|(<a href=('|").+('|")>)|(<pre>)|(<code>)/gm
    let cocok = String(s).match(pola)
    // Logger.log("Hasil Regex : " + cocok)
    // Logger.log("Panjang Match : " + cocok.length)

    if (cocok) {

      // Logger.log('Parse 1 Cocok')

      let duplicate = helper.isDuplicate(cocok)

      // if (duplicate) {
      //   // Logger.log('Duplicated!')
      //   var hasil = s
      // } else {

      var s_replaced = [s]
      cocok.forEach(x => {
        let a = /<(.+)>/i
        let b = a.exec(x)
        let replaced = s_replaced[0].replace(x, "�" + b[1] + "é")
        s_replaced.splice(0, 1)
        s_replaced.push(replaced)
      })
      // Logger.log("Parsing First : " + s_replaced[0])

      let regex = /(<\/s>)|(<\/u>)|(<\/i>)|(<\/b>)|(<\/tg-spoiler>)|(<\/a>)|(<\/pre>)|(<\/code>)/gm
      let match = s_replaced[0].match(regex)
      if (match) {

        // Logger.log('Parse 2 Cocok')

        match.forEach(x => {
          let a = /<\/(.+)>/i
          let b = a.exec(x)
          let replaced = s_replaced[0].replace(x, "�/" + b[1] + "é")
          s_replaced.splice(0, 1)
          s_replaced.push(replaced)
        })
        // Logger.log("Parsing Last : " + s_replaced[0])

        var hasil = s_replaced[0]

      } else {
        var hasil = s
      }

      // }

      // Logger.log("Parsing After Match : " + hasil)

    } else {
      var hasil = s
      // Logger.log('Tidak cocok')
    }

    let final = helper.clearHTML(hasil)
    // Logger.log("Hasil akhir : " + final)
    let fix = final.replace(/�/g, "<").replace(/é/g, ">")
    // Logger.log("Hasil Final : " + fix)
    return fix

  }

  /**
  Membersihkan tag Markdown
  @param {string} text yang akan dibersihkan
  */
  clearMarkdown(s) {
    if (!s || helper.typeCheck(s) !== "string") return s
    return s
      .replace(/_/g, "\\_")
      .replace(/\*/g, "\\*")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/~/g, "\\~")
      .replace(/`/g, "\\`")
      .replace(/>/g, "\\>")
      .replace(/#/g, "\\#")
      .replace(/\+/g, "\\+`")
      .replace(/-/g, "\\-")
      .replace(/=/g, "\\=")
      .replace(/\|/g, "\\|")
      .replace(/{/g, "\\{")
      .replace(/}/g, "\\}")
      .replace(/\./g, "\\.")
      .replace(/!/g, "\\!");
  }

  /**
  Membersihkan parse HTML yang tidak ingin digunakan
  */
  clearParse(s) {
    if (!s || helper.typeCheck(s) !== "string") return s

    // if (s.match(/<a href=('|").+('|")>.+<\/a>/gmi)) {
    //   s = s.replace(/(<a href=('|").+('|")>|<\/a>)/gmi, "")
    // }

    return s
      .replace(/(<b>|<\/b>)/gmi, "")
      .replace(/(<i>|<\/i>)/gmi, "")
      .replace(/(<s>|<\/s>)/gmi, "")
      .replace(/(<u>|<\/u>)/gmi, "")
      .replace(/(<a href=('|").+('|")>|<\/a>)/gmi, "")
      // .replace(/<\/a>/gmi, "&lt;/a&gt;")
      .replace(/(<tg-spoiler>|<\/tg-spoiler>)/gmi, "")
      .replace(/(<code>|<\/code>)/gmi, "")
      .replace(/(<pre>|<\/pre>)/gmi, "");
    ;
  }

  // shorthand untuk field name
  nama(data) {

    if (!data) throw new ReferenceError("🚫 Object has no contain information user.")
    if (helper.hasProp(data, "result")) {
      data = data.result
    }

    let id = data.id || undefined
    if (!id) id = undefined //'⚠️ JSON Object tidak memiliki field : id'

    let first = data.first_name || undefined
    let fullname = "\u200E" + first;
    let fullname_html = "\u200E" + helper.clearHTML(first)
    if (!first) {
      first = undefined //'⚠️ JSON Object tidak memiliki field : first_name'
      fullname = undefined
      fullname_html = undefined
    }
    let last = data.last_name || undefined;
    if (last) {
      fullname += ' ' + last;
      fullname_html += ' ' + helper.clearHTML(last)
    } else {
      last = "\u2063" //'⚠️ JSON Object tidak memiliki field : last_name'
    }
    let title = data.title || undefined
    if (title) {
      fullname = title
      fullname_html = helper.clearHTML(title)
    }
    // let html = '<b>' + this.clearHTML(fullname) + '</b>';
    // tambahkan username jika punya
    let username = data.username ? '@' + data.username : undefined //'⚠️ JSON Object tidak memiliki field : username';

    if (helper.isIn(["channel", "group", "supergroup"], data.type)) {
      if (!data.username) {
        var mention = `\u200E${fullname_html}`
      } else {
        var mention = `\u200E<a href='t.me/${data.username}'>${fullname_html}</a>`
      }
    } else {
      var mention = `\u200E<a href='tg://user?id=${id}'>${fullname_html}</a>`
    }
    // if (username) html += ' (' + username + ')'
    let bio = data.bio ?? data.description ?? undefined
    if (!bio) bio = "\u2063" //'⚠️ JSON Object tidak memiliki field : bio'

    let profile_pict = this.profil(data)

    return { id, first, last, fullname, fullname_html, username, mention, bio, profile_pict }

  }

  // alias nama
  name(...args) {
    return this.nama(...args);
  }

  // alias nama
  user(...args) {
    return this.nama(...args);
  }

  // menggenerate url
  url(data) {

    let username = data.username ?? undefined

    if (username) {
      let nama = helper.nama(data).fullname_html
      var type_1 = `\u200Ehttps://${data.username}.t.me`
      var type_2 = `\u200Ehttps://t.me/${data.username}`
      var type_3 = `\u200E<a href='${data.username}.t.me'>${nama}</a>`

      return {
        type_1,
        type_2,
        type_3
      }
    }

    return {
      type_1: undefined,
      type_2: undefined,
      type_3: undefined,
    }

  }

  link(...args) {
    return helper.url(...args)
  }

  // Mengambil data profile khususnya Foto
  profil(data) {
    if (!data) throw new ReferenceError("🚫 Object has no contain information user.")
    if (helper.hasProp(data, "result")) {
      data = data.result
    }
    if (!data.photo) return undefined;
    if (!data.photo.big_file_id) return undefined;
    return data.photo.big_file_id;
  }

  // alias profile
  profile(...args) {
    return this.profil(...args)
  }

  /**
   * NEW ADDED *)
   */

  createSetToken(length = 1, enumerations) {

    var result = [];
    var panjangKode = length;
    //panjang hasil acakan

    var pos = [];
    enums_code.forEach((x, y) => { if (x) pos.push(y) })

    var characters = enums_list[pos[0]];
    // var characters = enums_list[0];
    if (!pos || enumerations) {
      throw TypeError("Unknown enum type.")
    }

    if (characters == "ENCRYPT" || characters == "DECRYPT") throw TypeError("Enum type mismatch.")

    var panjangkarakter = characters.length;

    for (var i = 0; i < panjangKode; i++) {
      result.push(characters.charAt(Math.floor(Math.random() * panjangkarakter)));
    }

    let r = result.join('')

    return r;

  }

  /** 
   * MORE SECURE WITH TELEGRAMLIB!
  */

  encrypt(data, enumerations) {

    var pos = undefined;
    enums_code.forEach((x, y) => { if (x) pos = y })

    var characters = enums_list[pos];
    // var characters = enums_list[0];
    if (!pos || enumerations) {
      throw TypeError("Unknown enum type.")
    }

    if (characters !== "ENCRYPT") throw TypeError("Enum type mismatch.")

    if (helper.typeCheck(data) !== "string") {
      throw TypeError("data is not a string.")
    }
    // Logger.log("This data : " + data)

    var x = Utilities.newBlob(data).getBytes()
    // Logger.log(x) // array

    var y = x.join("+")
    var z = y.split("")
    // Logger.log(z)
    var encrypting = ""
    z.forEach(x => {
      if (x == "+") {
        encrypting += x.replace(x, helper.random(["ÿ", "ú", "š", "ñ", "è"]))
      }
      encrypting += x
    })

    encrypting = encrypting.replace(/\+/g, "")
    // return Logger.log(encrypting)

    var result = helper.allReplace(encrypting, obj_encrypt, true)

    result += helper.random(["∑∑", "∃∃", "ΦΦ", "ΞΞ", "ΛΛ"])

    // Logger.log(_token) // string
    /**
     * GDúGDúGHúFKúGJúGHúGHúGAúGGúGJúGKúHGúHGúJSúJJúKSúKLúHGúFLúHKúGFúAAAúJKúASMúAMGúASAúFGúJLúKKúFKúKMúHGúLLúFGúLKúAALúAMKúAA
     * FúHKúAAKúAAMúAMGúGMúKGúKLúLL
     */

    return result

  }

  decrypt(data, enumerations) {

    var pos = undefined;
    enums_code.forEach((x, y) => { if (x) pos = y })

    var characters = enums_list[pos];
    // var characters = enums_list[0];
    if (!pos || enumerations) {
      throw TypeError("Unknown enum type.")
    }

    if (characters !== "DECRYPT") throw TypeError("Enum type mismatch.")

    if (helper.typeCheck(data) !== "string") {
      throw TypeError("data is not a string.")
    }


    let generate = x => helper.allReplace(String(x), obj_decrypt, true).split(/[^\w\[\]"'\.\(\)]+/gm)

    let kunci = data.substring(data.length - 2, data.length)
    if (helper.isIn(secret_keys, kunci)) {
      var _key = generate(data.replace(kunci, ""))
    } else {
      throw TypeError("This data is not encoded with minigram.")
    }

    let new_generate = []
    _key.forEach(x => new_generate.push(parseInt(x)))

    let hasil = Utilities.newBlob(new_generate).getDataAsString()

    return hasil

  }

  getErrorMessage(e) {

    let error = e.message

    let regex = /"description":(.+)\}/i
    let cocok;

    if (cocok = regex.exec(error)) {
      var e_message = cocok[1]
    } else {
      var e_message = error
    }

    return e_message;

  }

  handleError(e, parse = undefined) {

    if (!e) throw TypeError("no error was detected.")

    let error = String(e.stack).split(/\n/gmi)
    let error_fix = new Set(error)
    let hasil = ""
    let tmp = []
    error_fix.forEach((x, y) => {
      tmp.push(y)
      if (/^[ ]{3,}/i.exec(x)) {
        if (tmp.length == error_fix.size) {
          var arrow = "└ "
        } else {
          var arrow = "├ "
        }

        let method = /^ *at *([\W.]+)/i
        let m = method.exec(String(x))
        if (m) {
          var result = m[1]
        } else {
          var result = ""
        }

        let e_message = "┌ " + String(x)
          .replace(/^ *at *([\W.]+)/i, result)
          .replace(/:/i, ".gs Ln.")
          .replace(/:/i, " Col.")
          .replace(/\(/gi, "\n└   ")
          .replace(/\)/i, "")

        if (parse == "HTML") {
          hasil += helper.clearHTML(e_message.trim()) + "\n"
        } else if (parse == "Markdown" || parse == "MarkdownV2") {
          hasil += helper.clearMarkdown(e_message.trim()) + "\n"
        } else {
          hasil += e_message.trim() + "\n "
        }
      } else {
        x = this.getErrorMessage(e)
        if (parse == 'HTML') {
          hasil += "⚠️ " + helper.clearHTML(String(x).trim()) + "\n"
        } else if (parse == "Markdown" || parse == "MarkdownV2") {
          hasil += "⚠️ " + helper.clearMarkdown(String(x).trim()) + "\n"
        } else {
          hasil += "⚠️ " + String(x).trim() + "\n"
        }
      }
    })

    if (parse == "HTML") {
      return "<code>" + hasil + "</code>"
    } else if (parse == "Markdown" || parse == "MarkdownV2") {
      return "`" + hasil + "`"
    } else {
      return hasil;
    }

  }

  // alias handleError
  catchError(...args) {
    return this.handleError(...args)
  }

  /**
   * New Indent Helper
   * 
   * ⚠️ Masih development
   * 
   */
  indent(string) {

    let data = String(string).split("\n")

    // Logger.log(helper.json(data))

    let indent = "  "
    let _L = [];
    let _l = [];
    let _return = [];
    let _forEach = [];
    let sort = []

    let error = []

    try {

      data.forEach((x, y) => {

        let urut = y + 1
        let pesan = ""; //storing temp message
        let stop = false;

        x = x.replace(/^ +/gmi, "").trim()

        // if (!x) return;

        /**
         * Checking class
         */
        if (/\.forEach/g.exec(x)) {

          // Logger.log("📍 Masuk forEach")

          pesan += urut + ". forEach - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x

          //Checking Area
          if (/^ *\w+\.forEach\([\w\s \(\),]+=> *{/g.exec(String(x))) {

            // Logger.log("✅ Clear in line " + urut)

            _forEach.push("Active")
            _return.push(false)
            _l.push(_l.length)

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : forEach")
          }

        } else if (/class.+{/gi.exec(x)) {

          // Logger.log("📍 Masuk class")

          pesan += urut + ". class { - [" + x + "]\n"

          var res = indent.repeat(_l.length) + x

          //Checking Area
          if (/class *[\w]+ *{/g.exec(String(x))) {

            // Logger.log("✅ Clear in line " + urut)
            _l.push(0)

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : Class")
          }
          /**
           * Checking if () or function () {
           */
        } else if (/^ *(if|function).+\{?/gi.exec(x)) {

          // Logger.log("📍 Masuk if | function")

          if (/function/i.exec(x)) {
            var tipe = "function"
            // Logger.log("🔖 this.Function")
          } else {
            var tipe = "if"
            // Logger.log("🔖 this.if")
          }

          pesan += urut + ". " + tipe + " - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x

          //Checking Area
          if (/^ *(if|function) *\([^\{\}\(\)]*\)/g.exec(String(x))) {

            if (tipe == "function") {
              if (/^ *function[\s \w]+\([^\{\}\(\)]*\) *{/g.exec(String(x))) {
                // Logger.log("✅ Clear in line " + urut)
                _return.push(false)
                _l.push(_l.length)
              } else {
                stop = "🚫 Error in line " + urut + "\n└   " + res
                // Logger.log("👉 Lihat bagian : Function")
              }
            } else {
              if (/^ *if *\([^\{\}\(\)]*\) *{/g.exec(String(x))) {
                // Logger.log("✅ Clear in line " + urut)
                _return.push(false)
                _l.push(_l.length)
              } else if (/^ *if *\([^\{\}\(\)]*\)/g.exec(String(x))) {
                // Logger.log("✅ Clear in line " + urut + " [No Return]")
              } else {
                stop = "🚫 Error in line " + urut + "\n└   " + res
                // Logger.log("👉 Lihat bagian : If")
              }
            }

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : If or Function")
          }

          /**
           * Checking []
           */
        } else if (/try.+\{/gi.exec(x)) {

          // Logger.log("📍 Masuk try")

          pesan += urut + ". try - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x

          //Checking Area
          if (/^ *try *{/g.exec(String(x))) {

            // Logger.log("✅ Clear in line " + urut)
            if (_forEach.length !== 0) {
              _forEach.push(true)
            }
            _return.push(false)
            _l.push(_l.length)

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : Try")
          }

          /**
           * Checking } get | set | constructor {
           */
        } else if (/^ *(get|set|constructor)? *\w* *\(.*\) *{/gi.exec(x)) {

          // Logger.log("📍 Masuk setter | getter | constructor")

          pesan += urut + ". func in class - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x

          //Checking Area
          if (/^ *(get|set|constructor)? *\w* *\([^\{\}\(\)]*\) *{/g.exec(String(x))) {

            // Logger.log("✅ Clear in line " + urut)
            _return.push(false)
            _l.push(0)

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : Constructor")
          }

          /**
           * Checking } else {
           */
        } else if (/}? *else *{?/gi.exec(x)) {

          // Logger.log("📍 Masuk else")

          pesan += urut + ". } else - [" + x + "]\n"
          var res = indent.repeat(_l.length - 1) + x

          //Checking Area
          if (/^ *} *else *(if *\([^\{\}\(\)]*\))? *{/g.exec(String(x))) {

            // Logger.log("✅ Clear in line " + urut)
            if (_return[_return.length - 1] == true) {
              _return.fill(false, _return.length - 1, _return.length)
            }

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : Else")
          }

          /**
           * Checking } catch {
           */
        } else if (/} ?catch/gi.exec(x)) {

          // Logger.log("📍 Masuk catch")

          pesan += urut + ". } catch -  [" + x + "]\n"

          var res = indent.repeat(_l.length - 1) + x

          // Logger.log("🔖 Catch Accepted!")

          //Checking Area
          if (/^ *} *catch *\(?[^\{\}\(\)\W]*\)? *{/g.exec(String(x))) {

            // Logger.log("✅ Clear in line " + urut)

            if (_return[_return.length - 1] == true) {
              _return.fill(false, _return.length - 1, _return.length)
            }

          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : Catch")
          }

          /**
           * Checking } only
           */
        } else if (/(\[|\{) *$/gi.exec(x)) {

          // Logger.log("📍 Masuk [ Siku Buka | { Kurawal Buka")

          pesan += urut + ". [ Kurung Siku - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x

          //Checking Area
          if (/\[ *$/g.exec(String(x))) {
            // Logger.log("✅ Clear in line " + urut)
            if (_L.length !== 0) {
              _L.push("Active")
            }
            _l.push(_l.length)
          } else if (/\{ *$/g.exec(String(x))) {
            // Logger.log("✅ Clear in line " + urut)
            _l.push(_l.length)
          } else {
            stop = "🚫 Error in line " + urut + "\n└   " + res
            // Logger.log("👉 Lihat bagian : []")

          }

          /**
           * Checking try {
           */
        } else if (/}/g.exec(x)) {

          // Logger.log("📍 Masuk }")

          pesan += urut + ". } - [" + x + "]\n"

          //Checking Area
          if (/{.+:.+}/i.exec(String(x))) {

            var res = indent.repeat(_l.length) + x
            // Logger.log("✅ Clear in line " + urut + " [Not Bracket]")

          } else if (/^ *}\)?/g.exec(String(x))) {

            var res = indent.repeat(_l.length - 1) + x

            // periksa jika forEach aktif, pastikan diakhiri })
            if (_forEach.length !== 0) {
              if (_forEach[_forEach.length - 1] == "Active") {
                if (/^ *}\)/g.exec(String(x))) {
                  // Logger.log("✅ Clear in line " + urut)
                } else {
                  stop = "🚫 Unknown ) in end of input " + urut + "\n└   " + x
                  // Logger.log("👉 Lihat bagian : }")
                }
              } else {
                // Logger.log("✅ Clear in line " + urut)
                _forEach.pop()
              }
            }

            _return.pop()
            _l.pop()

          } else {
            stop = "🚫 Type } mismatch " + urut + "\n└   " + x
            // Logger.log("👉 Lihat bagian : }")
          }

          /**
           * Checking others
           */
        } else if (/^ *\]/g.exec(x)) {

          // Logger.log("📍 Masuk ]")

          var res = indent.repeat(_l.length - 1) + x

          // periksa jika forEach aktif, pastikan diakhiri })
          if (_L.length !== 0) {
            if (_L[_L.length - 1] == "Active") {
              if (/\]/g.exec(String(x))) {
                // Logger.log("✅ Clear in line " + urut)
              } else {
                stop = "🚫 Unknown ) in end of input " + urut + "\n└   " + x
                // Logger.log("👉 Lihat bagian : }")
              }
            } else {
              // Logger.log("✅ Clear in line " + urut)
              _L.pop()
            }
          }

          _L.pop()
          _l.pop()

        } else if (/return/gi.exec(x)) {

          // Logger.log("📍 Masuk return")

          pesan += urut + ". return - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x

          if (_return.length !== 0) {
            if (_return[_return.length - 1] !== true) {
              // Logger.log("✅ Clear in line " + urut)
              _return.fill(true, _return.length - 1, _return.length)
            } else if (_return[_return.length - 1] == true) {
              error.push("🚫 Illegal return in line " + urut)
            } else {
              // Logger.log("✅ Clear in line " + urut)
              _return.pop()
            }
          } else if (_l.length == 0 || _return.length == 0) {
            error.push("🚫 Illegal return in line " + urut)
            // Logger.log("👉 Lihat bagian : Return")
          }

        } else {

          // Logger.log("📍 Masuk un-defined")

          pesan += urut + ". None - [" + x + "]\n"
          var res = indent.repeat(_l.length) + x
          // Logger.log("✅ Clear in line " + urut)

        }

        sort.push(res)

        if (stop) {
          // Logger.log(stop)
          return error.push(stop);
        } else {
          let x_pesan = `
          let _l = ${_l}
          let _L = ${_L}
          let _return = ${_return}
          let forEach = ${_forEach}`
          pesan += x_pesan.replace(/ {1,}/gmi, " ")
          // Logger.log(pesan + "\n\n" + sort.join("\n"))
        }

      })

    } catch (e) {
      // Logger.log("⛔️ Invalid indent!\n\n" + e.message)
      return { ok: false, result: "🚫 Failed while re-indent code!\n\n[400] - " + helper.getErrorMessage(e) }
    }

    if (error.length !== 0) {
      var hasil = { ok: false }
      var res = ""
      error.forEach(x => res += x.replace(/  +/g, " ").replace("└ ", "└  ").trim() + "\n")
      hasil.result = res
    } else if (_l.length !== 0) {
      var hasil = { ok: false }
      hasil.result = "⚠️ Missing } in end of input"
    } else {
      var hasil = { ok: true }
      hasil.result = sort.join("\n")
    }

    // Logger.log("⚙️ " + hasil.ok);
    // Logger.log("📝 " + hasil.result);

    return hasil

  }

  /**
   * NEW ADDED *)
   */
  convertSize(bytes, biner = false) {

    var bi = biner //biner 1024 bytes
    var dp = 1
    const thresh = bi ? 1024 : 1000;

    if (Math.abs(bytes) < thresh) {
      bytes + ' B';
    }

    const units = bi
      ? ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
      : ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let u = -1;
    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

    //console.log(bytes.toFixed(dp) + ' ' + units[u]);
    return bytes.toFixed(dp) + ' ' + units[u]

  }

  // alias converSize
  getSize(...args) {
    return this.convertSize(...args)
  }

  /**
   * New *) Working with UNIX_STAMPDATE
   */

  unix(UNIX_timestamp, addedTime, timeZone, formatDate) {

    if (addedTime) {
      var extra = parseInt(addedTime)
      var unix = UNIX_timestamp + extra
    } else {
      var unix = parseInt(UNIX_timestamp)
    }

    if (/GMT\+\d/g.exec(timeZone) || /Asia\/\w/g.exec(timeZone)) {
      // Accepted timeZone
    } else { timeZone = "GMT+7" }

    if (!formatDate) {
      formatDate = "dd MMMM yyyy HH:mm:ss"
    }

    let res = Utilities.formatDate(new Date(unix * 1000), timeZone, formatDate)

    return res;
  }

  /**
   * New *) Creating QR Code
   */
  createQRCode(text, pixel = "300x300") {

    let match = /^(\d+)x(\d+)$/g.exec(pixel)
    if (match) {
      if (match[1] !== match[2]) {
        throw new Error("pixel must be in square. [default:300x300]")
      }
      // format sesuai
    } else {
      throw new Error("unsupported pixel type. [default:300x300]")
    }

    try {

      let decodeUrl = encodeURIComponent(text)

      var imageData = UrlFetchApp.fetch("https://api.qrserver.com/v1/create-qr-code/?data=" + decodeUrl + "&size=" + pixel + "&margin=5&format=jpg").getBlob()

      return imageData;

    } catch (e) {

      // Jika public API QR diatas error, menggunakan API Chart Google

      var imageData = UrlFetchApp.fetch('https://chart.googleapis.com/chart',
        {
          'method': 'post',
          'payload':
          {
            'cht': 'qr',
            'chl': text,
            'chs': pixel,
          }
        }).getBlob();

      return imageData;

    }

  }

  readQRCode(url_link) {

    let isLink = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/i
    let match = isLink.exec(url_link)

    // Jika content_url berisi link langsung di proses
    if (match) {
      // proses url
    } else {

      // jika teks bukan berupa url, akan dikembalikan pesan error
      throw new Error("invalid image url.")

    }

    let decodeUrl = encodeURIComponent(url_link)

    try {
      var response = UrlFetchApp.fetch("http://api.qrserver.com/v1/read-qr-code/?fileurl=" + decodeUrl)
    } catch (e) {
      return {
        ok: false,
        result: helper.getErrorMessage(e)
      }
    }

    var hasil = JSON.parse(response)
    var res = hasil[0].symbol[0].data

    if (!res) {
      return {
        ok: false,
        result: "\u2063"
      }
    } else {
      return {
        ok: true,
        result: res
      }
    }

  }

  /* Added Countdown */
  countdown(start_time, end_time) {

    if (helper.typeCheck(start_time) == "string") {

      let start_ = /^(\d\d?)[\-\/:_](\d\d?)[\-\/:_](\d{4}) ?(\d\d:\d\d:\d\d)?/g.exec(start_time)
      if (start_) {
        var starting = new Date(start_[2] + "/" + start_[1] + "/" + start_[3] + " " + (start_[4] || ""))
      } else { throw new Error('invalid format date. [must be a new Date() or dd/mm/yyyy HH:MM:SS]') }

    } else if (helper.typeCheck(start_time) == "date") {
      var starting = start_time
    } else { throw new Error('start_time must be a date.') }

    if (helper.typeCheck(end_time) == "string") {

      let end_ = /^(\d\d?)[\-\/:_](\d\d?)[\-\/:_](\d{4}) ?(\d\d:\d\d:\d\d)?/g.exec(end_time)
      if (end_) {
        var finishing = new Date(end_[2] + "/" + end_[1] + "/" + end_[3] + " " + (end_[4] || ""))
      } else { throw new Error('invalid format date. [must be a new Date() or dd/mm/yyyy HH:MM:SS]') }

    } else if (helper.typeCheck(end_time) == "date") {
      var finishing = end_time
    } else { throw new Error('end_date must be a date.') }

    let waktu = finishing.getTime() - starting.getTime()

    if (waktu < 0) throw new Error("start_time is greater than end_time.")

    var detik = 1000;
    var menit = detik * 60;
    var jam = menit * 60;
    var hari = jam * 24;

    var h = Math.floor(waktu / (hari));
    var j = Math.floor((waktu % (hari) / (jam)))
    var m = Math.floor((waktu % (jam)) / (menit))
    var d = Math.floor((waktu % (menit)) / (detik))

    if (h > 30) return 'Masih ' + h + ' hari lagi'

    return (h !== 0 ? h + " Hari " : "") + (j !== 0 ? j + " Jam " : "") + (m !== 0 ? m + " Menit " : "") + (d !== 0 ? d + " Detik " : "")

  }

  /* Acak data array!
   *
   * Source => https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
   * 
  **/
  shuffle(array) {

    if (helper.typeCheck(array) !== "array") return "Data is not array"

    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;

  }

  /**
   * New Method *)
   */
  proper(string) {

    if (helper.typeCheck(string) !== "string") throw new Error("🚫 Data " + string + " is not string!")

    let str = string.split("");

    str.forEach((e, i) => {
      if (i == 0 || str[i - 1] == " ") {
        str[i] = str[i].toUpperCase();
      } else if (str[i - 1] != " " && e != " ") {
        str[i] = str[i].toLowerCase();
      };
    });

    str = str.join("");

    return str;

  };

  /**
   * New Update Looping
   */
  forLoop(range, fn) {

    if (helper.typeCheck(range) == "array") {

      // Iterate over array values
      for (var i = 0; i < range.length; i++) {
        // fn()
        fn(range[i], () => { })
      }

    } else if (helper.typeCheck(range) == "number") {

      for (var i = 0; i < range; i++) {
        fn()
      }

    } else throw new Error("🚫 No data array or integer range can be found!")

  }

  expand(data, start = 1) {

    let hasil = []

    if (helper.typeCheck(data) == "array") {

      if (helper.typeCheck(data[0]) == "array") {
        data.forEach(x => {
          x.forEach(y => hasil.push(y))
        })
        return hasil;
      }

    } else if (helper.typeCheck(data) == "number") {

      for (var i = start; i < data + 1; i++) {
        hasil.push(i)
      }
      return hasil;

    } else if (helper.typeCheck(data) == "object") {

      let keys = Object.keys(data)

      keys.forEach(x => {
        hasil.push([x, data[x]])
      })

      return hasil;

    } else throw new Error("🚫 Unsupported data type!")

  }

  /**
   * New Pagination
   */

  pagination(range, page, fn) {

    let ranges = helper.expand(range)

    if (helper.typeCheck(fn) !== "string") throw new Error("🚫 Callback data must be a string.")
    if (helper.typeCheck(range) !== "number") throw new Error("🚫 Range must be a integer.")
    if (helper.typeCheck(page) !== "number") throw new Error("🚫 Current page must be a integer.")

    let keyboard = []

    ranges.forEach(x => {

      // buat pagination untuk button maksimal 6
      if (range < 6) {

        if (String(x) == String(page)) {
          keyboard.push({ text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) })
        } else {
          keyboard.push({ text: x, callback_data: fn.replace(/{number}|{pos}/gi, x) })
        }

      } else {

        let last_ = ranges[0]
        let before_last = last_ + 1
        let mid_last = last_ + 2
        let first_ = ranges[ranges.length - 1]
        let before_first = first_ - 1
        let mid_first = first_ - 2

        if (page == last_) {

          // pagination in COL - 1

          keyboard[0] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }
          keyboard[1] = { text: Math.floor(page + 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 1)) }
          keyboard[2] = { text: Math.floor(page + 2), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 2)) }
          keyboard[3] = { text: Math.floor(page + 3) + " ›", callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 3)) }
          keyboard[4] = { text: first_ + " »", callback_data: fn.replace(/{number}|{pos}/gi, first_) }

        } else if (page == before_last) {

          // pagination in COL - 2
          keyboard[0] = { text: last_, callback_data: fn.replace(/{number}|{pos}/gi, last_) }
          keyboard[1] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }
          keyboard[2] = { text: Math.floor(page + 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 1)) }
          keyboard[3] = { text: Math.floor(page + 2) + " ›", callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 2)) }
          keyboard[4] = { text: first_ + " »", callback_data: fn.replace(/{number}|{pos}/gi, first_) }

        } else if (page == before_first) {

          // pagination in COL - 4
          keyboard[0] = { text: "« " + last_, callback_data: fn.replace(/{number}|{pos}/gi, last_) }
          keyboard[1] = { text: "‹ " + Math.floor(page - 2), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 2)) }
          keyboard[2] = { text: Math.floor(page - 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 1)) }
          keyboard[3] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }
          keyboard[4] = { text: first_, callback_data: fn.replace(/{number}|{pos}/gi, first_) }


        } else if (page == first_) {

          // pagination in COL - 5

          keyboard[0] = { text: "« " + last_, callback_data: fn.replace(/{number}|{pos}/gi, last_) }
          keyboard[1] = { text: "‹ " + Math.floor(page - 3), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 3)) }
          keyboard[2] = { text: Math.floor(page - 2), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 2)) }
          keyboard[3] = { text: Math.floor(page - 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 1)) }
          keyboard[4] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }

        } else if (page == mid_last) {

          keyboard[0] = { text: last_, callback_data: fn.replace(/{number}|{pos}/gi, last_) }
          keyboard[1] = { text: Math.floor(page - 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 1)) }
          keyboard[2] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }
          keyboard[3] = { text: Math.floor(page + 1) + " ›", callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 1)) }
          keyboard[4] = { text: first_ + " »", callback_data: fn.replace(/{number}|{pos}/gi, first_) }

        } else if (page == mid_first) {

          keyboard[0] = { text: "« " + last_, callback_data: fn.replace(/{number}|{pos}/gi, last_) }
          keyboard[1] = { text: "‹ " + Math.floor(page - 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 1)) }
          keyboard[2] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }
          keyboard[3] = { text: Math.floor(page + 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 1)) }
          keyboard[4] = { text: first_, callback_data: fn.replace(/{number}|{pos}/gi, first_) }

        } else {

          // pagination in COL - 3

          keyboard[0] = { text: "« " + last_, callback_data: fn.replace(/{number}|{pos}/gi, last_) }
          keyboard[1] = { text: "‹ " + Math.floor(page - 1), callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page - 1)) }
          keyboard[2] = { text: "· " + page + " ·", callback_data: fn.replace(/{number}|{pos}/gi, page) }
          keyboard[3] = { text: Math.floor(page + 1) + " ›", callback_data: fn.replace(/{number}|{pos}/gi, Math.floor(page + 1)) }
          keyboard[4] = { text: first_ + " »", callback_data: fn.replace(/{number}|{pos}/gi, first_) }
        }

      }

    })

    return [keyboard];

  }

  /** Deteksi Ganjil Genap */

  // ganjil
  isOdd(number) {

    if (helper.typeCheck(number) !== "number") throw new Error("🚫 Odd/Even only work with number (integer).")

    let value = Math.floor(number % 2)

    // Jika value tidak habis dibagi 2 berarti GANJIL
    if (value) {
      return true; // Hasil ganjil
    } else {
      return false;
    }

  }

  // genap
  isEven(number) {

    if (helper.typeCheck(number) !== "number") throw new Error("🚫 Odd/Even only work with number (integer).")

    let value = Math.floor(number % 2)

    // Jika value tidak habis dibagi 2 berarti GENAP
    if (value) {
      return false;
    } else {
      return true; // Hasil genap
    }

  }

  /**
   * New Serie
   */
  terbilang(Nilai) {

    if (helper.typeCheck(Nilai) !== "number") throw new Error("🚫 Only accepted number / integer!")
    if (/NaN/g.exec(String(Nilai))) throw new Error("⛔️ Invalid number / integer!")

    if (Nilai == 0) return "Nol"


    var Nilai_ = Number(Nilai).toLocaleString("en-US", {
      maximumFractionDigits: 20
    })

    let format = String(Nilai_).match(/\.(\d+)/i)

    if (format) {
      var nilai_ = format[1].split("")
    } else {
      var nilai_ = false;
    }

    var bilangan = String(Nilai_).replace(/,/gi, "").replace(/\.\d+/gi, "")

    // return String(Nilai_) + "\nKoma? " + nilai_ + "\nJoin? " + nilai_.join("");

    var kalimat = "";
    var angka = new Array('0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0');
    var kata = new Array('', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan');
    var tingkat = new Array('', 'Ribu', 'Juta', 'Milyar', 'Triliun');
    var panjang_bilangan = bilangan.length;

    /* pengujian panjang bilangan */
    if (panjang_bilangan > 15) {
      throw new Error("🚫 Maximal digit can read!");
    } else {

      for (i = 1; i <= panjang_bilangan; i++) {
        angka[i] = bilangan.substr(-(i), 1);
      }

      var i = 1;
      var j = 0;

      /* mulai proses iterasi terhadap array angka */
      while (i <= panjang_bilangan) {

        var subkalimat = "";
        var kata1 = "";
        var kata2 = "";
        var kata3 = "";

        if (angka[i + 2] != "0") {
          if (angka[i + 2] == "1") {
            kata1 = "Seratus";
          } else {
            kata1 = kata[angka[i + 2]] + " Ratus";
          }
        }

        if (angka[i + 1] != "0") {
          if (angka[i + 1] == "1") {
            if (angka[i] == "0") {
              kata2 = "Sepuluh";
            } else if (angka[i] == "1") {
              kata2 = "Sebelas";
            } else {
              kata2 = kata[angka[i]] + " Belas";
            }
          } else {
            kata2 = kata[angka[i + 1]] + " Puluh";
          }
        }

        if (angka[i] != "0") {
          if (angka[i + 1] != "1") {
            kata3 = kata[angka[i]];
          }
        }

        /* mengecek angka tidak nol semua, lalu ditambahkan tingkat */
        if ((angka[i] != "0") || (angka[i + 1] != "0") || (angka[i + 2] != "0")) {
          subkalimat = kata1 + " " + kata2 + " " + kata3 + " " + tingkat[j] + " ";
        }

        kalimat = subkalimat + kalimat;
        i = i + 3;
        j = j + 1;
      }

      /* mengganti Satu Ribu jadi Seribu jika diperlukan */
      if ((angka[5] == "0") && (angka[6] == "0")) {
        kalimat = kalimat.replace("Satu Ribu", "Seribu");
      }
    }

    if (nilai_) {

      kalimat += " Koma"
      let tabel = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
      let text = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"]

      nilai_.forEach(x => {
        kalimat += " " + text[tabel.indexOf(x)]
      })

      /*
      if (nilai_.join("") !== "000") {
        kalimat += " Koma"
        let tabel = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
        let text = ["Nol", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"]

        nilai_.forEach((x, y) => {

          let current_ = nilai_.length - y
          if (current_ == 3) {
            if (x == "1") {
              if (nilai_[2] !== "0") {
                kalimat += " Seratus"
              } else {
                kalimat += " " + text[tabel.indexOf(x)] + " Belas"
              }
            } else if (x !== "0") {
              kalimat += " " + text[tabel.indexOf(x)] + " Ratus"
            } else {
              kalimat += " Nol"
            }
          } else if (current_ == 2) {
            if (x == "1") {
              if (nilai_[1] !== "0") {
                kalimat += " Sepuluh"
              } else {
                kalimat += " " + text[tabel.indexOf(x)] + " Belas"
              }
            } else if (x !== "0") {
              kalimat += " " + text[tabel.indexOf(x)] + " Puluh"
            } else {
              kalimat += " Nol"
            }
          } else {
            kalimat += " " + text[tabel.indexOf(x)]
          }

        })
      }
      */

    }

    return kalimat.replace(/\s{2,}/g, " ").trim();

  }

  /**
   * Bilangan kelipatan x
   */
  factor(Nilai) {

    if (helper.typeCheck(Nilai) !== "number") throw new Error("🚫 Only work with number / integer.")

    // membuat kelipatan
    let kelipatan = []

    let x = helper.expand(10)

    x.forEach((x, y) => {
      let z = y + 1
      kelipatan.push(Math.floor(Nilai * z))
    })

    return kelipatan;

  }

  /**
   * Creating custom inline_keyboard
   */
  customKeyboard(max_row, max_col, cb_text, cb_data) {

    if (!helper.typeCheck(max_row) == "number") throw new Error("🚫 Maximal rows must be an integer / number.")
    if (!helper.typeCheck(max_col) == "number") throw new Error("🚫 Maximal cols must be an integer / number.")

    let jumlah = max_row * max_col
    let data = helper.expand(jumlah)
    let keyboard = []

    let rows = helper.factor(max_row)
    let cols = helper.expand(max_col)
    cols.forEach(x => keyboard.push([]))

    keyboard.forEach((x, y) => {

      let key_row = []
      let expand_row = helper.expand(max_row)

      expand_row.forEach((a, b) => {
        let pos = String(y) + "_" + String(b)
        key_row.push({ text: cb_text, callback_data: cb_data.replace(/{(number|pos)}/g, pos) })
      })

      keyboard[y] = key_row

    })

    return keyboard

  }

  /** new Calender Python */
  calender(year, month, today = false) {

    /** bulan dimulai dari 0 untuk januari */
    month = month - 1

    /** proteksi argument agar sesuai */
    if (!year && !month) throw new Error("🚫 calender.month() missing 2 required positional arguments: 'year' and 'month'")
    if (!year) throw new Error("🚫 calender.month() missing 1 required positional arguments: 'year'")
    if (!month && helper.typeCheck(month) !== "number") throw new Error("🚫 calender.month() missing 1 required positional arguments: 'month'")
    if (helper.typeCheck(year) !== "number") throw new Error("⛔️ Year is must be a number / integer.")
    if (helper.typeCheck(month) !== "number") throw new Error("⛔️ Month is must be a number / integer.")

    const now = new Date()
    const date = new Date(year, month, now.getDate())

    /** custom font untuk menampilkan tanggal hari ini */
    const FONT_TYPE = ["𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡", "𝟙𝟘", "𝟙𝟙", "𝟙𝟚", "𝟙𝟛", "𝟙𝟜", "𝟙𝟝", "𝟙𝟞", "𝟙𝟟", "𝟙𝟠", "𝟙𝟡", "𝟚𝟘", "𝟚𝟙", "𝟚𝟚", "𝟚𝟛", "𝟚𝟜", "𝟚𝟝", "𝟚𝟞", "𝟚𝟟", "𝟚𝟠", "𝟚𝟡", "𝟛𝟘", "𝟛𝟙"]

    const list_month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    const bulan = list_month[month]

    /** jumlah tanggal februari mengikuti tahun kabisat (bisa 28 / 29) */
    let kabisat = (date.getFullYear() % 4 == 0) ? true : false
    let dates_a_month = [31, (kabisat ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    let end_of_date = dates_a_month[month] // Tanggal terakhir bulan saat ini.

    let title = bulan + " " + year
    let title_space = Math.floor(20 - title.length)

    let Y = title_space % 2
    let Z = Math.floor(title_space / 2)
    if (Y !== 0) {
      var L = Z
      var R = Z + 1
    } else {
      var L = Z
      var R = Z
    }

    // [ 0,  1,  2,  3,  4,  5,  6]
    // [Su, Mo, Th, We, Th, Fr, Sa]

    let START = new Date(year, month, 1).getDay()

    let CALENDER_MONTH = (" ").repeat(L) + bulan + " " + year + (" ").repeat(R)
    CALENDER_MONTH += "\nSu Mo Tu We Th Fr Sa"
    let CALENDER_DATES = [
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
      ["  ", "  ", "  ", "  ", "  ", "  ", "  "],
    ]

    CALENDER_DATES.forEach((ROW, i) => {

      /** proses hanya baris pertama kalender */
      if (i == 0) {

        ROW.forEach((DAY, j) => {

          /** menentukan posisi tanggal kemarin */
          if (j == 0) {
            var latest = 0
          } else {
            var latest = j - 1
          }

          if (CALENDER_DATES[i][latest] !== "  ") {
            let push_date = eval(`${CALENDER_DATES[i][latest]}+1`)
            CALENDER_DATES[i].splice(j, 1, (String(push_date).length == 1 ? " " + push_date : push_date))
          }

          /** jika tanggal 1 awal bulan sama dengan posisi tanggal di minggu ini */
          if (START == j) {
            CALENDER_DATES[i].splice(j, 1, " 1")
          }

        })

      }

      /** proses baris berikutnya */
      if (i !== 0) {

        /** mengambil tangga terakhir dari minggu sebelumnya */
        let current_date = CALENDER_DATES[i - 1][6]

        ROW.forEach((DAY, z) => {

          /** menentukan posisi tanggal kemarin */
          if (z == 0) {
            var latest = 0
          } else {
            var latest = z - 1
          }

          /** menentukan tanggal untuk di kalkulai dengan kemarin atau akhir minggu lalu */
          if (z == 0) {
            var push_date = eval(`${CALENDER_DATES[i][latest]}+${current_date}+1`)
          } else {
            var push_date = eval(`${CALENDER_DATES[i][latest]}+1`)
          }

          /** jika tanggal akhir bulan sudah masuk di list maka hentikan proses */
          if (helper.isIn(CALENDER_DATES[i], end_of_date)) return;
          if (helper.isIn(CALENDER_DATES[i - 1], end_of_date)) return;
          if (current_date == "  ") return;

          CALENDER_DATES[i].splice(z, 1, (String(push_date).length == 1 ? " " + push_date : push_date))

        })

      }

      /** susun weekday ke daftar */
      CALENDER_MONTH += "\n" + CALENDER_DATES[i].join(" ")

    })

    /** custom font untuk menampilkan tanggal hari ini jika aktif */
    /** hanya jika bulan yang ingin ditampilkan sama dengan bulan saat ini */
    if (today) {

      let this_year = now.getFullYear()
      let this_month = now.getMonth()

      if (this_year == year && this_month == month) {
        CALENDER_MONTH = CALENDER_MONTH.replace(new RegExp(String(now.getDate()), "i"), FONT_TYPE[Number(now.getDate())])
      }

    }

    return CALENDER_MONTH;

  }

  kalender(...args) {
    return helper.calender(...args)
  }

  /** creating progress result */
  progress(times = 10, message = "") {

    let result = []

    let percent = 0
    if (100 % times !== 0) throw new Error("⛔️ Accepted only 1, 2, 5, 10, 20, 25, 50 for times!")
    let balance = Math.floor(100 / times)
    let arr = []
    helper.expand(times).map(x => arr.push("▒"))

    result.push("[" + arr.join("") + "] - 0% " + message)

    for (let i = 0; i < times; i++) {

      if (i < 2) {
        arr.splice(0, 0, "█")
        arr.pop()
      } else {
        arr.splice(0, 0, arr.pop())
      }

      percent = Number((percent + balance))

      result.push("[" + arr.join("") + "] - " + percent + "% " + message)

    }

    return result;

  }

  bar(...args) {
    return helper.progress(...args)
  }

  /** upload media ke telegraph - return ok true when successfull uploaded */
  telegraph(URL) {

    // valid url also public link
    if (/^https?:\/\//i.exec(URL)) {
      // URL valid
    } else throw new Error("⛔️ Invalid URL!")

    try {
      var blob = UrlFetchApp.fetch(URL).getBlob()
    } catch (e) {
      return {
        ok: false,
        result: helper.getErrorMessage(e)
      }
    }

    const _telegraph_link = 'https://telegra.ph/upload'

    // Create JSON for post payload to url
    let payload = {
      file: blob
    }
    let options = {
      method: 'POST',
      payload: payload,
      muteHttpExceptions: true
    }

    // Upload to telegra.ph
    var upload_result = UrlFetchApp.fetch(_telegraph_link, options)

    // Parse result using JSON.parse()
    var _json = JSON.parse(upload_result.getContentText())

    if (_json.error) {
      return {
        ok: false,
        result: _json.error
      }
    } else {

      // Get url path in telegra.ph
      let file_path = _json[0].src

      // Output to the console using console.log()
      return {
        ok: true,
        result: "https://telegra.ph" + file_path
      }

    }

  }

  /** menghitung jarak antar waktu */
  time(start_time, point_time) {

    /** Periksa tipe dahulu */
    let accepted = ["date", "number", "string"]

    /** proses start time */
    let start_tipe = helper.typeCheck(start_time)
    if (!helper.isIn(accepted, start_tipe)) throw new Error("🚫 Start time must be an integer, a string or class Date.")
    if (start_tipe == "date") {
      let jam = start_time.getHours()
      let menit = start_time.getMinutes()
      var start_jam = (String(jam).length == 1) ? "0" + jam : jam
      var start_menit = (String(menit).length == 1) ? "0" + menit : menit
      var start_query = parseInt(String(start_jam) + String(start_menit))
    } else if (start_tipe == "number") {
      let Date = new Date(start_time * 1000)
      let jam = Date.getHours()
      let menit = Date.getMinutes()
      var start_jam = (String(jam).length == 1) ? "0" + jam : jam
      var start_menit = (String(menit).length == 1) ? "0" + menit : menit
      var start_query = parseInt(String(start_jam) + String(start_menit))
    } else {
      let separator = /\d{1,2}(:|.)\d{1,2}/g.exec(start_time)
      if (!separator) throw new Error("🚫 Start time must be type with format 00.00 or 00:00")
      let split = start_time.split(separator[1])
      let jam = parseInt(split[0])
      let menit = parseInt(split[1])
      var start_jam = (String(jam).length == 1) ? "0" + jam : jam
      var start_menit = (String(menit).length == 1) ? "0" + menit : menit
      var start_query = parseInt(String(start_jam) + String(start_menit))
    }

    /** proses point time */
    let point_tipe = helper.typeCheck(point_time)
    if (!helper.isIn(accepted, point_tipe)) throw new Error("🚫 Point time must be an integer, a string or class Date.")
    if (point_tipe == "date") {
      let jam = point_time.getHours()
      let menit = point_time.getMinutes()
      var point_jam = (String(jam).length == 1) ? "0" + jam : jam
      var point_menit = (String(menit).length == 1) ? "0" + menit : menit
      var point_query = parseInt(String(point_jam) + String(point_menit))
    } else if (point_tipe == "number") {
      let Date = new Date(point_time * 1000)
      let jam = Date.getHours()
      let menit = Date.getMinutes()
      var point_jam = (String(jam).length == 1) ? "0" + jam : jam
      var point_menit = (String(menit).length == 1) ? "0" + menit : menit
      var point_query = parseInt(String(point_jam) + String(point_menit))
    } else {
      let separator = /\d{1,2}(:|\.)\d{1,2}/g.exec(point_time)
      if (!separator) throw new Error("🚫 Point time must be type with format 00.00 or 00:00")
      let split = point_time.split(separator[1])
      let jam = parseInt(split[0])
      let menit = parseInt(split[1])
      var point_jam = (String(jam).length == 1) ? "0" + jam : jam
      var point_menit = (String(menit).length == 1) ? "0" + menit : menit
      var point_query = parseInt(String(point_jam) + String(point_menit))
    }

    var detik = 1000;
    var menit = detik * 60;
    var jam = menit * 60;
    var hari = jam * 24;

    /** pastikan jika menggunakan date atau unix, harus dalam 24 jam */
    if (start_tipe == "date" || start_tipe == "number") {
      if (start_tipe == "date") {
        var date_start = start_time.getDate()
      } else {
        var date_start = new Date(start_time * 1000).getDate()
      }
    }

    if (point_tipe == "date" && point_tipe == "number") {
      if (point_tipe == "date") {
        var date_point = point_time.getDate()
      } else {
        var date_point = new Date(point_time * 1000).getDate()
      }
    }

    if (date_start && date_point) {
      if (date_start !== date_point) throw new Error("⛔️ Unfortunately, only work at same day.")
    }

    /************************************* akhir filter */

    /** jika waktu sama maka tolak saja */
    if (start_query == point_query) throw new Error("🚫 Start and point is a same time.")

    let hasil = undefined;
    let value = undefined;
    let status = undefined;
    start_jam = parseInt(start_jam)
    start_menit = parseInt(start_menit)
    point_jam = parseInt(point_jam)
    point_menit = parseInt(point_menit)

    // return "Start Jam : " + start_jam + "\nStart Menit : " + start_menit + "\nPoint Jam ; " + point_jam + "\nPoint Menit : " + point_menit

    /** jika waktu sekarang lebih cepat dari point */
    if (start_query > point_query) {

      let selisih_menit = (start_menit == 0) ? 60 - point_menit : (point_menit == 0) ? start_menit
        : (point_menit !== 0 && start_menit !== 0 && start_jam !== point_jam) ? (60 - point_menit) + start_menit
          : (point_menit !== 0 && start_menit !== 0 && start_jam == point_jam) ? start_menit - point_menit : (60 - start_menit) + point_menit
      let selisih_jam = (start_jam - point_jam == 0) ? null : (start_jam - point_jam == 1 && !selisih_menit) ? 1
        : (start_jam - point_jam == 1) ? null : start_jam - point_jam

      if (selisih_jam > 1) {

        if (start_menit > point_menit) selisih_menit = start_menit - point_menit

        if (start_menit == point_menit) {
          selisih_jam = start_jam - point_jam
        } else if (start_menit > 0) {
          selisih_jam = (start_jam - point_jam)
        } else {
          selisih_jam = start_jam - point_jam
        }
      }

      /** jika selisih menit lebih dari 60 menit */
      if (selisih_menit > 60) {
        selisih_jam = Math.floor(selisih_menit / 60)
        selisih_menit = selisih_menit % (60 * selisih_jam)
      }

      /** jika selisih menit = 0, maka bulat 1 jam */
      if (selisih_menit == 0 || selisih_menit == 60) {
        hasil = selisih_jam ? selisih_jam + " Jam" : (start_jam - point_jam == 1) ? "1 Jam" : "🚫 Invalid"
      }

      /** jika selisih menit ada nilainya, maka kembalikan nilai tsb */
      if (selisih_menit !== 0 && selisih_menit !== 60) {
        hasil = selisih_jam ? selisih_jam + " Jam " + selisih_menit + " Menit" : selisih_menit + " Menit"
      }

      status = "-"

    }

    /** jika waktu point yang lebih cepat dari waktu sekarang */
    if (point_query > start_query) {

      let selisih_menit = (point_menit == 0) ? 60 - start_menit : (start_menit == 0) ? point_menit
        : (point_menit !== 0 && start_menit !== 0) ? (60 - start_menit) + point_menit : (60 - point_menit) + start_menit

      let selisih_jam = (point_jam - start_jam == 0) ? null : (point_jam - start_jam == 1 && point_menit == 0) ? null
        : (point_jam - start_jam == 1 && point_menit > start_menit) ? 1 : (point_jam - start_jam == 1 && selisih_menit < 61)
          ? null : (point_jam - start_jam == 1) ? 1 : point_jam - start_jam

      if (selisih_jam > 1) {
        if (start_menit == point_menit) {
          selisih_jam = point_jam - start_jam
        } else if (start_menit > 0) {
          selisih_jam = (point_jam - start_jam - 1)
        } else {
          selisih_jam = point_menit - start_jam
        }
      }

      /** jika selisih menit lebih dari 60 menit */
      if (selisih_menit > 60) {
        selisih_jam = Math.floor(selisih_menit / 60)
        selisih_menit = selisih_menit % (60 * selisih_jam)
      }

      /** jika dalam jam yg sama hanya beda menit */
      if (start_jam == point_jam) {
        selisih_menit = point_menit - start_menit
        selisih_jam = null
      }

      /** jika selisih menit = 0, maka bulat 1 jam */
      if (selisih_menit == 0 || selisih_menit == 60) {
        hasil = selisih_jam ? selisih_jam + " Jam" : (point_jam - start_jam == 1) ? "1 Jam" : "🚫 Invalid"
      }

      /** jika selisih menit ada nilainya, maka kembalikan nilai tsb */
      if (selisih_menit !== 0 && selisih_menit !== 60) {
        hasil = selisih_jam ? selisih_jam + " Jam " + selisih_menit + " Menit" : selisih_menit + " Menit"
      }

      status = "+"

    }

    let check_jam = /(\d+) jam/i.exec(hasil)
    let check_menit = /(\d+) menit/i.exec(hasil)

    if (check_jam && check_menit) {
      value = parseInt(check_jam[1]) * 60
      value = value + parseInt(check_menit[1])
    } else if (check_jam) {
      value = parseInt(check_jam[1]) * 60
    } else if (check_menit) {
      value = parseInt(check_menit[1])
    }

    return {
      status: status,
      value: value,
      result: hasil
    };

  }


  // =======================


}

/*
    Bantuan cepat / pragmatis untuk keyboard inline
    turunan dari versi 1/2 (untuk compabilitas)
*/
class Button {
  text(text, data, hide = false) {
    return { text, callback_data: data, hide }
  }
  // inline = alias dari text
  inline(text, data, hide = false) {
    return { text, callback_data: data, hide }
  }
  // akan tersedia v3.7
  queryChat(text, data) {
    return {
      text,
      switch_inline_query_current_chat: data
    }
  }
  query(text, data) {
    return {
      text,
      switch_inline_query: data
    }
  }
  url(text, url, hide = false) {
    return { text, url, hide }
  }
}

var helper = new Helper();
var button = new Button();

/**
 * Pengamanan Asset Helper!
 */

Object.defineProperty(helper, "constructor", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.countdown, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.format, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.createQRCode, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.readQRCode, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.convertSize, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.encrypt, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.decrypt, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.createSetToken, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.nama, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.unix, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.handleError, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.getErrorMessage, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.indent, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.profil, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.textBlob, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.isDuplicate, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.duplicate, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.formatDate, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.number_format, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.shuffle, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.proper, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.forLoop, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.expand, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.pagination, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.terbilang, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.isOdd, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.isEven, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.factor, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.customKeyboard, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.calender, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.progress, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.telegraph, "toString", {
  value: () => { return "🚫 Not allowed!" }
})

Object.defineProperty(helper.time, "toString", {
  value: () => { return "🚫 Not allowed!" }
})
