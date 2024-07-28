const ChatRooms = require("../models/chat.room.model");
const Users = require("../models/user.model");
const ChatMessages = require("../models/chat.messages.model");
const Chat=require("../models/chat.room.model").Chat
const makeValidation = require("@withvoid/make-validation");
const mongoose= require('mongoose')
const mongodb= require('mongodb')

const chatController = {
  createChatRoom: async (req, res) => {
    try {
      
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          users: {
            type: types.array,
            options: { unique: true, empty: false, stringOnly: true },
          },
        },
      }));
      if (!validation.success) return res.status(400).json({ ...validation });
      const { users } = req.body;
      const { id: roomAdmin } = req.user;
      console.log(roomAdmin);
      const members = [...users, roomAdmin];
      const chatRoom = await ChatRooms.findOne({
        members: {
          $size: members.length,
          $all: [...members],
        },
      });
      if (chatRoom) {
        return res.status(200).json({
          success: true,
          chatRoom: {
            isNewRoom: false,
            message: "retrieving old chat room",
            chatRoomId: chatRoom._id,
          },
        });
      }
      const newChatRoom = new ChatRooms({
        members,
        roomAdmin,
      });
      await newChatRoom.save();
      return res.status(200).json({
        success: true,
        chatRoom: {
          isNewRoom: true,
          message: "creating a new chatroom",
          chatRoomId: newChatRoom._id,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  postMessage: async (req, res) => {
    try {
      const { roomId } = req.params;
      const validation = makeValidation((types) => ({
        payload: req.body,
        checks: {
          message: { type: types.string },
        },
      }));
      if (!validation.success) return res.status(400).json({ ...validation });

      const messagePayload = req.body.message;
      const currentLoggedUser = req.user.id;
      const post = await ChatMessages.PostMessageInChatRoom(
        roomId,
        messagePayload,
        currentLoggedUser
      );
      // global.io.sockets.in(roomId).emit("new message", { message: post });
      return res.status(200).json({ success: true, post });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  getRoomsByUserId: async (req, res) => {
    try {
      const currentLoggedUser = req.user.id;
      const rooms = await ChatRooms.getChatRoomsByUserId(currentLoggedUser);
      return res.status(200).json({
        success: true,
        rooms,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  getMessagesByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRooms.findOne({ _id: roomId });
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "No room exists for this id",
        });
      }
      const members = await Users.find({ _id: { $in: room.members } }).select({
        name: 1,
      });
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const conversation = await ChatMessages.getConversationByRoomId(
        roomId,
        options
      );
      return res.status(200).json({
        success: true,
        conversation,
        members,
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  markConversationReadByRoomId: async (req, res) => {
    try {
      const { roomId } = req.params;
      const room = await ChatRooms.findOne({ _id: req.params.roomId });
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "No room with this id found",
        });
      }
      const loggedInUser = req.user.id;
      const result = await ChatMessages.updateMany(
        {
          chatRoomId: roomId,
          "readByRecipients.readByUser": { $ne: loggedInUser },
        },
        {
          $addToSet: {
            readByRecipients: { readByUser: loggedInUser },
          },
        },
        {
          multi: true,
        }
      );
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  },
  accessChat: async (req,res,next)=>{
    let {userId} =req.body
    if(!userId){
      res.send("please provide userId....!")
      return
    }
    
    let isChat =  Chat.find({isGroupChat:false,users:{"$all":[userId,req.user.id]}}).populate("users","-password").populate("latestMessage")
    isChat = await isChat.populate("latestMessage.sender","name pic email")
    
    if(isChat.length==0){
       const chat =await Chat.create({
        isGroupChat:false,
        users:[userId,req.user.id],
        chatName:"Sender" 
       })
       let isChat =  Chat.find({isGroupChat:false,users:{"$all":[userId,req.user.id]}}).populate("users","-password").populate("latestMessage")
       isChat = await Users.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
       
       return res.json(isChat[0]) 
    }
  
    res.json(isChat[0])
 
  },
  getUserChats: async(req,res,next)=>{
     let chats= await Chat.find({users:{"$in":[req.user.id]}}).sort('-updatedAt').populate("users","-password").populate("latestMessage")
     chats = await Users.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });
     res.json(chats)
  },
  createGroupChat: async(req,res,next)=>{
    const {name, users} =req.body
    // console.log(req.body)
    
    const chat= await Chat.create({
     chatName: name,users:[... users,req.user.id],isGroupChat:true,groupAdmin:req.user.id
    })
    res.json(chat)
  },
  renameGroupChat: async(req,res,next)=>{
    const {name,id}= req.body
    const newChat= await Chat.findByIdAndUpdate(id,{
     chatName: name
    },{new:true}).populate("users","-password").populate("groupAdmin","-password")
    res.json(newChat)
  },
  addUserToGroup: async(req,res,next)=>{
     const {id,userId} =req.body
     const chat = await Chat.findByIdAndUpdate(id,{
      "$push":{ users:userId}
     },{new:true}).populate("users","-password")
     res.json(chat)
  },
  removeUserFromGroup: async(req,res,next)=>{
    const {id,userId} =req.body
    const chat = await Chat.findByIdAndUpdate(id,{
      "$pull":{ users:userId}
    },{new:true}).populate("users","-password")
    res.json(chat)
 }
};
module.exports=chatController