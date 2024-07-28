import React, { useEffect } from 'react'
import { GlobalState } from '../../../globalState';
import { useContext } from 'react';
import{Text} from "@chakra-ui/react"
import ChatLoading from './ChatLoading';
import axios from 'axios';
import { Button } from "@chakra-ui/react";
import {Box} from "@chakra-ui/react"
import { useToast } from "@chakra-ui/toast";
import { Stack } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { Badge} from '@chakra-ui/react';
import GroupChatModel from './GroupChatModel';
function MyChats({fetchAgain,setFetchAgain}) {
    const state = useContext(GlobalState);
    const [chats,setChats] =state.chatAPI.chatRooms
    const [selectedChat,setSelectedChat] =state.selectedChat
    const [token,setToken]= state.token
    const [notifications,setNotifications]= state.notifications
    const toast = useToast();
    const [user] =state.userAPI.user
    const [loggedUser,setLoggedUser]= useState()
    const numberBadge =(chat)=>{
      const check=notifications.filter(({_id})=>{
        return (_id===chat._id)
      }).length;
      if(check)
        {
          return (<Badge>{check}</Badge>)
        }
        else return ''
    }
 const getSender = (loggedUser, users) => {
        //  console.log(selectedChat)
        return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
      };
    const fetchChats=async()=>{
    
        try{
         const config ={
             headers:{
             'content-type':"application/json",
             Authorization: token
             }
 
         }
         const {data}= await axios.get(`/rooms/userchat`,config)
         console.log('fetchchats')
        setChats(data)
        }catch(err){
         toast({
             title: "error loading chat..",
             status: "warning",
             duration: 5000,
             isClosable: true,
             position: "top-left",
           }); 
        }
       
    }
    useEffect(()=>{
      setLoggedUser(user)
      // setFetchAgain(false)
      if(fetchAgain===true)
      fetchChats()
    
    },[fetchAgain])
    return (
        <Box
          d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
          flexDir="column"
          alignItems="center"
          p={3}
          bg="white"
          w={{ base: "100%", md: "31%" }}
          borderRadius="lg"
          borderWidth="1px"
        >
          <Box
            pb={3}
            px={3}
            fontSize={{ base: "28px", md: "30px" }}
            fontFamily="Work sans"
            d="flex"
            w="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            My Chats
            <GroupChatModel fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}>
              <Button
                d="flex"
                fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                rightIcon={<AddIcon />}
              >
                New Group Chat
              </Button>
            </GroupChatModel>
          </Box>
          <Box
            d="flex"
            flexDir="column"
            p={3}
            bg="#F8F8F8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {chats ? (
              <Stack overflowY="scroll">
                {chats.map((chat) => (<>
                  <Box
                    onClick={() => {
                       setNotifications(notifications.filter(({_id})=>{return _id!==chat._id}))
                      setSelectedChat(chat)}}
                    cursor="pointer"
                    bg={selectedChat._id === chat._id ? "#38B2AC" : "#E8E8E8"}
                    color={selectedChat._id === chat._id ? "white" : "black"}
                    px={3}
                    py={2}
                    borderRadius="lg"
                    key={chat._id}
                  >
                    <Text>
                      {!chat.isGroupChat
                        ? getSender(user, chat.users)
                        : chat.chatName}
                    </Text>
                    <Box display="flex" justifyContent="space-between">
                    {chat.latestMessage && (
                      <Text fontSize="xs">
                        <b>{chat.latestMessage.sender.name} : </b>
                        {chat.latestMessage.content.length > 50
                          ? chat.latestMessage.content.substring(0, 51) + "..."
                          : chat.latestMessage.content}
                      </Text>
                    )}
                   {numberBadge(chat)}
                    </Box>
                  </Box>
                  
                  </>
                ))}
              </Stack>
            ) : (
              <ChatLoading />
            )}
          </Box>
        </Box>
      );
    };
    

export default MyChats
