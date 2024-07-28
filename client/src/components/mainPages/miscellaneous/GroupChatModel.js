import React from 'react'
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    FormControl,
    Input,
    useToast,
    Box,
  } from "@chakra-ui/react";
  import { useContext } from 'react';
  import axios from "axios";
  import { useState } from "react";
  import { GlobalState } from '../../../globalState';
  import UserListItem from "./UserListItem"
  import UserBadgeItem from './UserBadgeItem';
function GroupChatModel({children,fetchAgain,setFetchAgain}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);

  const [loading, setLoading] = useState(false); 
  const toast = useToast();
  const state = useContext(GlobalState);
  const [selectedChat,setSelectedChat] =state.selectedChat
  const [user] =state.userAPI.user
  const [token]=state.token
  const [chats,setChats] =state.chatAPI.chatRooms
  const handleSearch =async(value)=>{
    setLoading(true)
     try{
        const config ={
            headers:{
            Authorization: token
            }
        }
        const {data}= await axios.get(`/user/searchusers?search=${value}`,config)
        
        setSearchResult(data)
       
     }
     catch(err){
        toast({
            title: "error finding users",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          }); 
     }
     setLoading(false)
  }
  const handleDelete = async(u)=>{
    // console.log(selectedUsers)
        let newUsers;
newUsers = selectedUsers.filter(function(item) {
    return item._id !== u._id
})
        setSelectedUsers(newUsers)

}
const handleSubmit =async()=>{
  setFetchAgain(false)
    if(!groupChatName){
        toast({
            title: "please provide group name..",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          });
          return;
    }
    if(selectedUsers.length<=1){
        toast({
            title: "please select atleast two users...",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          });
          return;
    }
    try{
        const config ={
            headers:{
            "content-type":"application/json",
            Authorization: token
            }
        }
       const {data}= await axios.post(`/rooms/groupchat`,{users:selectedUsers,name:groupChatName},config)
      //  setChats([... chats,data])
     setSelectedChat(data)
     setFetchAgain(true)
       onClose()
    //    console.log("hello")
    }
     catch{
        toast({
            title: "Error Creating Group Chat.. Try Again",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          });
          return;
     }

}
  
  const handleGroup =async(user)=>{
    console.log(selectedUsers)
    if(selectedUsers.includes(user)){
        toast({
            title: "User already selected",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          }); 
    }
else{
    setSelectedUsers([... selectedUsers,user])
}
  }
    return (
        <>
          <span onClick={onOpen}>{children}</span>
           
          <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                fontSize="35px"
                fontFamily="Work sans"
                d="flex"
                justifyContent="center"
                background="white"
                color="black"
              >
                Create Group Chat
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody d="flex" flexDir="column" alignItems="center">
                <FormControl>
                  <Input
                    placeholder="Chat Name"
                    mb={3}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    placeholder="Add Users eg: John, Piyush, Jane"
                    mb={1}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </FormControl>
                <Box w="100%" d="flex" flexWrap="wrap">
                  {selectedUsers.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      handleFunction={() => handleDelete(u)}
                    />
                    
                  ))}
                </Box>
                {loading ? (
                  // <ChatLoading />
                  <div>Loading...</div>
                ) : (
                  searchResult
                    ?.slice(0, 4)
                    .map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        handleFunction={() => handleGroup(user)}
                      />
                    ))
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={handleSubmit} colorScheme="blue">
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      );
}

export default GroupChatModel
