import React, { useContext } from 'react'
import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import { GlobalState } from '../../../globalState';
// import ScrollableFeed from "react-scrollable-feed";
import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
// import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModel";
import UpdateGroupChatModel from './UpdateGroupChatModel';
import ScrollableChat from './ScrollableChat';
// import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "./typing.json";
import {io} from 'socket.io-client'
const ENDPOINT= "http://localhost:5000"
let socket, selectedChatCompare;

function SingleChat({ fetchAgain, setFetchAgain }) {
       const state= useContext(GlobalState)
       const [selectedChat,setSelectedChat]= state.selectedChat
       const [user] =state.userAPI.user
       const [loading,setLoading]= useState(false)
       const [messages, setMessages] = useState([]);
      //  const [loading, setLoading] = useState(false);
      const [notifications,setNotifications]=state.notifications
       const [newMessage, setNewMessage] = useState("");
       const [socketConnected, setSocketConnected] = useState(false);
       const [typing, setTyping] = useState(false);
       const [istyping, setIstyping] = useState(false);
       const [token] =state.token
       const toast = useToast();
       const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
      };
     const isSameSenderMargin = (messages, m, i, userId) => {
        // console.log(i === messages.length - 1);
      
        if (
          i < messages.length - 1 && 
          messages[i + 1].sender._id === m.sender._id &&
          messages[i].sender._id !== userId
        )
          return 33;
        else if (
          (i < messages.length - 1 &&
            messages[i + 1].sender._id !== m.sender._id &&
            messages[i].sender._id !== userId) ||
          (i === messages.length - 1 && messages[i].sender._id !== userId)
        )
          return 0;
        else return "auto";
      };
      
       const isSameSender = (messages, m, i, userId) => {
        return (
          i < messages.length - 1 &&
          (messages[i + 1].sender._id !== m.sender._id ||
            messages[i + 1].sender._id === undefined) &&
          messages[i].sender._id !== userId
        );
      };
      
       const isLastMessage = (messages, i, userId) => {
        return (
          i === messages.length - 1 &&
          messages[messages.length - 1].sender._id !== userId &&
          messages[messages.length - 1].sender._id
        );
      };
      
       const isSameUser = (messages, m, i) => {
        return i > 0 && messages[i - 1].sender._id === m.sender._id;
      };
      
       const getSender = (loggedUser, users) => {
        return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
      };
      
       const getSenderFull = (loggedUser, users) => {
        return users[0]._id === loggedUser._id ? users[1] : users[0];
      };
      
 const typingHandler= async(e)=>{
       
       setNewMessage(e.target.value)
      
       if(!istyping){
        
        socket.emit("typing",selectedChat._id)
       }
       if(!e.target.value) socket.emit("stop typing",selectedChat._id)
       setTimeout(()=>{
        socket.emit("stop typing",selectedChat._id)
       },3000)
       
 }
 const sendMessage = async(e)=>{
     if(e.key=="Enter"&&newMessage){
      
      
      try{
       const config ={
           headers:{
           'content-type':"application/json",
           Authorization: token
           }

       }
      
       const {data}= await axios.post(`/messages`,{id:selectedChat._id,content:newMessage},config)
      setSelectedChat(data)
      
      if(messages.length)
        setMessages([... messages, data.latestMessage])
      else setMessages([ data.latestMessage])
      socket.emit("stop typing",selectedChat._id)
        socket.emit("new message",data)
        // console.log("check", selectedChat)
      setFetchAgain(false)
      setFetchAgain(true)
      setNewMessage("")
      
       
      
      }catch(err){
       toast({
           title: "error sending message..",
           status: "warning",
           duration: 5000,
           isClosable: true,
           position: "top-left",
         }); 
      }
      // setLoadingChat(false)
     }
 }
 const fetchMessages =async()=>{
  setFetchAgain(false)
  if(Object.keys(selectedChat).length){
  try{
   const config ={
       headers:{
       'content-type':"application/json",
       Authorization: token
       }

   }
   const {data}= await axios.get(`/messages/${selectedChat._id}`,config)
  // setSelectedChat(data)
  // console.log("messages",data)
  console.log("fetchMessages")
  setMessages(data)
  setFetchAgain(true)
  socket.emit("join chat", selectedChat._id)
  
  }catch(err){
   toast({
       title: "error recieving messages..",
       status: "warning",
       duration: 5000,
       isClosable: true,
       position: "top-left",
     }); 
  }
}
  
 }
 useEffect(()=>{
  
  socket= io(ENDPOINT)
   socket.emit("setup",user)
   socket.on("typing",(room)=>{
  
    if(room===selectedChatCompare._id)
    setIstyping(true)
  }
  )
   socket.on("stop typing",(room)=>{
    if(room===selectedChatCompare._id)
    setIstyping(false)})
   
   
 },[])

 
 useEffect(()=>{
  setLoading(true)
  
  selectedChatCompare=selectedChat

  
 fetchMessages()
 setNotifications(notifications.filter(({_id})=>{return _id!==selectedChat._id}))
 setLoading(false)
 return ()=>{
  socket.off("setup")
 }
 
 },[selectedChat])
 useEffect(()=>{
  socket.on("message recieved",(recievedMessage)=>{
    setFetchAgain(false)
        if(!selectedChatCompare||selectedChatCompare._id!==recievedMessage._id ){
          setNotifications(notifications=>{
            if(!notifications.includes(recievedMessage)){
             return [recievedMessage, ... notifications]
            }
            else{
             return notifications
            }
          })
            
            setFetchAgain(true)
        
        }
        else{
           
            setMessages(messages=>{
              if(!messages.includes(recievedMessage.latestMessage)){
               return [... messages,recievedMessage.latestMessage]
              }
              else{
               return messages
              }
            })
  
            setFetchAgain(true)
           
        }
  })
 },[])
    return (
        <>
          {Object.keys(selectedChat).length ? (
            <>
              <Text
                fontSize={{ base: "28px", md: "30px" }}
                pb={3}
                px={2}
                w="100%"
                fontFamily="Work sans"
                d="flex"
                justifyContent={{ base: "space-between" }}
                alignItems="center"
              >
                <IconButton
                  d={{ base: "flex", md: "none" }}
                  icon={<ArrowBackIcon />}
                  onClick={() => setSelectedChat("")}
                />
                {messages &&
                  (!selectedChat.isGroupChat ? (
                    <>
                      {getSender(user, selectedChat.users)}
                      <ProfileModal
                        user={getSenderFull(user, selectedChat.users)}
                      />
                    </>
                  ) : (
                    <>
                      {selectedChat.chatName.toUpperCase()}
                      <UpdateGroupChatModel
                        fetchMessages={fetchMessages}
                        fetchAgain={fetchAgain}
                        setFetchAgain={setFetchAgain}
                      />
                    </>
                  ))}
              </Text>
              <Box
                d="flex"
                flexDir="column"
                justifyContent="flex-end"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h="100%"
                borderRadius="lg"
                overflowY="hidden"
              >
                {loading ? (
                  <Spinner
                    size="xl"
                    w={20}
                    h={20}
                    alignSelf="center"
                    margin="auto"
                  />
                ) : (
                  <div className="messages">
                    <ScrollableChat messages={messages} />
                  </div>
                )}
    
                <FormControl
                  onKeyDown={sendMessage}
                  id="first-name"
                  isRequired
                  mt={3}
                >
                  {istyping ? (
                    <div>
                      <Lottie
                        options={defaultOptions}
                        // height={50}
                        width={70}
                        style={{ marginBottom: 15, marginLeft: 0 }}
                      />
                    </div>
                  ) : (
                    <></>
                  )}
                  <Input
                    variant="filled"
                    bg="#E0E0E0"
                    placeholder="Enter a message.."
                    value={newMessage}
                    onChange={typingHandler}
                  />
                </FormControl>
              </Box>
            </>
          ) : (
            <>
            <IconButton
                  d={{ base: "flex", md: "none" }}
                  icon={<ArrowBackIcon />}
                  onClick={() => setSelectedChat("")}
                />
            <Box d="flex" alignItems="center" justifyContent="center" h="100%">
              <Text fontSize="3xl" pb={3} fontFamily="Work sans">
                Click on a user to start chatting
              </Text>
            </Box>
            </>
          )}
        </>
      ); 
}

export default SingleChat
