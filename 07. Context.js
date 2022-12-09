/*
 * susun di sini 
 * method yang akan disertaan pada ctx
 * 
 * tambahan replyIt{markup} shortcut atas respon biasa
*/

/** 
 * PENTING!! Setiap new Context method wajib menyertakan variabel berikut :
 * 
 * ->  pos_token = this.current_token
 * 
 * Letakkan di paling atas!
 */

class Context {
  constructor(update, tg, current_pos_token, adminbot) {
    this.update = update;
    this.tg = tg;
    this.state = {};
    this.current_token = current_pos_token;
    this.adminbot = adminbot;
  }

  get telegram() {
    return this.tg;
  }

  /** New Update Bot API - https://core.telegram.org/bots/api#november-5-2022 */
  /** Bot API 6.3
      Added support for Topics in Groups.
      Added the field is_forum to the class Chat.
      Added the fields is_topic_message and message_thread_id to the class Message to allow detection of messages belonging
      to a forum topic and their message thread identifier.
      Added the classes ForumTopicCreated, ForumTopicClosed, and ForumTopicReopened and the fields forum_topic_created,
      forum_topic_closed, and forum_topic_reopened to the class Message. Note that service messages about forum topic
      creation can't be deleted with the deleteMessage method.
      Added the field can_manage_topics to the classes ChatAdministratorRights, ChatPermissions, ChatMemberAdministrator, and
      ChatMemberRestricted.
      Added the parameter can_manage_topics to the method promoteChatMember.
      Added the methods createForumTopic, editForumTopic, closeForumTopic, reopenForumTopic, deleteForumTopic,
      unpinAllForumTopicMessages, and getForumTopicIconStickers for forum topic management.
      Added the parameter message_thread_id to the methods sendMessage, sendPhoto, sendVideo, sendAnimation, sendAudio,
      sendDocument, sendSticker, sendVideoNote, sendVoice, sendLocation, sendVenue, sendContact, sendPoll, sendDice,
      sendInvoice, sendGame, sendMediaGroup, copyMessage, forwardMessage to support sending of messages to a forum topic.
      Added support for Multiple Usernames via the field active_usernames in the class Chat.
      Added the field emoji_status_custom_emoji_id to the class Chat.
  ***/
  get thread() {

    /** thread hanya ada di update - message */
    if (this.message) {

      /** periksa apakah group sebuah forum */
      if (this.message.chat.is_forum) {
        /** data topik hanya ada di reply message dan jika tidak mereply pesan */
        let thread = this.replyMessage ? this.replyMessage.forum_topic_created : false
        let thread_id = this.replyMessage ? this.replyMessage.message_thread_id : false
        if (thread && thread_id) {
          let topic = thread
          topic.id = thread_id
          return topic;
        }
        if (!thread && thread_id) {
          return { id: thread_id }
        }
      }
    }

    /** jika tidak ada maka kembalikan undefined */
    return {
      message: "🚫 Object has no field 'forum_topic_created'",
      id: undefined,
      name: undefined,
      icon_color: undefined,
      icon_custom_emoji_id: undefined
    };

  }

  /**
   * Class : Update Type
   */
  get updateType() {
    const types = Object.keys(this.update).filter((k) => typeof this.update[k] === 'object');
    if (types.length !== 1) {
      throw new Error(`Cannot determine \`updateType\` of ${JSON.stringify(this.update)}`);
    }
    return types[0];
  }

  // returning type of message
  get updateSubType() {

    let not_bc = ["message_id", "from", "sender_chat", "chat", "date", "edit_date", "entities", "forward_from",
      "forward_from_chat", "forward_date", "forward_from_message_id", "is_automatic_forward", "reply_to_message", "via_bot",
      "has_protected_content", "media_group_id", "author_signature"
    ]

    let bc = {}

    const types = Object.keys(this.update).filter((k) => typeof this.update[k] === 'object');
    Object.keys(this.update[types]).forEach(updateType => bc[updateType] = 1);

    let broadcasters = [];
    for (let key in bc) {
      if (not_bc.indexOf(key) >= 0) continue;
      broadcasters.push(key);
    }

    return broadcasters[0];
  }

  updateSubTypeMessage(msg) {

    if (helper.typeCheck(msg) !== "object") throw new Error("🚫 Message parameter must be an JSON Object.")

    let not_bc = ["message_id", "from", "sender_chat", "chat", "date", "edit_date", "entities", "forward_from",
      "forward_from_chat", "forward_date", "forward_from_message_id", "is_automatic_forward", "reply_to_message", "via_bot",
      "has_protected_content", "media_group_id", "author_signature"
    ]

    let bc = {}

    const types = Object.keys(msg).filter((k) => typeof msg[k] === 'object');
    if (types.length == 1 || helper.isIn(types, "state")) {
      return "🚫 I can't detecting [" + types + "] as Message object type";
    }

    Object.keys(msg).forEach(updateType => bc[updateType] = 1);

    let broadcasters = [];
    for (let key in bc) {
      if (not_bc.indexOf(key) >= 0) continue;
      broadcasters.push(key);
    }

    return broadcasters[0];
  }

  /** Alias */
  updateSubTypeMsg(msg) {
    return this.updateSubTypeMessage(msg)
  }

  /**
   * Update : Message
   * Source : https://core.telegram.org/bots/api#message
   * Optional. New incoming message of any kind — text, photo, sticker, etc.
   */
  get message() {
    return this.update.message;
  }

