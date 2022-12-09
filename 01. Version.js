/**
 * 
 * ID SCRIPT :
 *   => https://script.google.com/macros/library/d/1Oa0s3aciWBhsUJmomNhwrAfSEkqpCmr6Nxd7k07MhtTw2N91qwkO_sI5/1
 * 
 * ID LIBRARY :
 *   a. Editor lama / Editor klasik / Legacy
 *   => 'SUDAH TIDAK ADA'
 * 
 *   b. Editor Baru
 *   => 1Oa0s3aciWBhsUJmomNhwrAfSEkqpCmr6Nxd7k07MhtTw2N91qwkO_sI5
 * 
**/

const ID_LIBRARY_LEGACY = 'UN-SUPPORTED'
const ID_LIBRARY_NEW = '1Oa0s3aciWBhsUJmomNhwrAfSEkqpCmr6Nxd7k07MhtTw2N91qwkO_sI5'

/*

GAS Library [RENEW]
----------------
Public Release

GAS Library untuk Telegram

Adalah GAS Library untuk Telegram yang telah dimodifikasi dari Framework Lumpia atau lebih dikenal sebagai Library 3 dan merupakan suksesi dari Telegramlib V.2.X.X

GAS Lib Rewrite ini terinspirasi dari Framework Lumpia (Library 3) yang dirasa cukup praktis
dalam penggunaan sehari-hari dan banyak dilakukan penyesuaian.

Support hanya via komunitas di Grup Telegram @secretgruptbk
contact personal hanya untuk proyek, client, teman / sahabat, atau keluarga

Kanal khusus info release https://t.me/minigramdocs

Telegramlib URL: https://medium.com/@mas.bagusstwn/telegramlib-inisiasi-65db0ae3f2f3
Minigram URL: https://medium.com/@mas.bagusstwn/minigram-ex-telegramlib-inisiasi-7ebb0c9d1a75

Donasi: https://saweria.co/
----------------

Release public pertama kali : 
- 10 Juli 2022 / 10 Dzulhijjah 1443 H
================

*/


/*

  Penamaan

  library name : minigram

  Versi mayor adalah versi 3. 
  Dimana nomor 3 adalah generasi atau edisi ke-3 dari Library GAS untuk Telegram ini.

  Versi minor adalah versi build yang akan bertambah saat ada perubahan struktur inti library.

  Versi deployment adalah jumlah total deployment library.

*/

const dev = false;
const active = 'stable';

const app = {
  stable: {
    name: 'minigram',
    number: 3, //version number
    package: 8, //versi penambahan fitur
    build: 14, //versi deployment update build
    serie: "[UNPUBLISHED]", // ⚠️ UBAH VERSI SEBELUM DEPLOYMENT MENJADI "<PUBLISHED>" setelah itu ganti [UNPUBLISHED]
    id: {
      legacy: ID_LIBRARY_LEGACY,
      new: ID_LIBRARY_NEW
    }
  },
}

var version = {
  original: {
    name: 'lumpia',
    edition: '3rd',
    id_library: {
      new_editor: '1Yo6vQRwjG5Gl9jeEF0g2tBTUa0XN5MyT4G_HeDpRr9DvabxhRcSdhPNj',
      legacy: 'MUD_wfLskZT2D99lRXLh94vvg_do21SJR'
    },
    source: 'https://github.com/telegrambotindonesia/GAS-Lib-v3/',
    documentation: 'https://lumpia.js.org/'
  },
  stats: active,
  number: app[active].number,
  name: app[active].name,
  package: app[active].package, //versi paket fitur
  build: app[active].build, //version build / update / deployment
  full: `Minigram Library for GAS [REWRITE] - Version : v${app[active].number}.${app[active].package}.${app[active].build}${(dev ? '-dev' : '')} - ${app[active].serie}`,
  full_html: `<b> Minigram</b> library for GAS <b> [REWRITE] - Version :</b> <code>v${app[active].number}.${app[active].package}.${app[active].build}${(dev ? '-dev' : '')}</code> - <b>${app[active].serie}</b>`,
  komunitas: {
    playground: '@secretplaygroundtbk',
    channel: '@secretgruptbk'
  },
  minigram_access: {
    bot: '@minigramrobot',
    docs: '@minigramdocs',
    main: '@minigramgroup'
  },
  url: 'https://medium.com/@mas.bagusstwn/minigram-ex-telegramlib-inisiasi-7ebb0c9d1a75',
  apps: app,
  modifier: {
    nama: 'Mas Bagusstwn',
    id: 1566393316,
    username: '@masbagusstwn',
    language_code: 'id'
  }
}

/** show logger log */
var verbose = false;

/** hook all message show json */
var DEBUG = false

/** protect all message with protect content - cannot forward, capture or anything */
var isProtect = false;

/** locked incoming updates from other log_admin */
var isPrivate = false;

/** Akan mendisable otomatis pesan menganduk link url telegram (t.me/link) - default to [true] */
var autoDisable = true;

/** Hanya akan berjalan jika diisi HTML, Markdown atau MarkdownV2 */
var defaultParse = false;

/** mengirimkan template pesan error ketika bot mengalami crash atau bug */
/** isi dengan [true] untuk mengaktifkan alert error default atau isi dengan template mu */
var sendAlert = false;

/** notifikasi untuk mengirimkan pesan error */
var errorNotification = sendAlert ? false : true
