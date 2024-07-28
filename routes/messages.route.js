const express=require("express")
const msgCtrl= require("../controllers/message.controller")
const router= express.Router()
router.route("/").post(msgCtrl.postMessage)
router.route("/:chatId").get(msgCtrl.getMessage)
module.exports=router