  /**
   * Update : Edited Message
   * Source : https://core.telegram.org/bots/api#message
   * Optional. New version of a message that is known to the bot and was edited
   */
  get editedMessage() {
    return this.update.edited_message;
  }

  /**
   * Update : Channel Post
   * Source : https://core.telegram.org/bots/api#message
   * Optional. New incoming channel post of any kind — text, photo, sticker, etc.
   */
  get channelPost() {
    return this.update.channel_post;
  }

  /**
   * Update : Edited Channel Post
   * Source : https://core.telegram.org/bots/api#message
   * Optional. New version of a channel post that is known to the bot and was edited
   */
  get editedChannelPost() {
    return this.update.edited_channel_post;
  }

  /**
   * Update : Inline Query
   * Source : https://core.telegram.org/bots/api#inlinequery
   * Optional. New incoming inline query
   * https://core.telegram.org/bots/api#inline-mode
   */
  get inlineQuery() {
    return this.update.inline_query;
  }

  /**
   * Update : Chosen Inline Result
   * Source : https://core.telegram.org/bots/api#choseninlineresult
   * Optional. The result of an inline query that was chosen by a user and sent to their chat partner. Please see our documentation on the feedback collecting for details on how to enable these updates for your bot.
   */
  get chosenInlineResult() {
    return this.update.chosen_inline_result;
  }

  /**
   * Update : Callback Query
   * Source : https://core.telegram.org/bots/api#callbackquery
   * Optional. New incoming callback query
   */
  get callbackQuery() {
    return this.update.callback_query;
  }

  /**
   * Update : Shipping Query
   * Source : https://core.telegram.org/bots/api#shippingquery
   * Optional. New incoming shipping query. Only for invoices with flexible price
   */
  get shippingQuery() {
    return this.update.shipping_query;
  }

  /**
   * Update : Pre Checkout Query
   * Source : https://core.telegram.org/bots/api#precheckoutquery
   * 	Optional. New incoming pre-checkout query. Contains full information about checkout
   */
  get preCheckoutQuery() {
    return this.update.pre_checkout_query;
  }

  /**
   * Update : Poll
   * Source : https://core.telegram.org/bots/api#poll
   * Optional. New poll state. Bots receive only updates about stopped polls and polls, which are sent by the bot
   */
  get poll() {
    return this.update.poll;
  }


  /**
   * Update : Poll Answer
   * Source : https://core.telegram.org/bots/api#pollanswer
   * Optional. A user changed their answer in a non-anonymous poll. Bots receive new votes only in polls that were sent by the bot itself.
   */
  get pollAnswer() {
    return this.update.poll_answer;
  }


  /**
   * Update : My Chat Member
   * Source : https://core.telegram.org/bots/api#chatmemberupdated
   * Optional. The bot's chat member status was updated in a chat. For private chats, this update is received only when the bot is blocked or unblocked by the user.
   */
  get myChatMember() {
    return this.update.my_chat_member;
  }


  /**
   * Update : Chat Member
   * Source : https://core.telegram.org/bots/api#chatmemberupdated
   * Optional. A chat member's status was updated in a chat. The bot must be an administrator in the chat and must explicitly specify “chat_member” in the list of allowed_updates to receive these updates.
   */
  get chatMember() {
    return this.update.chat_member;
  }

  /**
   * Update : Chat Join Request
   * Source : https://core.telegram.org/bots/api#chatjoinrequest
   * Optional. A request to join the chat has been sent. The bot must have the can_invite_users administrator right in the chat to receive these updates.
   */
  get chatJoinRequest() {
    return this.update.chat_join_request
  }

  /**
   * Additional
   */

  // update.message.reply_to_message
  get replyMessage() {
    let replyMessage = getReplyToMessageFromAnySource(this)
    if (!replyMessage) {
      Logger.log('🚫 Object has no field "reply_to_message"')
      return undefined;
    }
    return replyMessage;
  }

  // update.message.(media).file_id
  get fileId() {
    return (
      getTipeMedia(this)
    )?.file_id
  }

  // update.message.reply_to_message.message_id
  get replyMsgId() {
    if (!this.replyMessage) throw new ReferenceError('🚫 Object has no field "reply_to_message"')
    let reply_id = this.replyMessage.message_id
    if (!reply_id) {
      throw new ReferenceError('🚫 Object has no field "reply_to_message.message_id"')
    }
    return this.replyMessage.message_id
  }
  get replyMessageId() {
    return this.replyMsgId
  }

  // update.message.message_id
  get messageId() {
    let message_id = getMessageFromAnySource(this)?.message_id
    if (!message_id) throw new ReferenceError('🚫 Object has no field "message.message_id"')
    return getMessageFromAnySource(this)?.message_id
  }

  get messageLink() {
    // message link hanya dapat di generate di group atau private group
    if (this.message || this.channelPost || this.callbackQuery) {
      let msg = this.message ?? this.channelPost ?? this.callbackQuery.message
      if (msg.chat.type !== "private") {
        let username_group = msg.chat.username ?? "c/" + String(msg.chat.id).replace("-100", "")
        if (this.thread.id) {
          return `https://t.me/${username_group}/${this.messageId}?thread=${this.thread.id}`
        } else {
          return `https://t.me/${username_group}/${this.messageId}`
        }
      }
    }
  }

