/*CMD
  command: /on_save_msg
  help: 
  need_reply: false
  auto_retry_time: 
  folder: 

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

if (options && options.result && options.result.message_id) {
  User.setProperty("last_bot_msg_id", options.result.message_id, "integer");
}
