/*
  Class untuk method berhubungan dengan telegram client

    - penambahan method answerCallbackQuery, karena dibuat aliasnya
    - metode konstruktor disederhanakan
*/

class Telegram extends Client {
  constructor(token_key, fetch_counter, adminbot) {
    super();
    this.token = token_key;
    this.fetch_count = fetch_counter;
    this.adminbot = adminbot;
  }

  /**
   * Directly request incoming updates.
   * You should probably use `Telegraf::launch` instead.
   * Referensi : https://core.telegram.org/bots/api#getupdates
   */
  getUpdates(timeout, limit, offset, allowedUpdates) {
    return this.callApi('getUpdates', {
      allowed_updates: allowedUpdates,
      limit,
      offset,
      timeout,
    });
  }
  /**
   * Specify a url to receive incoming updates via an outgoing webhook
   * Referensi : https://core.telegram.org/bots/api#setwebhook
   * @param url HTTPS url to send updates to. Use an empty string to remove webhook integration
   */
  setWebhook(url, extra) {
    if (!url) throw new Error("🚫 No url in those parameter to be set as webhook!")
    // Memastikan user sudah memasang function doPost(e)
    UrlFetchApp.fetch(url + "?library=minigram", { method: 'post' })
    return this.callApi('setWebhook', {
      url,
      ...extra,
    });
  }
  /**
   * Remove webhook integration. Default to false
   * Referensi : https://core.telegram.org/bots/api#deletewebhook
   */
  deleteWebhook(dropPendingUpdates = false) {
    return this.callApi('deleteWebhook', {
      drop_pending_updates: dropPendingUpdates,
    });
  }
  /**
   * Use this method to get current webhook status
   * Referensi : https://core.telegram.org/bots/api#getwebhookinfo
   */
  getWebhookInfo() {
    return this.callApi('getWebhookInfo', {});
  }