  // update.message.chat
  get chat() {

    let chat_id = (
      this.chatMember ??
      this.myChatMember ??
      getMessageFromAnySource(this)
    )?.chat;

    if (!chat_id) {
      Logger.log('🚫 Object has no field "chat"')
      return {
        message: '🚫 Object has no field "chat"',
        id: undefined,
        title: undefined,
        username: undefined,
        type: undefined,
        is_forum: undefined // untuk pesan topik 
      }
    }

    return (
      this.chatMember ??
      this.myChatMember ??
      getMessageFromAnySource(this)
    )?.chat;

  }

  // update.(message ?? channel_post).sender_chat
  get senderChat() {
    return getMessageFromAnySource(this)?.sender_chat;
  }

  // update.(message ?? channel_post).reply_to_message.sender_chat
  // ctx.replySenderChat.message ? "bukan channel" : "ini bener channel"
  /** Cari ide agar replySenderChat tidak id undefined */
  get replySenderChat() {
    if (!this.replyMessage) throw new ReferenceError('🚫 Object has no field "reply_to_message"')
    let this_reply = getReplyFromInAnySource(this)
    if (!this_reply.sender_chat) {
      Logger.log('🚫 Object has no field "reply_to_message.sender_chat"')
      return undefined;
    }
    return this_reply.sender_chat;
  }

  // update.message.from
  get from() {

    if (this.channelPost || this.editedChannelPost) {
      return {
        id: (
          this.channelPost ??
          this.editedChannelPost
        )?.sender_chat.id,
        message: '⛔️ Please change ctx.from to ctx.senderChat!'
      }
    } else if (this.message) {
      if (this.message.sender_chat) {
        return {
          id: this.message.sender_chat.id,
          message: '⛔️ Please change ctx.from to ctx.senderChat!'
        }
      }
    } else if (this.editedMessage) {
      if (this.editedMessage.sender_chat) {
        return {
          id: this.editedMessage.sender_chat.id,
          message: '⛔️ Please change ctx.from to ctx.senderChat!'
        }
      }
    } else { }


    let from_id = (
      this.callbackQuery ?? this.inlineQuery ?? this.shippingQuery ?? this.preCheckoutQuery ??
      this.chosenInlineResult ?? this.chatMember ?? this.myChatMember ?? getFromInAnySource(this)
    )?.from;

    if (!from_id) {
      Logger.log('🚫 Object has no field "from"')
      return {
        message: '🚫 Object has no field "from"',
        id: undefined,
        is_bot: undefined,
        first_name: undefined,
        last_name: undefined,
        username: undefined,
        language_code: undefined
      }
    }

    return (
      this.callbackQuery ?? this.inlineQuery ?? this.shippingQuery ?? this.preCheckoutQuery ??
      this.chosenInlineResult ?? this.chatMember ?? this.myChatMember ?? getFromInAnySource(this)
    )?.from;

  }

  // update.message.reply_to_message.from
  get replyFrom() {
    if (!this.replyMessage) throw new ReferenceError('🚫 Object has no field "reply_to_message"')
    let this_reply = getReplyFromInAnySource(this)
    if (helper.isIn(["message", "edited_message", "callback_query"], this.updateType)) {
      return this_reply.from
    } else if (this.updateType == "channel_post" || this.updateType == "edited_channel_post") {
      let sender_chat = this_reply.sender_chat
      let channel_id = sender_chat.id
      delete sender_chat.id
      return { id: channel_id, sender_chat }
    } else {
      Logger.log('🚫 Object has no field "reply_to_message.from"')
      return undefined
    }
  }

  /**
   * Context : Bound Method
   */

  /*
   * Additional Method 
   */
  get inlineMessageId() {
    return (this.callbackQuery ?? this.chosenInlineResult)?.inline_message_id
  }
  get passportData() {
    if (this.message == null) return undefined
    if (!('passport_data' in this.message)) return undefined
    return this.message?.passport_data
  }

  /*
   * Filtering 
   */
  assert(value, method) {
    if (value === undefined) {
      throw new TypeError(`Minigram library: "${method}" isn't available for "${this.updateType}"`);
    }
  }

  /** mendeksi error saat kirim pesan ke forum */
  failed_send_to_forum(method) {
    return this.telegram.sendMessage(this.adminbot, `<code>⛔️ [404] - There is no message_thread_id for [${method}]</code>`, { parse_mode: "HTML" })
  }

