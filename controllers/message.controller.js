const express=require("express")
const Message=require("../models/chat.messages.model").Message
const Users =require("../models/user.model")
const Chat= require("../models/chat.room.model").Chat
module.exports.postMessage =async(req,res)=>{
      const {id,content} =req.body
      try{
        const isValid= await Chat.find({_id:id,users:{"$in":[req.user.id]}})
        if(isValid.length){
        const message= await Message.create({sender:req.user.id,content,chat:id})
        let chat =await Chat.findByIdAndUpdate(id,{latestMessage:message._id},{new:true}).populate("users","-password").populate("latestMessage")
        chat = await Users.populate(chat, {
            path: "latestMessage.sender",
            select: "name pic email",
          });
          // console.log(chat)
        res.json(chat)
        }
        else{
            res.status(404).send("No chat Found")
        }
      }
      catch(err){
        console.log(err)
        res.status(500).send("something went wrong")
      }

}
module.exports.getMessage =async(req,res)=>{
  const {chatId}=req.params
  try{
    const isValid= await Chat.find({_id:chatId,users:{"$in":[req.user.id]}})
    if(isValid.length){
    const messages= await Message.find({chat:chatId}).sort("createdAt").populate("sender").populate('chat')
    res.json(messages)
    }
    else{
        res.status(404).send("No chat Found")
    }
  }
  catch(err){
    console.log(err)
    res.status(500).send("something went wrong")
  }
}