  /**
   * Get basic information about the bot
   * Referensi : https://core.telegram.org/bots/api#getme
   */
  getMe() {
    return this.callApi('getMe', {});
  }
  /**
   * Log out from the cloud Bot API server before launching the bot locally
   * Referensi : https://core.telegram.org/bots/api#logout
   */
  logOut() {
    return this.callApi('logOut', {});
  }
  /**
   * Close the bot instance before moving it from one local server to another
   * Referensi : https://core.telegram.org/bots/api#close
   */
  close() {
    return this.callApi('close', {});
  }
  /**
   * Send a text message
   * Referensi : https://core.telegram.org/bots/api#sendmessage
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param text Text of the message to be sent
   */
  sendMessage(chatId, text, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    /**
     * Otomatis mengkonversi object setingkat false seperti
     * [ false, undefined, null, ""]
     * 
     * Konversi text kosong "" untuk agar tetap bisa dikirim.
     */
    if (String(text).length > 0) {
      // Jangan mengedit apapun
    } else {
      if (helper.typeCheck(text) == "array") {
        text = []
      } else if (helper.typeCheck(text) == "object") {
        text = {}
      } else {
        text = "\u2063"
      }
    }

    /** Creating text to send! */
    if (helper.typeCheck(text) == "object") {
      text = JSON.stringify(text)
    } else {
      text = String(text)
    }

    // Jika pesan lebih dari 12289 akan dikirim dalam bentuk document
    // Jika pesan kurang dari 12289 akan dikirim parsial (Maximal : 3 Pesan)
    if (text.length > 12289) {

      try {
        delete extra.parse_mode
        delete extra.entities
      } catch (e) { }
      return this.callApi('sendDocument', { chat_id: chatId, document: helper.textBlob('[400] - Message too long - @minigram', text), ...extra })

    } else if (text.length > 8192 && text.length < 12289) {

      try {
        delete extra.parse_mode
        delete extra.entities
      } catch (e) { }

      try {

        // Jika teks lebih dari 3x pesan maksimal 4096 akan dikirim 3x sendMessage
        let first_attempt = text.substring(0, 4096)
        if (first_attempt.length > 0) this.callApi('sendMessage', { chat_id: chatId, text: first_attempt, ...extra })
        let second_attempt = text.substring(4097, 8192)
        if (second_attempt.length > 0) this.callApi('sendMessage', { chat_id: chatId, text: second_attempt, ...extra })
        let third_attempt = text.substring(8193, 12289)
        if (third_attempt.length > 0) this.callApi('sendMessage', { chat_id: chatId, text: third_attempt, ...extra })

        return;

      } catch (e) { return; }

    } else if (text.length > 4096 && text.length < 8193) {

      try {
        delete extra.parse_mode
        delete extra.entities
      } catch (e) { }

      // Jika teks lebih dari 2x pesan maksimal 4096 akan dikirim 2x sendMessage

      let first_attempt = text.substring(0, 4096)
      let second_attempt = text.substring(4097, 8192)
      this.callApi('sendMessage', { chat_id: chatId, text: first_attempt, ...extra })
      try {
        return this.callApi('sendMessage', { chat_id: chatId, text: second_attempt, ...extra })
      } catch (e) { return; }

    } else {
      // pesan dikirim biasa
    }

    if (extra) {
      if (extra.parse_mode) {
        if (/html/i.exec(extra.parse_mode)) {
          try {
            return this.callApi('sendMessage', { chat_id: chatId, text, ...extra });
          } catch (e) {
            try {
              text = helper.parseHTML(text)
              return this.callApi('sendMessage', { chat_id: chatId, text, ...extra });
            } catch (ee) {
              text = helper.clearParse(text)
              return this.callApi('sendMessage', { chat_id: chatId, text, ...extra });
            }
          }
        }
        if (/markdown/i.exec(extra.parse_mode)) {
          try {
            return this.callApi('sendMessage', { chat_id: chatId, text, ...extra });
          } catch (e) {
            text = helper.clearMarkdown(text)
            return this.callApi('sendMessage', { chat_id: chatId, text, ...extra });
          }
        }
      }
    }

    return this.callApi('sendMessage', { chat_id: chatId, text, ...extra });
  }
  /**
   * Forward existing message.
   * Referensi : https://core.telegram.org/bots/api#forwardmessage
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param fromChatId Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername)
   * @param messageId Message identifier in the chat specified in from_chat_id
   */
  forwardMessage(chatId, fromChatId, messageId, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('forwardMessage', {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...extra,
    });
  }
  /**
   * Send copy of existing message (especially from bot).
   * Referensi : https://core.telegram.org/bots/api#copymessage
   * @deprecated use `copyMessage` instead
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param message Received message object (reply_to_message object accepted)
   */
  sendCopy(chatId, message) {

    if (helper.typeCheck(message) !== "object") throw new Error("🚫 There is no object founded in parameter!")

    if (message.reply_to_message) {
      var msg = message.reply_to_message
    } else {
      var msg = message
    }

    if (msg.from.is_bot) {

      if (msg.text) {
        if (msg.entities) {
          return this.sendMessage(chatId, msg.text, { entities: msg.entities })
        } else {
          return this.sendMessage(chatId, msg.text,)
        }
      }

      let type = getSubType(msg)

      let contain_id = ["photo", "animation", "audio", "document", "video", "video_note", "voice", "sticker"]
      let uncontain = ["contact", "dice", "location", "venue", "game", "poll"]

      // Jika pesan adalah media dan memiliki file_id
      if (helper.isIn(contain_id, type)) {
        let media = (type == "photo") ? message[type][message[type].length - 1].file_id : message[type].file_id
        let caption = msg.caption ?? ""
        let caption_entities = msg.caption_entities ?? ""
        return this["send" + helper.proper(type)](chatId, media, { caption: caption, caption_entities: caption_entities })
      } else {
        let data = msg[type]
        return this["send" + helper.proper(type)](data)
      }

    } else {
      let data = msg[type]
      return this.copyMessage(chatId, msg.chat.id, msg.message_id, data)
    }

  }
  /**
   * Send copy of existing message
   * Referensi : https://core.telegram.org/bots/api#copymessage
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param fromChatId Unique identifier for the chat where the original message was sent (or channel username in the format @channelusername)
   * @param messageId Message identifier in the chat specified in from_chat_id
   */
  copyMessage(chatId, fromChatId, messageId, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('copyMessage', {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId,
      ...extra,
    });
  }
  /**
   * Use this method to send photos
   * Referensi : https://core.telegram.org/bots/api#sendphoto
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendPhoto(chatId, photo, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendPhoto', { chat_id: chatId, photo, ...extra });
  }
  /**
   * Send audio files, if you want Telegram clients to display them in the music player.
   * Your audio must be in the .mp3 format.
   * Referensi : https://core.telegram.org/bots/api#sendaudio
   * Bots can currently send audio files of up to 50 MB in size, this limit may be changed in the future.
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendAudio(chatId, audio, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendAudio', { chat_id: chatId, audio, ...extra });
  }
  /**
   * Send general files. Bots can currently send files of any type of up to 50 MB in size, this limit may be changed in the future.
   * Referensi : https://core.telegram.org/bots/api#senddocument
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendDocument(chatId, document, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendDocument', { chat_id: chatId, document, ...extra });
  }
  /**
   * Send video files, Telegram clients support mp4 videos (other formats may be sent as Document)
   * Bots can currently send video files of up to 50 MB in size, this limit may be changed in the future.
   * Referensi : https://core.telegram.org/bots/api#sendvideo
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendVideo(chatId, video, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendVideo', { chat_id: chatId, video, ...extra });
  }
  /**
   * Send .gif animations
   * Referensi : https://core.telegram.org/bots/api#sendanimation
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendAnimation(chatId, animation, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendAnimation', {
      chat_id: chatId,
      animation,
      ...extra,
    });
  }
  /**
   * Send audio files, if you want Telegram clients to display the file as a playable voice message. 
   * For this to work, your audio must be in an .ogg file encoded with OPUS (other formats may be sent as Audio or Document).
   * On success, the sent Message is returned. 
   * Bots can currently send voice messages of up to 50 MB in size, this limit may be changed in the future.
   * Referensi : https://core.telegram.org/bots/api#sendvoice
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendVoice(chatId, voice, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendVoice', { chat_id: chatId, voice, ...extra });
  }
  /**
   * Send square MPEG4 videos of up to 1 minute long
   * Referensi : https://core.telegram.org/bots/api#sendvideonote
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendVideoNote(chatId, videoNote, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendVideoNote', {
      chat_id: chatId,
      video_note: videoNote,
      ...extra,
    });
  }
  /**
   * Send a group of photos , videos , documents , animations or audios as an album
   * Referensi : https://core.telegram.org/bots/api#sendmediagroup
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param media A JSON-serialized array describing photos and videos to be sent, must include 2–10 items
   */
  sendMediaGroup(chatId, media, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendMediaGroup', { chat_id: chatId, media, ...extra });
  }
  /**
   * Send point on the map
   * Referensi : https://core.telegram.org/bots/api#sendlocation
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendLocation(chatId, latitude, longitude, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendLocation', {
      chat_id: chatId,
      latitude,
      longitude,
      ...extra,
    });
  }
  /**
   * Use this method to edit live location messages
   * Referensi : https://core.telegram.org/bots/api#editmessagelivelocation
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Identifier of the message to edit
   * @param inlineMessageId Identifier of the inline message
   * @param latitude Latitude of new location
   * @param longitude Longitude of new location
   */
  editMessageLiveLocation(chatId, messageId, inlineMessageId, latitude, longitude, extra) {
    return this.callApi('editMessageLiveLocation', {
      latitude,
      longitude,
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      ...extra,
    });
  }
  /**
   * Use this method to edit live location messages
   * Referensi : https://core.telegram.org/bots/api#stopmessagelivelocation
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Identifier of the message to edit
   * @param inlineMessageId Identifier of the inline message
   * @param markup A JSON-serialized object for a new inline keyboard
   */
  stopMessageLiveLocation(chatId, messageId, inlineMessageId, markup) {
    return this.callApi('stopMessageLiveLocation', {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      reply_markup: markup,
    });
  }
  /**
   * Use this method to edit live location messages
   * Referensi : https://core.telegram.org/bots/api#sendvenue
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param latitude 
   * @param longitude 
   * @param title
   */
  sendVenue(chatId, latitude, longitude, title, address, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendVenue', {
      latitude,
      longitude,
      title,
      address,
      chat_id: chatId,
      ...extra,
    });
  }
  /**
   * Use this method to edit live location messages
   * Referensi : https://core.telegram.org/bots/api#sendcontact
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param phoneNumber 
   * @param firstName 
   */
  sendContact(chatId, phoneNumber, firstName, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendContact', {
      chat_id: chatId,
      phone_number: phoneNumber,
      first_name: firstName,
      ...extra,
    });
  }
  /**
   * Send a native poll.
   * Referensi : https://core.telegram.org/bots/api#sendpoll
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param question Poll question, 1-255 characters
   * @param options A JSON-serialized list of answer options, 2-10 strings 1-100 characters each
   */
  sendPoll(chatId, question, options, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendPoll', {
      chat_id: chatId,
      type: 'regular',
      question,
      options,
      ...extra,
    });
  }
  /**
   * Send a native quiz.
   * Referensi : https://core.telegram.org/bots/api#sendpoll
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param question Poll question, 1-255 characters
   * @param options A JSON-serialized list of answer options, 2-10 strings 1-100 characters each
   */
  sendQuiz(chatId, question, options, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendPoll', {
      chat_id: chatId,
      type: 'quiz',
      question,
      options,
      ...extra,
    });
  }
  /**
   * Send a dice, which will have a random value
   * Referensi : https://core.telegram.org/bots/api#senddice
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendDice(chatId, emoji, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendDice', { chat_id: chatId, emoji, ...extra });
  }
  /**
   * Use this method when you need to tell the user that something is happening on the bot's side.
   * The status is set for 5 seconds or less (when a message arrives from your bot, Telegram clients clear its typing status).
   * Referensi : https://core.telegram.org/bots/api#sendchataction
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendChatAction(chatId, action) {
    return this.callApi('sendChatAction', { chat_id: chatId, action });
  }
  /**
   * Use this method to get a list of profile pictures for a user
   * Referensi : https://core.telegram.org/bots/api#getuserprofilephotos
   * @param userId Unique identifier of the target user
   * @param offset Sequential number of the first photo to be returned. By default, all photos are returned
   * @param limit Limits the number of photos to be retrieved. Values between 1-100 are accepted. Defaults to 100.
   */
  getUserProfilePhotos(userId, offset, limit) {
    return this.callApi('getUserProfilePhotos', {
      user_id: userId,
      offset,
      limit,
    });
  }
  /**
   * Get basic info about a file and prepare it for downloading
   * Referensi : https://core.telegram.org/bots/api#getfile
   * @param fileId Id of file to get link to
   */
  getFile(fileId) {
    return this.callApi('getFile', { file_id: fileId });
  }
  /**
   * Get download link to a file
   * Referensi : https://core.telegram.org/bots/api#getfile
   * @param fileId Id of file to get link to
   * @param blob Pass true if return will be blob type. Default to false
   */
  getFileLink(fileId, blob = false) {

    // Return fake photo (blank white)
    if (!fileId) {
      if (blob) {
        // Blank white photo
        const fake_img = "https://telegra.ph/file/fa3174ca819eee2058477.jpg";
        return UrlFetchApp.fetch(fake_img).getBlob()
      } else {
        return fake_img;
      }
    } else {
      let file = this.callApi('getFile', { file_id: fileId })
      if (blob) {
        return UrlFetchApp.fetch(`https://api.telegram.org/file/bot${tokens[pos_token]}/${file.result.file_path}`).getBlob()
      } else {
        return `https://api.telegram.org/file/bot${tokens[pos_token]}/${file.result.file_path}`
      }
    }
  }
  /**
   * Kick a user from a group, a supergroup or a channel. 
   * In the case of supergroups and channels, the user will not be able to return to the group on their own using invite links, etc., unless unbanned first. 
   * The bot must be an administrator in the chat for this to work and must have the appropriate admin rights
   * Referensi : https://core.telegram.org/bots/api#banchatmember
   * @param chatId Unique identifier for the target group or username of the target supergroup or channel (in the format `@channelusername`)
   * @param untilDate Date when the user will be unbanned, unix time. If user is banned for more than 366 days or less than 30 seconds from the current time they are considered to be banned forever
   */
  kickChatMember(chatId, userId, untilDate, extra) {
    return this.callApi('kickChatMember', {
      chat_id: chatId,
      user_id: userId,
      until_date: untilDate,
      ...extra,
    });
  }
  banChatMember(chatId, userId, untilDate, extra) {
    return this.callApi('banChatMember', {
      chat_id: chatId,
      user_id: userId,
      until_date: untilDate,
      ...extra,
    });
  }
  /**
   * Unban a user from a supergroup or a channel. 
   * The bot must be an administrator in the chat for this to work and must have the appropriate admin rights
   * Referensi : https://core.telegram.org/bots/api#unbanchatmember
   * @param chatId Unique identifier for the target group or username of the target supergroup or channel (in the format @username)
   * @param userId Unique identifier of the target user
   */
  unbanChatMember(chatId, userId, extra) {
    return this.callApi('unbanChatMember', {
      chat_id: chatId,
      user_id: userId,
      ...extra,
    });
  }
  /**
   * Restrict a user in a supergroup. 
   * The bot must be an administrator in the supergroup for this to work and must have the appropriate admin rights. 
   * Pass True for all boolean parameters to lift restrictions from a user.
   * Referensi : https://core.telegram.org/bots/api#restrictchatmember
   * @param chatId Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)
   */
  restrictChatMember(chatId, userId, extra) {
    return this.callApi('restrictChatMember', {
      chat_id: chatId,
      user_id: userId,
      ...extra,
    });
  }
  /**
   * Promote or demote a user in a supergroup or a channel. 
   * The bot must be an administrator in the chat for this to work and must have the appropriate admin rights. 
   * Pass False for all boolean parameters to demote a user.
   * Referensi : https://core.telegram.org/bots/api#promotechatmember
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
   */
  promoteChatMember(chatId, userId, extra) {
    return this.callApi('promoteChatMember', {
      chat_id: chatId,
      user_id: userId,
      ...extra,
    });
  }
  /**
   * Use this method to set a custom title for an administrator in a supergroup promoted by the bot
   * Referensi : https://core.telegram.org/bots/api#setchatadministratorcustomtitle
   * @param chatId Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)
   * @param userId Unique identifier of the target user
   * @param title New custom title for the administrator; 0-16 characters, emoji are not allowed
   */
  setChatAdministratorCustomTitle(chatId, userId, title) {
    return this.callApi('setChatAdministratorCustomTitle', {
      chat_id: chatId,
      user_id: userId,
      custom_title: title,
    });
  }
  /**
   * Use this method to set default chat permissions for all members
   * Referensi : https://core.telegram.org/bots/api#setchatpermissions
   * @param chatId
   * @param permissions
   */
  setChatPermissions(chatId, permissions) {
    return this.callApi('setChatPermissions', { chat_id: chatId, permissions });
  }
  /**
   * Export an invite link to a supergroup or a channel. 
   * The bot must be an administrator in the chat for this to work and must have the appropriate admin rights.
   * Referensi : https://core.telegram.org/bots/api#exportchatinvitelink
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  exportChatInviteLink(chatId) {
    return this.callApi('exportChatInviteLink', { chat_id: chatId });
  }
  /**
   * Use this method to create an additional invite link for a chat
   * Referensi : https://core.telegram.org/bots/api#createchatinvitelink
   * @param chatId
   */
  createChatInviteLink(chatId, extra) {
    return this.callApi('createChatInviteLink', {
      chat_id: chatId,
      ...extra,
    });
  }
  /**
   * Use this method to edit a non-primary invite link created by the bot
   * Referensi : https://core.telegram.org/bots/api#editchatinvitelink
   * @param chatId
   * @param inviteLink
   */
  editChatInviteLink(chatId, inviteLink, extra) {
    return this.callApi('editChatInviteLink', {
      chat_id: chatId,
      invite_link: inviteLink,
      ...extra,
    });
  }
  /**
   * Use this method to revoke an invite link created by the bot
   * Referensi : https://core.telegram.org/bots/api#revokechatinvitelink
   * @param chatId
   * @param inviteLink
   */
  revokeChatInviteLink(chatId, inviteLink) {
    return this.callApi('revokeChatInviteLink', {
      chat_id: chatId,
      invite_link: inviteLink,
    });
  }
  /**
   * Use this method to set a new profile photo for the chat
   * Referensi : https://core.telegram.org/bots/api#setchatphoto
   * @param chatId
   * @param photo
   */
  setChatPhoto(chatId, photo) {
    return this.callApi('setChatPhoto', { chat_id: chatId, photo });
  }
  /**
   * Use this method to delete a chat photo
   * Referensi : https://core.telegram.org/bots/api#deletechatphoto
   * @param chatId
   */
  deleteChatPhoto(chatId) {
    return this.callApi('deleteChatPhoto', { chat_id: chatId });
  }
  /**
   * Change the title of a chat. Titles can't be changed for private chats. 
   * The bot must be an administrator in the chat for this to work and must have the appropriate admin rights
   * Referensi : https://core.telegram.org/bots/api#setchattitle
   * @param chatId Unique identifier for the target group or username of the target supergroup or channel (in the format `@channelusername`)
   * @param title New chat title, 1-255 characters
   */
  setChatTitle(chatId, title) {
    return this.callApi('setChatTitle', { chat_id: chatId, title });
  }
  /**
   * Use this method to change the description of a group, a supergroup or a channel
   * Referensi : https://core.telegram.org/bots/api#setchatdescription
   * @param chatId
   * @param description
   */
  setChatDescription(chatId, description) {
    return this.callApi('setChatDescription', { chat_id: chatId, description });
  }
  /**
   * Pin a message in a group, a supergroup, or a channel. 
   * The bot must be an administrator in the chat for this to work and must have the 'can_pin_messages' admin right in the supergroup or 'can_edit_messages' admin right in the channel.
   * Referensi : https://core.telegram.org/bots/api#pinchatmessage
   * @param chatId Unique identifier for the target chat or username of the target supergroup (in the format @supergroupusername)
   */
  pinChatMessage(chatId, messageId, extra) {
    return this.callApi('pinChatMessage', {
      chat_id: chatId,
      message_id: messageId,
      ...extra,
    });
  }
  /**
   * Unpin a message in a group, a supergroup, or a channel. 
   * The bot must be an administrator in the chat for this to work and must have the 'can_pin_messages' admin right in the supergroup or 'can_edit_messages' admin right in the channel.
   * Referensi : https://core.telegram.org/bots/api#unpinchatmessage
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  unpinChatMessage(chatId, messageId) {
    return this.callApi('unpinChatMessage', {
      chat_id: chatId,
      message_id: messageId,
    });
  }
  /**
   * Clear the list of pinned messages in a chat
   * Referensi : https://core.telegram.org/bots/api#unpinallchatmessages
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  unpinAllChatMessages(chatId) {
    return this.callApi('unpinAllChatMessages', { chat_id: chatId });
  }
  /**
   * Use this method for your bot to leave a group, supergroup or channel
   * Referensi : https://core.telegram.org/bots/api#leavechat
   * @param chatId Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)
   */
  leaveChat(chatId) {
    return this.callApi('leaveChat', { chat_id: chatId });
  }
  /**
   * Get up to date information about the chat (current name of the user for one-on-one conversations, current username of a user, group or channel, etc.)
   * Referensi : https://core.telegram.org/bots/api#getchat
   * @param chatId Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)
   */
  getChat(chatId) {
    return this.callApi('getChat', { chat_id: chatId });
  }
  /**
   * Use this method to get a list of administrators in a chat, which aren't bots
   * Referensi : https://core.telegram.org/bots/api#getchatadministrators
   * @param chatId Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)
   */
  getChatAdministrators(chatId) {
    return this.callApi('getChatAdministrators', { chat_id: chatId });
  }
  /**
   * Get the number of members in a chat
   * Referensi : https://core.telegram.org/bots/api#getchatmembercount
   * @param chatId Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)
   */
  getChatMembersCount(chatId) {
    return this.callApi('getChatMembersCount', { chat_id: chatId });
  }
  getChatMemberCount(chatId) {
    return this.callApi('getChatMembersCount', { chat_id: chatId });
  }
  /**
   * Get information about a member of a chat.
   * Referensi : https://core.telegram.org/bots/api#getchatmember
   * @param chatId Unique identifier for the target chat or username of the target supergroup or channel (in the format @channelusername)
   * @param userId Unique identifier of the target user
   */
  getChatMember(chatId, userId) {
    return this.callApi('getChatMember', { chat_id: chatId, user_id: userId });
  }
  /**
   * Use this method to set a new group sticker set for a supergroup
   * Referensi : https://core.telegram.org/bots/api#setchatstickerset
   * @param chatId
   * @param setName
   */
  setChatStickerSet(chatId, setName) {
    return this.callApi('setChatStickerSet', {
      chat_id: chatId,
      sticker_set_name: setName,
    });
  }
  /**
   * Use this method to delete a group sticker set from a supergroup
   * Referensi : https://core.telegram.org/bots/api#deletechatstickerset
   * @param chatId
   */
  deleteChatStickerSet(chatId) {
    return this.callApi('deleteChatStickerSet', { chat_id: chatId });
  }
  /**
   * Use this method to send answers to callback queries sent from inline keyboards
   * Referensi : https://core.telegram.org/bots/api#answercallbackquery
   * @param callbackQueryid
   * @param text
   * @param show_alert
   */
  answerCbQuery(callbackQueryId, text, show_alert = false, extra) {
    if (helper.typeCheck(show_alert) == "object") {
      return this.callApi('answerCallbackQuery', {
        text,
        callback_query_id: callbackQueryId,
        ...show_alert,
      });
    } else if (helper.typeCheck(show_alert) == "boolean") {
      return this.callApi('answerCallbackQuery', {
        text,
        callback_query_id: callbackQueryId,
        show_alert,
        ...extra,
      });
    } else {
      let args = extra ?? show_alert
      return this.callApi('answerCallbackQuery', {
        text,
        callback_query_id: callbackQueryId,
        ...args
      });
    }
  }
  answerCallbackQuery(...args) {
    return this.answerCbQuery(...args);
  }
  answerGameQuery(callbackQueryId, url) {
    return this.callApi('answerCallbackQuery', {
      url,
      callback_query_id: callbackQueryId,
    });
  }
  /**
   * Change the list of the bot's commands.
   * Referensi : https://core.telegram.org/bots/api#setmycommands
   * @param commands A list of bot commands to be set as the list of the bot's commands. At most 100 commands can be specified.
   * @param scope A JSON-serialized object, describing scope of users for which the commands are relevant
   */
  setMyCommands(commands, scope, extra) {
    return this.callApi('setMyCommands', { commands, scope, ...extra });
  }
  /**
   * Use this method to delete the list of the bot's commands for the given scope and user language
   * Referensi : https://core.telegram.org/bots/api#deletemycommands
   * @param scope A JSON-serialized object, describing scope of users for which the commands are relevant
   */
  deleteMyCommands(scope, extra = {}) {
    return this.callApi('deleteMyCommands', { scope, ...extra });
  }
  /**
   * Get the current list of the bot's commands.
   * Referensi : https://core.telegram.org/bots/api#getmycommands
   */
  getMyCommands(scope, extra = {}) {
    return this.callApi('getMyCommands', { scope, ...extra });
  }
  /**
   * Edit text and game messages sent by the bot or via the bot (for inline bots).
   * On success, if edited message is sent by the bot, the edited Message is returned, otherwise True is returned.
   * Referensi : https://core.telegram.org/bots/api#editmessagetext
   * @param chatId Required if inlineMessageId is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Required if inlineMessageId is not specified. Identifier of the sent message
   * @param inlineMessageId Required if chatId and messageId are not specified. Identifier of the inline message
   * @param text New text of the message
   */
  editMessageText(chatId, messageId, inlineMessageId, text, extra) {

    if (extra) {
      if (extra.parse_mode) {
        if (/html/i.exec(extra.parse_mode)) {
          try {
            return this.callApi('editMessageText', {
              text, chat_id: chatId, message_id: messageId, inline_message_id: inlineMessageId, ...extra,
            });
          } catch (e) {
            try {
              text = helper.parseHTML(text)
              return this.callApi('editMessageText', {
                text, chat_id: chatId, message_id: messageId, inline_message_id: inlineMessageId, ...extra,
              });
            } catch (ee) {
              text = helper.clearParse(text)
              return this.callApi('editMessageText', {
                text, chat_id: chatId, message_id: messageId, inline_message_id: inlineMessageId, ...extra,
              });
            }
          }
        }
        if (/markdown/i.exec(extra.parse_mode)) {
          try {
            return this.callApi('editMessageText', {
              text, chat_id: chatId, message_id: messageId, inline_message_id: inlineMessageId, ...extra,
            });
          } catch (e) {
            text = helper.clearMarkdown(text)
            return this.callApi('editMessageText', {
              text, chat_id: chatId, message_id: messageId, inline_message_id: inlineMessageId, ...extra,
            });
          }
        }
      }
    }

    return this.callApi('editMessageText', {
      text,
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      ...extra,
    });
  }
  /**
   * Edit captions of messages sent by the bot or via the bot (for inline bots).
   * On success, if edited message is sent by the bot, the edited Message is returned, otherwise True is returned.
   * Referensi : https://core.telegram.org/bots/api#editmessagecaption
   * @param chatId Required if inlineMessageId is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Required if inlineMessageId is not specified. Identifier of the sent message
   * @param inlineMessageId Required if chatId and messageId are not specified. Identifier of the inline message
   * @param caption New caption of the message
   * @param markup A JSON-serialized object for an inline keyboard.
   */
  editMessageCaption(chatId, messageId, inlineMessageId, caption, extra) {
    return this.callApi('editMessageCaption', {
      caption,
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      ...extra,
    });
  }
  /**
   * Edit animation, audio, document, photo, or video messages.
   * If a message is a part of a message album, then it can be edited only to a photo or a video.
   * Otherwise, message type can be changed arbitrarily.
   * When inline message is edited, new file can't be uploaded.
   * Use previously uploaded file via its file_id or specify a URL.
   * Referensi : https://core.telegram.org/bots/api#editmessagemedia
   * @param chatId Required if inlineMessageId is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Required if inlineMessageId is not specified. Identifier of the sent message
   * @param inlineMessageId Required if chatId and messageId are not specified. Identifier of the inline message
   * @param media New media of message
   * @param markup Markup of inline keyboard
   */
  editMessageMedia(chatId, messageId, inlineMessageId, media, extra) {
    return this.callApi('editMessageMedia', {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      media,
      ...extra,
    });
  }
  /**
   * Edit only the reply markup of messages sent by the bot or via the bot (for inline bots).
   * Referensi : https://core.telegram.org/bots/api#editmessagereplymarkup
   * @param chatId Required if inlineMessageId is not specified. Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Required if inlineMessageId is not specified. Identifier of the sent message
   * @param inlineMessageId Required if chatId and messageId are not specified. Identifier of the inline message
   * @param markup A JSON-serialized object for an inline keyboard.
   * @returns If edited message is sent by the bot, the edited Message is returned, otherwise True is returned.
   */
  editMessageReplyMarkup(chatId, messageId, inlineMessageId, markup) {
    return this.callApi('editMessageReplyMarkup', {
      chat_id: chatId,
      message_id: messageId,
      inline_message_id: inlineMessageId,
      reply_markup: markup,
    });
  }
  /**
   * Use this method to stop a poll which was sent by the bot
   * Referensi : https://core.telegram.org/bots/api#stoppoll
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   * @param messageId Identifier of the original message with the poll
   */
  stopPoll(chatId, messageId, extra) {
    return this.callApi('stopPoll', {
      chat_id: chatId,
      message_id: messageId,
      ...extra,
    });
  }
  /**
   * Delete a message, including service messages, with the following limitations:
   * - A message can only be deleted if it was sent less than 48 hours ago.
   * - Bots can delete outgoing messages in groups and supergroups.
   * - Bots granted can_post_messages permissions can delete outgoing messages in channels.
   * - If the bot is an administrator of a group, it can delete any message there.
   * - If the bot has can_delete_messages permission in a supergroup or a channel, it can delete any message there.
   * Referensi : https://core.telegram.org/bots/api#deletemessage
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  deleteMessage(chatId, messageId) {

    try {
      return this.callApi('deleteMessage', {
        chat_id: chatId,
        message_id: messageId,
      });
    } catch (e) {
      return {
        ok: false,
        result: "[400] - message can't be deleted or not found."
      }
    }

  }
  /**
   * Send .webp stickers
   * Referensi : https://core.telegram.org/bots/api#sendsticker
   * @param chatId Unique identifier for the target chat or username of the target channel (in the format @channelusername)
   */
  sendSticker(chatId, sticker, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add ?? { message_thread_id: thread_id }
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendSticker', { chat_id: chatId, sticker, ...extra });
  }
  /**
   * Use this method to get a sticker set
   * Referensi : https://core.telegram.org/bots/api#getstickerset
   * @param name Name of the sticker set
   */
  getStickerSet(name) {
    return this.callApi('getStickerSet', { name });
  }
  /**
   * Upload a .png file with a sticker for later use in createNewStickerSet and addStickerToSet methods (can be used multiple times)
   * Referensi : https://core.telegram.org/bots/api#uploadstickerfile
   * @param ownerId User identifier of sticker file owner
   * @param stickerFile Png image with the sticker, must be up to 512 kilobytes in size, dimensions must not exceed 512px, and either width or height must be exactly 512px.
   */
  uploadStickerFile(ownerId, stickerFile) {
    return this.callApi('uploadStickerFile', {
      user_id: ownerId,
      png_sticker: stickerFile,
    });
  }
  /**
   * Create new sticker set owned by a user. The bot will be able to edit the created sticker set
   * Referensi : https://core.telegram.org/bots/api#createnewstickerset
   * @param ownerId User identifier of created sticker set owner
   * @param name Short name of sticker set, to be used in t.me/addstickers/ URLs (e.g., animals). Can contain only english letters, digits and underscores. Must begin with a letter, can't contain consecutive underscores and must end in “_by_<bot username>”. <bot_username> is case insensitive. 1-64 characters.
   * @param title Sticker set title, 1-64 characters
   */
  createNewStickerSet(ownerId, name, title, stickerData) {
    return this.callApi('createNewStickerSet', {
      name,
      title,
      user_id: ownerId,
      ...stickerData,
    });
  }
  /**
   * Add a new sticker to a set created by the bot
   * Referensi : https://core.telegram.org/bots/api#addstickertoset
   * @param ownerId User identifier of sticker set owner
   * @param name Sticker set name
   */
  addStickerToSet(ownerId, name, stickerData) {
    return this.callApi('addStickerToSet', {
      name,
      user_id: ownerId,
      ...stickerData,
    });
  }
  /**
   * Move a sticker in a set created by the bot to a specific position
   * Referensi : https://core.telegram.org/bots/api#setstickerpositioninset
   * @param sticker File identifier of the sticker
   * @param position New sticker position in the set, zero-based
   */
  setStickerPositionInSet(sticker, position) {
    return this.callApi('setStickerPositionInSet', {
      sticker,
      position,
    });
  }
  /**
   * Delete a sticker from a set created by the bot.
   * Referensi : https://core.telegram.org/bots/api#deletestickerfromset
   * @param sticker File identifier of the sticker
   */
  deleteStickerFromSet(sticker) {
    return this.callApi('deleteStickerFromSet', { sticker });
  }
  /**
   * Use this method to set the thumbnail of a sticker set
   * Referensi : https://core.telegram.org/bots/api#setstickersetthumb
   * @param name
   * @param userId
   * @param thumb
   */
  setStickerSetThumb(name, userId, thumb) {
    return this.callApi('setStickerSetThumb', { name, user_id: userId, thumb });
  }
  /**
   * Send answers to an inline query.
   * No more than 50 results per query are allowed.
   * Referensi : https://core.telegram.org/bots/api#answerinlinequery
   * @param inlineQueryId Unique identifier for the answered query
   * @param results Array of InlineQueryResults A JSON-serialized array of results for the inline query
   */
  answerInlineQuery(inlineQueryId, results, extra) {
    return this.callApi('answerInlineQuery', {
      inline_query_id: inlineQueryId,
      results,
      ...extra,
    });
  }
  /**
   * Use this method to send invoices
   * Referensi : https://core.telegram.org/bots/api#sendinvoice
   * @param chatId Unique identifier for the target private chat
   */
  sendInvoice(chatId, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendInvoice', {
      chat_id: chatId,
      ...extra,
    });
  }
  /**
   * Use this method to create a link for an invoice
   * Referensi : https://core.telegram.org/bots/api#createinvoicelink
   * @param
   */
  createInvoiceLink(title, description, payload, provider_token, currency, prices, extra) {
    return this.callApi('createInvoiceLink', {
      title,
      description,
      payload,
      provider_token,
      currency,
      prices,
      ...extra
    })
  }
  /**
   * If you sent an invoice requesting a shipping address and the parameter is_flexible was specified,
   * the Bot API will send an Update with a shipping_query field to the bot.
   * Reply to shipping queries.
   * Referensi : https://core.telegram.org/bots/api#answershippingquery
   * @param ok  Specify True if delivery to the specified address is possible and False if there are any problems (for example, if delivery to the specified address is not possible)
   * @param shippingOptions Required if ok is True. A JSON-serialized array of available shipping options.
   * @param errorMessage Required if ok is False. Error message in human readable form that explains why it is impossible to complete the order (e.g. "Sorry, delivery to your desired address is unavailable'). Telegram will display this message to the user.
   */
  answerShippingQuery(shippingQueryId, ok, shippingOptions, errorMessage) {
    return this.callApi('answerShippingQuery', {
      ok,
      shipping_query_id: shippingQueryId,
      shipping_options: shippingOptions,
      error_message: errorMessage,
    });
  }
  /**
   * Once the user has confirmed their payment and shipping details, the Bot API sends the final confirmation in the form of an Update with the field pre_checkout_query.
   * Respond to such pre-checkout queries. On success, True is returned.
   * Note: The Bot API must receive an answer within 10 seconds after the pre-checkout query was sent.
   * Referensi : https://core.telegram.org/bots/api#answerprecheckoutquery
   * @param ok  Specify True if everything is alright (goods are available, etc.) and the bot is ready to proceed with the order. Use False if there are any problems.
   * @param errorMessage Required if ok is False. Error message in human readable form that explains the reason for failure to proceed with the checkout (e.g. "Sorry, somebody just bought the last of our amazing black T-shirts while you were busy filling out your payment details. Please choose a different color or garment!"). Telegram will display this message to the user.
   */
  answerPreCheckoutQuery(preCheckoutQueryId, ok, errorMessage) {
    return this.callApi('answerPreCheckoutQuery', {
      ok,
      pre_checkout_query_id: preCheckoutQueryId,
      error_message: errorMessage,
    });
  }
  /**
   * Informs a user that some of the Telegram Passport elements they provided contains errors
   * Referensi : https://core.telegram.org/bots/api#setpassportdataerrors
   * @param userId
   * @param errors
   */
  setPassportDataErrors(userId, errors) {
    return this.callApi('setPassportDataErrors', {
      user_id: userId,
      errors: errors,
    });
  }
  /**
   * Use this method a send a game
   * Referensi : https://core.telegram.org/bots/api#sendgame
   * @param chatId Unique identifier for the target chat
   * @param gameShortName Short name of the game, serves as the unique identifier for the game. Set up your games via Botfather.
   */
  sendGame(chatId, gameName, extra, add) {

    /** support threadid */
    if (/^\d+$/i.exec(extra)) {
      var thread_id = extra
      var extra = add
      extra.message_thread_id = thread_id
    }

    return this.callApi('sendGame', {
      chat_id: chatId,
      game_short_name: gameName,
      ...extra,
    });
  }
  /**
   * Use this method to set the score of the specified user in a game message
   * Referensi : https://core.telegram.org/bots/api#setgamescore
   * @param userId
   * @param score
   * @param chatId
   * @param messageId
   * @param editMessage
   * @param force
   */
  setGameScore(userId, score, inlineMessageId, chatId, messageId, editMessage = true, force = false) {
    return this.callApi('setGameScore', {
      force,
      score,
      user_id: userId,
      inline_message_id: inlineMessageId,
      chat_id: chatId,
      message_id: messageId,
      disable_edit_message: !editMessage,
    });
  }
  /**
   * Use this method to get data for high score tables
   * Referensi : https://core.telegram.org/bots/api#getgamehighscores
   * @param userId
   * @param inlineMessageId
   * @param chatId
   * @param messageId
   */
  getGameHighScores(userId, inlineMessageId, chatId, messageId) {
    return this.callApi('getGameHighScores', {
      user_id: userId,
      inline_message_id: inlineMessageId,
      chat_id: chatId,
      message_id: messageId,
    });
  }

  /** Bot API 5.4 */

  /**
   * 
   * Use this method to approve a chat join request. 
   * The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right.
   * Returns True on success.
   * Referensi : https://core.telegram.org/bots/api#approvechatjoinrequest
   * @param chatId
   * @param userId
   */
  approveChatJoinRequest(chatId, userId) {
    return this.callApi('approveChatJoinRequest', {
      chat_id: chatId,
      user_id: userId
    });
  }
  /**
   * 
   * Use this method to decline a chat join request. 
   * The bot must be an administrator in the chat for this to work and must have the can_invite_users administrator right. 
   * Returns True on success.
   * Referensi : https://core.telegram.org/bots/api#declinechatjoinrequest
   * @param chatId
   * @param userId
   */
  declineChatJoinRequest(chatId, userId) {
    return this.callApi('declineChatJoinRequest', {
      chat_id: chatId,
      user_id: userId
    });
  }
  /**
   * Use this method to ban a channel chat in a supergroup or a channel. 
   * Until the chat is unbanned, the owner of the banned chat won't be able to send messages on behalf of any of their channels. 
   * The bot must be an administrator in the supergroup or channel for this to work and must have the appropriate administrator rights. 
   * Referensi : https://core.telegram.org/bots/api#banchatsenderchat
   * Returns True on success.
   * @param chatId
   * @param senderChatId
   */
  banChatSenderChat(chatId, senderChatId) {
    return this.callApi('banChatSenderChat', {
      chat_id: chatId,
      sender_chat_id: senderChatId
    });
  }
  /**
   * Use this method to unban a previously banned channel chat in a supergroup or channel. 
   * The bot must be an administrator for this to work and must have the appropriate administrator rights. 
   * Returns True on success.
   * Referensi : https://core.telegram.org/bots/api#unbanchatsenderchat
   * @param chatId
   * @param senderChatId
   */
  unbanChatSenderChat(chatId, senderChatId) {
    return this.callApi('unbanChatSenderChat', {
      chat_id: chatId,
      sender_chat_id: senderChatId
    });
  }

  /** BOT API 6.0 */

  /**
   * Use this method to change the bot's menu button in a private chat, or the default menu button
   * Referensi : https://core.telegram.org/bots/api#setchatmenubutton
   * @param chatId
   * @param menuButton A JSON-serialized object for the bot's new menu button
   */
  setChatMenuButton(chatId, menuButton) {
    return this.callApi('setChatMenuButton', {
      chat_id: chatId,
      menu_button: menuButton
    })
  }
  /**
   * Use this method to get the current value of the bot's menu button in a private chat, or the default menu button
   * Referensi : https://core.telegram.org/bots/api#getchatmenubutton
   * @param chatId
   */
  getChatMenuButton(chatId) {
    return this.callApi('getChatMenuButton', {
      chat_id: chatId
    })
  }
  /**
   * Use this method to change the default administrator rights requested by the bot when it's added as an administrator to groups or channels
   * Referensi : https://core.telegram.org/bots/api#setmydefaultadministratorrights
   * @param rights
   * @param for_channels Pass True to change the default administrator rights of the bot in channels
   */
  setMyDefaultAdministratorRights(rights, for_channels) {
    return this.callApi("setMyDefaultAdministratorRights", {
      rights,
      for_channels
    })
  }
  /**
   * Use this method to get the current default administrator rights of the bot
   * Referensi : https://core.telegram.org/bots/api#getmydefaultadministratorrights
   * @param for_channels
   */
  getMyDefaultAdministratorRights(for_channels) {
    return this.callApi('getMyDefaultAdministratorRights', { for_channels })
  }

  /** BOT API 6.2 */

  /**
   * Use this method to get information about custom emoji stickers by their identifiers
   * Referensi : https://core.telegram.org/bots/api#getcustomemojistickers
   * @param customEmojiId
   */
  getCustomEmojiStickers(customEmojiId) {
    return this.callApi('getCustomEmojiStickers', { custom_emoji_ids: customEmojiId })
  }

  /** BOT API 6.3 */
  /** Added the methods createForumTopic, editForumTopic, closeForumTopic, reopenForumTopic, deleteForumTopic,
      unpinAllForumTopicMessages, and getForumTopicIconStickers for forum topic management. 
  ***/

  getForumTopicIconStickers() {
    return this.callApi('getForumTopicIconStickers', {})
  }

  createForumTopic(chatId, name, extra) {
    return this.callApi('createForumTopic', { chat_id: chatId, name, ...extra });
  }

  editForumTopic(chatId, message_thread_id, name, extra) {
    return this.callApi('editForumTopic', { chat_id: chatId, message_thread_id, name, ...extra });
  }

  closeForumTopic(chatId, message_thread_id) {
    return this.callApi('closeForumTopic', { chat_id: chatId, message_thread_id });
  }

  reopenForumTopic(chatId, message_thread_id) {
    return this.callApi('reopenForumTopic', { chat_id: chatId, message_thread_id });
  }

  deleteForumTopic(chatId, message_thread_id) {
    return this.callApi('deleteForumTopic', { chat_id: chatId, message_thread_id });
  }

  unpinAllForumTopicMessages(chatId, message_thread_id) {
    return this.callApi('unpinAllForumTopicMessages', { chat_id: chatId, message_thread_id });
  }

}

function getSubType(msg) {

  let not_bc = ["message_id", "from", "sender_chat", "chat", "date", "edit_date", "entities", "forward_from",
    "forward_from_chat", "forward_date", "forward_from_message_id", "is_automatic_forward", "reply_to_message", "via_bot",
    "has_protected_content", "media_group_id", "author_signature"
  ]

  let bc = {}

  const types = Object.keys(msg).filter((k) => typeof msg[k] === 'object');
  if (types.length == 1 || helper.isIn(types, "state")) {
    return undefined;
  }

  Object.keys(msg).forEach(updateType => bc[updateType] = 1);

  let broadcasters = [];
  for (let key in bc) {
    if (not_bc.indexOf(key) >= 0) continue;
    broadcasters.push(key);
  }

  return broadcasters[0];

}