  /**
   * @see https://core.telegram.org/bots/api#answerinlinequery
   */
  answerInlineQuery(...args) {
    this.assert(this.inlineQuery, 'answerInlineQuery');
    return this.telegram.answerInlineQuery(this.inlineQuery.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#answercallbackquery
   */
  answerCbQuery(...args) {
    this.assert(this.callbackQuery, 'answerCbQuery');
    return this.telegram.answerCbQuery(this.callbackQuery.id, ...args);
  }
  answerCallbackQuery(...args) {
    return this.answerCbQuery(...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#answercallbackquery
   */
  answerGameQuery(...args) {
    this.assert(this.callbackQuery, 'answerGameQuery');
    return this.telegram.answerGameQuery(this.callbackQuery.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#answershippingquery
   */
  answerShippingQuery(...args) {
    this.assert(this.shippingQuery, 'answerShippingQuery');
    return this.telegram.answerShippingQuery(this.shippingQuery.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#answerprecheckoutquery
   */
  answerPreCheckoutQuery(...args) {
    this.assert(this.preCheckoutQuery, 'answerPreCheckoutQuery');
    return this.telegram.answerPreCheckoutQuery(this.preCheckoutQuery.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#editmessagetext
   */
  editMessageText(messageId, teks, extra) {
    this.assert(this.callbackQuery ?? this.inlineMessageId ?? this.message ?? this.editedMessage ?? this.channelPost, 'editMessageText')
    if (this.message || this.channelPost || this.editedMessage) {
      if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "result")) {
        var message_id = messageId.result.message_id
      } else if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "message_id")) {
        var message_id = messageId.message_id
      } else if (helper.typeCheck(messageId) == "number") {
        var message_id = messageId
      } else throw new Error("🚫 Invalid message_id to edit")
      let text = teks;
      try {
        return this.telegram.editMessageText(
          this.chat?.id,
          message_id,
          false,
          text,
          extra
        )
      } catch (e) {
        return this.telegram.sendMessage(
          this.chat?.id,
          text,
          extra
        )
      }
    } else if (this.callbackQuery ?? this.inlineMessageId) {
      let text = messageId
      let extra = teks
      try {
        return this.telegram.editMessageText(
          this.chat?.id,
          this.callbackQuery?.message?.message_id,
          this.inlineMessageId,
          text,
          extra
        )
      } catch (e) {
        return this.telegram.sendMessage(
          this.chat?.id,
          text,
          extra
        )
      }
    } else {
      throw TypeError('Error on method : editMessageText')
    }

  }
  /**
   * @see https://core.telegram.org/bots/api#editmessagecaption
   */
  editMessageCaption(messageId, captions, extra) {
    this.assert(this.callbackQuery ?? this.inlineMessageId ?? this.message ?? this.editedMessage ?? this.channelPost, 'editMessageCaption')
    if (this.message || this.channelPost || this.editedMessage) {
      if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "result")) {
        var message_id = messageId.result.message_id
      } else if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "message_id")) {
        var message_id = messageId.message_id
      } else {
        var message_id = messageId
      }
      let caption = captions
      return this.telegram.editMessageCaption(
        this.chat?.id,
        message_id,
        false,
        caption,
        extra
      )
    } else if (this.callbackQuery ?? this.inlineMessageId) {
      let caption = messageId
      let extra = captions
      return this.telegram.editMessageCaption(
        this.chat?.id,
        this.callbackQuery?.message?.message_id,
        this.inlineMessageId,
        caption,
        extra
      )
    } else {
      throw TypeError('Error on method : editMessageCaption')
    }

  }
  /**
   * @see https://core.telegram.org/bots/api#editmessagemedia
   */
  editMessageMedia(messageId, medias, extra) {
    this.assert(this.callbackQuery ?? this.inlineMessageId ?? this.message ?? this.editedMessage ?? this.channelPost, 'editMessageMedia')
    if (this.message || this.channelPost || this.editedMessage) {
      if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "result")) {
        var message_id = messageId.result.message_id
      } else if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "message_id")) {
        var message_id = messageId.message_id
      } else {
        var message_id = messageId
      }
      let media = medias
      return this.telegram.editMessageMedia(
        this.chat?.id,
        message_id,
        false,
        media,
        extra
      )
    } else if (this.callbackQuery ?? this.inlineMessageId) {
      let media = messageId
      let extra = medias
      return this.telegram.editMessageMedia(
        this.chat?.id,
        this.callbackQuery?.message?.message_id,
        this.inlineMessageId,
        media,
        extra
      )
    } else {
      throw TypeError('Error on method : editMessageMedia')
    }

  }
  /**
   * @see https://core.telegram.org/bots/api#editmessagereplymarkup
   */
  editMessageReplyMarkup(messageId, markups) {
    this.assert(this.callbackQuery ?? this.inlineMessageId ?? this.message ?? this.editedMessage ?? this.channelPost, 'editMessageReplyMarkup')
    if (this.message || this.channelPost || this.editedMessage) {
      if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "result")) {
        var message_id = messageId.result.message_id
      } else if (helper.typeCheck(messageId) == "object" && helper.hasProp(messageId, "message_id")) {
        var message_id = messageId.message_id
      } else {
        var message_id = messageId
      }
      let reply_markup = markups
      return this.telegram.editMessageReplyMarkup(
        this.chat?.id,
        message_id,
        false,
        reply_markup
      )
    } else if (this.callbackQuery ?? this.inlineMessageId) {
      let reply_markup = messageId
      return this.telegram.editMessageReplyMarkup(
        this.chat?.id,
        this.callbackQuery?.message?.message_id,
        this.inlineMessageId,
        reply_markup
      )
    } else {
      throw TypeError('Error on method : editMessageReplyMarkup')
    }

  }
  /**
   * @see https://core.telegram.org/bots/api#editmessagelivelocation
   */
  editMessageLiveLocation(latitude, longitude, extra) {
    this.assert(
      this.callbackQuery ?? this.inlineMessageId,
      'editMessageLiveLocation'
    )
    return this.telegram.editMessageLiveLocation(
      this.chat?.id,
      this.callbackQuery?.message?.message_id,
      this.inlineMessageId,
      latitude,
      longitude,
      extra
    )
  }
  /**
   * @see https://core.telegram.org/bots/api#stopmessagelivelocation
   */
  stopMessageLiveLocation(markup) {
    this.assert(
      this.callbackQuery ?? this.inlineMessageId,
      'stopMessageLiveLocation'
    )
    return this.telegram.stopMessageLiveLocation(
      this.chat?.id,
      this.callbackQuery?.message?.message_id,
      this.inlineMessageId,
      markup
    )
  }
  /**
   * @see https://core.telegram.org/bots/api#sendmessage
   */
  reply(text, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'reply');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendMessage(this.chat.id, text, args);
      }
      return this.failed_send_to_forum('reply')
    } else {
      return this.telegram.sendMessage(this.chat.id, text, ...args);
    }
  }
  /**
  * @see https://core.telegram.org/bots/api#sendmessage
  */
  replyIt(text, extra) {
    pos_token = this.current_token
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.reply(text, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#getchat
   */
  getChat(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'getChat');
    return this.telegram.getChat(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#exportchatinvitelink
   */
  exportChatInviteLink(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'exportChatInviteLink');
    return this.telegram.exportChatInviteLink(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#createchatinvitelink
   */
  createChatInviteLink(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'createChatInviteLink');
    return this.telegram.createChatInviteLink(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#editchatinvitelink
   */
  editChatInviteLink(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'editChatInviteLink');
    return this.telegram.editChatInviteLink(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#revokechatinvitelink
   */
  revokeChatInviteLink(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'revokeChatInviteLink');
    return this.telegram.revokeChatInviteLink(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#banchatmember
   */
  kickChatMember(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'kickChatMember');
    return this.telegram.kickChatMember(this.chat.id, ...args);
  }
  banChatMember(...args) {
    this.assert(this.chat, 'banChatMember');
    return this.telegram.banChatMember(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#unbanchatmember
   */
  unbanChatMember(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'unbanChatMember');
    return this.telegram.unbanChatMember(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#restrictchatmember
   */
  restrictChatMember(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'restrictChatMember');
    return this.telegram.restrictChatMember(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#promotechatmember
   */
  promoteChatMember(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'promoteChatMember');
    return this.telegram.promoteChatMember(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#setchatadministratorcustomtitle
   */
  setChatAdministratorCustomTitle(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'setChatAdministratorCustomTitle');
    return this.telegram.setChatAdministratorCustomTitle(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#setchatphoto
   */
  setChatPhoto(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'setChatPhoto');
    return this.telegram.setChatPhoto(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#deletechatphoto
   */
  deleteChatPhoto(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'deleteChatPhoto');
    return this.telegram.deleteChatPhoto(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#setchattitle
   */
  setChatTitle(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'setChatTitle');
    return this.telegram.setChatTitle(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#setchatdescription
   */
  setChatDescription(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'setChatDescription');
    return this.telegram.setChatDescription(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#pinchatmessage
   */
  pinChatMessage(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'pinChatMessage');
    return this.telegram.pinChatMessage(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#unpinchatmessage
   */
  unpinChatMessage(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'unpinChatMessage');
    return this.telegram.unpinChatMessage(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#unpinallchatmessages
   */
  unpinAllChatMessages(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'unpinAllChatMessages');
    return this.telegram.unpinAllChatMessages(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#leavechat
   */
  leaveChat(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'leaveChat');
    return this.telegram.leaveChat(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#setchatpermissions
   */
  setChatPermissions(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'setChatPermissions');
    return this.telegram.setChatPermissions(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#getchatadministrators
   */
  getChatAdministrators(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'getChatAdministrators');
    return this.telegram.getChatAdministrators(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#getchatmember
   */
  getChatMember(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'getChatMember');
    return this.telegram.getChatMember(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#getchatmembercount
   */
  getChatMembersCount(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'getChatMembersCount');
    return this.telegram.getChatMembersCount(this.chat.id, ...args);
  }
  getChatMemberCount(...args) {
    return this.telegram.getChatMembersCount(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#setpassportdataerrors
   */
  setPassportDataErrors(errors) {
    pos_token = this.current_token
    this.assert(this.from, 'setPassportDataErrors');
    if (this.from.id < 0) throw new Error("🚫 Only user can be executed : setPassportDataErrors")
    return this.telegram.setPassportDataErrors(this.from.id, errors);
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithphoto
   */
  replyWithPhoto(photo, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithPhoto');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendPhoto(this.chat.id, photo, args);
      }
      return this.failed_send_to_forum('replyWithPhoto')
    } else {
      return this.telegram.sendPhoto(this.chat.id, photo, ...args);
    }
  }
  replyItWithPhoto(photo, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithPhoto(photo, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithmediagroup
   */
  replyWithMediaGroup(media, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithMediaGroup');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendMediaGroup(this.chat.id, media, args);
      }
      return this.failed_send_to_forum('replyWithMediaGroup')
    } else {
      return this.telegram.sendMediaGroup(this.chat.id, media, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithaudio
   */
  replyWithAudio(audio, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithAudio');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendAudio(this.chat.id, audio, args);
      }
      return this.failed_send_to_forum('replyWithAudio')
    } else {
      return this.telegram.sendAudio(this.chat.id, audio, ...args);
    }
  }

  replyItWithAudio(audio, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithAudio(audio, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithdice
   */
  replyWithDice(emoji, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithDice');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendDice(this.chat.id, emoji, args);
      }
      return this.failed_send_to_forum('replyWithDice')
    } else {
      return this.telegram.sendDice(this.chat.id, emoji, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithdice
   */
  replyItWithDice(emoji, ...args) {
    this.assert(this.chat, 'replyWithDice');
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithDice(emoji, { reply_to_message_id: message_id, ...args });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithdocument
   */
  replyWithDocument(doc, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithDocument');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendDocument(this.chat.id, doc, args);
      }
      return this.failed_send_to_forum('replyWithDocument')
    } else {
      return this.telegram.sendDocument(this.chat.id, doc, ...args);
    }
  }
  replyItWithDocument(doc, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    this.replyWithDocument(doc, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithsticker
   */
  replyWithSticker(sticker, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithSticker');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendSticker(this.chat.id, sticker, args);
      }
      return this.warning(undefined, 'replyWithSticker')
    } else {
      return this.telegram.sendSticker(this.chat.id, sticker, ...args);
    }
  }
  replyItWithSticker(sticker, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithSticker(sticker, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithvideo
   */
  replyWithVideo(video, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithVideo');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendVideo(this.chat.id, video, args);
      }
      return this.failed_send_to_forum('replyWithVideo')
    } else {
      return this.telegram.sendVideo(this.chat.id, video, ...args);
    }
  }
  replyItWithVideo(video, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithVideo(video, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithanimation
   */
  replyWithAnimation(animation, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithAnimation');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendAnimation(this.chat.id, animation, args);
      }
      return this.failed_send_to_forum('replyWithAnimation')
    } else {
      return this.telegram.sendAnimation(this.chat.id, animation, ...args);
    }
  }
  replyItWithAnimation(animation, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithAnimation(animation, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithvideonote
   */
  replyWithVideoNote(videoNote, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithVideoNote');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendVideoNote(this.chat.id, videoNote, args);
      }
      return this.failed_send_to_forum('replyWithVideoNote')
    } else {
      return this.telegram.sendVideoNote(this.chat.id, videoNote, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithvideonote
   */
  replyItWithVideoNote(videoNote, ...args) {
    this.assert(this.chat, 'replyWithVideoNote');
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithVideoNote(videoNote, { reply_to_message_id: message_id, ...args });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithinvoice
   */
  replyWithInvoice(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithInvoice');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendInvoice(this.chat.id, args);
      }
      return this.failed_send_to_forum('replyWithInvoice')
    } else {
      return this.telegram.sendInvoice(this.chat.id, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithgame
   */
  replyWithGame(gameName, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithGame');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendGame(this.chat.id, gameName, args);
      }
      return this.failed_send_to_forum('replyWithGame')
    } else {
      return this.telegram.sendGame(this.chat.id, gameName, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithvoice
   */
  replyWithVoice(voice, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithVoice');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendVoice(this.chat.id, voice, args);
      }
      return this.failed_send_to_forum('replyWithVoice')
    } else {
      return this.telegram.sendVoice(this.chat.id, voice, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithvoice
   */
  replyItWithVoice(voice, ...args) {
    this.assert(this.chat, 'replyWithVoice');
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithVoice(voice, { reply_to_message_id: message_id, ...args });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithpoll
   */
  replyWithPoll(question, options, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithPoll');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendPoll(this.chat.id, question, options, args);
      }
      return this.failed_send_to_forum('replyWithPoll')
    } else {
      return this.telegram.sendPoll(this.chat.id, question, options, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithquiz
   */
  replyWithQuiz(question, options, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithQuiz');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendQuiz(this.chat.id, question, options, args);
      }
      return this.failed_send_to_forum('replyWithQuiz')
    } else {
      return this.telegram.sendQuiz(this.chat.id, question, options, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#stoppoll
   */
  stopPoll(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'stopPoll');
    return this.telegram.stopPoll(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithchataction
   */
  replyWithChatAction(...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithChatAction');
    return this.telegram.sendChatAction(this.chat.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithlocation
   */
  replyWithLocation(lat, long, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithLocation');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendLocation(this.chat.id, lat, long, args);
      }
      return this.failed_send_to_forum('replyWithLocation')
    } else {
      return this.telegram.sendLocation(this.chat.id, lat, long, ...args);
    }
  }

  replyItWithLocation(latitude, longitude, extra) {
    let message_id = (this.message ?? this.channelPost ?? this.editedMessage ?? this.editedChannelPost)?.message_id
    return this.replyWithLocation(latitude, longitude, { reply_to_message_id: message_id, ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithvenue
   */
  replyWithVenue(lat, long, title, address, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithVenue');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendVenue(this.chat.id, lat, long, title, address, args);
      }
      return this.failed_send_to_forum('replyWithVenue')
    } else {
      return this.telegram.sendVenue(this.chat.id, lat, long, title, address, ...args);
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#replywithcontact
   */
  replyWithContact(phoneNumber, firstName, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'replyWithContact');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        if (args.length > 0) {
          args = args.pop()
          args.message_thread_id = this.thread.id
        } else {
          args = { message_thread_id: this.thread.id }
        }
        return this.telegram.sendContact(this.chat.id, phoneNumber, firstName, args);
      }
      return this.failed_send_to_forum('replyWithContact')
    } else {
      return this.telegram.sendContact(this.chat.id, phoneNumber, firstName, ...args);
    }
  }
  /**
   * @deprecated use {@link Telegram.getStickerSet}
   * @see https://core.telegram.org/bots/api#getstickerset
   */
  getStickerSet(setName) {
    pos_token = this.current_token
    return this.telegram.getStickerSet(setName);
  }
  /**
   * @see https://core.telegram.org/bots/api#setchatstickerset
   */
  setChatStickerSet(setName) {
    pos_token = this.current_token
    this.assert(this.chat, 'setChatStickerSet');
    return this.telegram.setChatStickerSet(this.chat.id, setName);
  }
  /**
   * @see https://core.telegram.org/bots/api#deletechatstickerset
   */
  deleteChatStickerSet() {
    pos_token = this.current_token
    this.assert(this.chat, 'deleteChatStickerSet');
    return this.telegram.deleteChatStickerSet(this.chat.id);
  }
  /**
   * @deprecated use {@link Telegram.setStickerPositionInSet}
   * @see https://core.telegram.org/bots/api#setstickerpositioninset
   */
  setStickerPositionInSet(sticker, position) {
    pos_token = this.current_token
    return this.telegram.setStickerPositionInSet(sticker, position);
  }
  /**
   * @deprecated use {@link Telegram.setStickerSetThumb}
   * @see https://core.telegram.org/bots/api#setstickersetthumb
   */
  setStickerSetThumb(...args) {
    pos_token = this.current_token
    return this.telegram.setStickerSetThumb(...args);
  }
  /**
   * @deprecated use {@link Telegram.deleteStickerFromSet}
   * @see https://core.telegram.org/bots/api#deletestickerfromset
   */
  deleteStickerFromSet(sticker) {
    pos_token = this.current_token
    return this.telegram.deleteStickerFromSet(sticker);
  }
  /**
   * @see https://core.telegram.org/bots/api#uploadstickerfile
   */
  uploadStickerFile(...args) {
    pos_token = this.current_token
    this.assert(this.from, 'uploadStickerFile');
    if (this.from.id < 0) throw new Error("🚫 Only user can be executed : uploadStickerFile")
    return this.telegram.uploadStickerFile(this.from.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#createnewstickerset
   */
  createNewStickerSet(...args) {
    pos_token = this.current_token
    this.assert(this.from, 'createNewStickerSet');
    if (this.from.id < 0) throw new Error("🚫 Only user can be executed : createNewStickerSet")
    return this.telegram.createNewStickerSet(this.from.id, ...args);
  }
  /**
   * @see https://core.telegram.org/bots/api#addstickertoset
   */
  addStickerToSet(...args) {
    pos_token = this.current_token
    this.assert(this.from, 'addStickerToSet');
    if (this.from.id < 0) throw new Error("🚫 Only user can be executed : addStickerToSet")
    return this.telegram.addStickerToSet(this.from.id, ...args);
  }
  /**
   * @deprecated use {@link Telegram.getMyCommands}
   * @see https://core.telegram.org/bots/api#getmycommands
   */
  getMyCommands() {
    pos_token = this.current_token
    return this.telegram.getMyCommands();
  }
  /**
   * @deprecated use {@link Telegram.setMyCommands}
   * @see https://core.telegram.org/bots/api#setmycommands
   */
  setMyCommands(commands) {
    pos_token = this.current_token
    return this.telegram.setMyCommands(commands);
  }
  /**
   * @see https://core.telegram.org/bots/api#sendmessage
   */
  replyWithMarkdown(text, extra) {
    return this.reply(text, { parse_mode: 'Markdown', ...extra });
  }
  replyItWithMarkdown(text, extra) {
    return this.replyIt(text, { parse_mode: 'Markdown', ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#sendmessage
   */
  replyWithMarkdownV2(text, extra) {
    return this.reply(text, { parse_mode: 'MarkdownV2', ...extra });
  }
  replyItWithMarkdownV2(text, extra) {
    return this.replyIt(text, { parse_mode: 'MarkdownV2', ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#sendmessage
   */
  replyWithHTML(text, extra) {
    return this.reply(text, { parse_mode: 'HTML', ...extra });
  }
  replyItWithHTML(text, extra) {
    return this.replyIt(text, { parse_mode: 'HTML', ...extra });
  }
  /**
   * @see https://core.telegram.org/bots/api#deletemessage
   */
  deleteMessage(messageId) {
    pos_token = this.current_token
    this.assert(this.chat, 'deleteMessage');
    if (helper.typeCheck(messageId) == 'object') {

      let message_id = false;

      if (messageId.result) {
        message_id = messageId.result.message_id
      }
      if (messageId.message_id) {
        message_id = messageId.message_id
      }

      if (helper.typeCheck(message_id) !== 'number') throw Error("[400] - message_id must be an integer.")

      try {
        return this.telegram.deleteMessage(this.chat.id, message_id);
      } catch (e) {
        return {
          ok: false,
          result: "[400] - message can't be deleted or not found."
        }
      }

    } else if (helper.typeCheck(messageId) == 'number') {
      try {
        return this.telegram.deleteMessage(this.chat.id, messageId);
      } catch (e) {
        return {
          ok: false,
          result: "[400] - message can't be deleted or not found."
        }
      }
    } else {
      const message = getMessageFromAnySource(this);
      this.assert(message, 'deleteMessage');
      try {
        return this.telegram.deleteMessage(this.chat.id, message.message_id);
      } catch (e) {
        return {
          ok: false,
          result: "[400] - message can't be deleted or not found."
        }
      }
    }
  }
  /**
   * @see https://core.telegram.org/bots/api#forwardmessage
   */
  forwardMessage(chatId, extra) {
    pos_token = this.current_token
    const message = getMessageFromAnySource(this);
    this.assert(message, 'forwardMessage');
    return this.telegram.forwardMessage(chatId, message.chat.id, message.message_id, extra);
  }
  /**
   * @see https://core.telegram.org/bots/api#copymessage
   */
  copyMessage(chatId, extra) {
    pos_token = this.current_token
    const message = getMessageFromAnySource(this);
    this.assert(message, 'copyMessage');
    return this.telegram.copyMessage(chatId, message.chat.id, message.message_id, extra);
  }
  sendCopy(chatId, message) {
    pos_token = this.current_token
    const msg = message ?? getMessageFromAnySource(this);
    this.assert(msg, 'sendCopy');
    return this.telegram.sendCopy(chatId, msg);
  }
  /**
   * New Added 3.4.7
   */
  banChatSenderChat(senderChatId) {
    pos_token = this.current_token
    this.assert(this.chat, 'banChatSenderChat');
    return this.telegram.banChatSenderChat(this.chat.id, senderChatId);
  }
  unbanChatSenderChat(senderChatId) {
    pos_token = this.current_token
    this.assert(this.chat, 'unbanChatSenderChat');
    return this.telegram.unbanChatSenderChat(this.chat.id, senderChatId);
  }

  /** New Added 3.6.12 */
  createForumTopic(name, ...args) {
    pos_token = this.current_token
    this.assert(this.chat, 'createForumTopic');
    return this.telegram.createForumTopic(this.chat.id, name, ...args);
  }

  deleteForumTopic() {
    pos_token = this.current_token
    this.assert(this.chat, 'deleteForumTopic');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        return this.telegram.deleteForumTopic(this.chat.id, this.thread.id);
      }
    }
    return this.failed_send_to_forum('deleteForumTopic')
  }

  closeForumTopic() {
    pos_token = this.current_token
    this.assert(this.chat, 'closeForumTopic');
    if (this.chat.is_forum) {
      if (this.thread.id) {
        return this.telegram.closeForumTopic(this.chat.id, this.thread.id);
      }
    }
    return this.failed_send_to_forum('closeForumTopic')
  }

}

function getMessageFromAnySource(ctx) {
  let source =
    ctx.message ??
    ctx.editedMessage ??
    ctx.callbackQuery?.message ??
    ctx.channelPost ??
    ctx.editedChannelPost ??
    undefined

  if (!source) {
    // return { id: undefined, message_id: undefined }
    return undefined;
  } else {
    return (
      ctx.message ??
      ctx.editedMessage ??
      ctx.callbackQuery?.message ??
      ctx.channelPost ??
      ctx.editedChannelPost
    )
  }
}

function getReplyToMessageFromAnySource(ctx) {
  let source = (
    ctx.message ??
    ctx.editedMessage ??
    ctx.channelPost ??
    ctx.editedChannelPost ??
    ctx.callbackQuery?.message
  )?.reply_to_message

  if (!source) return undefined

  return (
    ctx.message ??
    ctx.editedMessage ??
    ctx.channelPost ??
    ctx.editedChannelPost ??
    ctx.callbackQuery?.message
  )?.reply_to_message
}

function getFromInAnySource(ctx) {
  return (
    ctx.message ??
    ctx.editedMessage ??
    ctx.callbackQuery
  )
}

function getReplyFromInAnySource(ctx) {

  let msg = ctx.message ? ctx.message.reply_to_message : false
  let edited_msg = ctx.editedMessage ? ctx.editedMessage.reply_to_message : false
  let cb = ctx.callbackQuery ? ctx.callbackQuery.message.reply_to_message : false

  if (msg) return msg;
  if (edited_msg) return edited_msg;
  if (cb) return cb

  return undefined;

}

function getReplyMessageFromAnySource(ctx) {
  return (
    ctx.message.reply_to_message ??
    ctx.editedMessage.reply_to_message ??
    ctx.callbackQuery?.message.reply_to_message ??
    ctx.channelPost.reply_to_message ??
    ctx.editedChannelPost.reply_to_message
  )
}

function getTipeMedia(ctx) {

  // if (!ctx.message) return false;
  // if (ctx.message.text || ctx.message.reply_to_message.text) return false;

  let bound = false

  if (ctx.message || ctx.editedMessage) {
    bound = true
    if ((ctx.message ?? ctx.editedMessage)?.reply_to_message) {
      var msg = (ctx.message ?? ctx.editedMessage)?.reply_to_message
    } else {
      var msg = ctx.message
    }
  }

  if (ctx.channelPost || ctx.editedChannelPost) {
    bound = true
    if ((ctx.channelPost ?? ctx.editedChannelPost)?.reply_to_message) {
      var msg = (ctx.channelPost ?? ctx.editedChannelPost)?.reply_to_message
    } else {
      var msg = ctx.channelPost
    }
  }

  if (ctx.callbackQuery) {
    bound = true
    if (ctx.callbackQuery.message.reply_to_message) {
      var msg = ctx.callbackQuery.message.reply_to_message
    } else {
      var msg = ctx.callbackQuery.message
    }
  }

  if (msg.text || !bound) {
    console.log('🚫 Object has no field "file_id"')
    return undefined
  }

  if (msg.photo) msg.photo = msg.photo[msg.photo.length - 1]

  return (
    msg.audio ??
    msg.video ??
    msg.sticker ??
    msg.document ??
    msg.animation ??
    msg.video_note ??
    msg.voice ??
    msg.photo
  )
}

