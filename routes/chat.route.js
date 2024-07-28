const router = require("express").Router();
const chatController = require("../controllers/chat.controller");

router.route("/userchat").post(chatController.accessChat).get(chatController.getUserChats)
router.route("/groupchat").post(chatController.createGroupChat)
router.route("/renamegroupchat").patch(chatController.renameGroupChat)
router.route('/addusertogroup').patch(chatController.addUserToGroup)
router.route('/removeuserfromgroup').patch(chatController.removeUserFromGroup)
router
  .get("/", chatController.getRoomsByUserId)
  .get("/:roomId", chatController.getMessagesByRoomId)
  .post("/create-room", chatController.createChatRoom)
  .post("/:roomId/message", chatController.postMessage)
  .put("/:roomId/mark-read", chatController.markConversationReadByRoomId);
// router.route("/userchat").post(chatController.accessChat).get(chatController.getUserChats)


module.exports = router;
 