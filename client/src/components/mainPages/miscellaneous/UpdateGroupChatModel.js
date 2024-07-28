import React from 'react'
import { ViewIcon } from "@chakra-ui/icons";
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
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
// import { ChatState } from "../../Context/ChatProvider";
// import UserBadgeItem from "../userAvatar/UserBadgeItem"
import UserBadgeItem from './UserBadgeItem';
import UserListItem from './UserListItem';
import { GlobalState } from '../../../globalState';
import { useContext } from 'react';
function UpdateGroupChatModel({ fetchMessages, fetchAgain, setFetchAgain }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameloading, setRenameLoading] = useState(false);
  const toast = useToast();
 const state=useContext(GlobalState);
  const [selectedChat, setSelectedChat]=state.selectedChat;
  const [user] =state.userAPI.user
  const [token]= state.token
  const handleRename =async()=>{
    if(user._id!==selectedChat.groupAdmin){
      //  console.log(user._id,selectedChat.groupAdmin)
      setFetchAgain(false)
      toast({
        title: "Only Admins are allowed to change Group Name///",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      }); 
      return
    }
    try{
      setRenameLoading(true)
      const config ={
        headers:{
        Authorization: token
        }
    }
    const {data}= await axios.patch(`/rooms/renamegroupchat`,{id:selectedChat._id,name:groupChatName},config)
    setRenameLoading(false)
    onClose();
    setSelectedChat({})
    setFetchAgain(true)
    toast({
      title: "Group Name changed Successfully...",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "top-left",
    }); 
    }
    catch(err){
      toast({
        title: "Error Changing Group Name...",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      }); 
    }

  }
  const handleSearch = async(value)=>{
    if (!value) {
        toast({
          title: "Please Enter something in search",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        }); 
        return;
}
try{
    setLoading(true)
    const config ={
        headers:{
        Authorization: token
        }
    }
    const {data}= await axios.get(`/user/searchusers?search=${value}`,config)
    // console.log("data ",data)
    setLoading(false)
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
}
const handleAddUser = async(u)=>{
       const {users}= selectedChat
       setFetchAgain(false)
       if(user._id!==selectedChat.groupAdmin){
        //  console.log(user._id,selectedChat.groupAdmin)
        // setFetchAgain(false)
        toast({
          title: "Only Admins are allowed to add User!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        }); 
        
        return
      }
       if(users.find(({_id})=>_id===u._id)){
        toast({
          title: "user already in Group!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        }); 
        return
       }
       try{
        const config ={
          headers:{
          Authorization: token
          }
        

      }
      const {data}= await axios.patch(`/rooms/addusertogroup`,{id:selectedChat._id,userId:u._id},config) 
      toast({
        title: "user added to group!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      }); 
      
      setFetchAgain(true)
      setSelectedChat(data)
      // onClose()
       }
       catch(err){
        toast({
          title: "error adding user!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-left",
        }); 
       }

}
const handleRemove =async(u)=>{
  setFetchAgain(false)
  if(user._id!==selectedChat.groupAdmin){
   //  console.log(user._id,selectedChat.groupAdmin)
   // setFetchAgain(false)
   toast({
     title: "Only Admins are allowed to Remove Users!",
     status: "warning",
     duration: 5000,
     isClosable: true,
     position: "top-left",
   }); 
   
   return
 }
 try{
  const config ={
    headers:{
    Authorization: token
    }
  

}
const {data}= await axios.patch(`/rooms/removeuserfromgroup`,{id:selectedChat._id,userId:u._id},config) 
toast({
  title: "user removed from group!",
  status: "success",
  duration: 5000,
  isClosable: true,
  position: "top-left",
}); 

setFetchAgain(true)
setSelectedChat(data)
// onClose()
 }
 catch(err){
  toast({
    title: "error removing user!",
    status: "warning",
    duration: 5000,
    isClosable: true,
    position: "top-left",
  }); 
 }
}
const handleSelfRemove =async ()=>{
  setFetchAgain(false)
  try{
    const config ={
      headers:{
      Authorization: token
      }
    
  
  }
  const {data}= await axios.patch(`/rooms/removeuserfromgroup`,{id:selectedChat._id,userId:user._id},config) 
  toast({
    title: "group leaved!",
    status: "success",
    duration: 5000,
    isClosable: true,
    position: "top-left",
  }); 
  
  setFetchAgain(true)
  setSelectedChat({})
  onClose()
   }
   catch(err){
    toast({
      title: "error leaving group!",
      status: "warning",
      duration: 5000,
      isClosable: true,
      position: "top-left",
    }); 
   }
}
    return (
        <>
          <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
    
          <Modal onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
                fontSize="35px"
                fontFamily="Work sans"
                d="flex"
                justifyContent="center"
              >
                {selectedChat.chatName}
              </ModalHeader>
    
              <ModalCloseButton />
              <ModalBody d="flex" flexDir="column" alignItems="center">
                <Box w="100%" d="flex" flexWrap="wrap" pb={3}>
                  {selectedChat.users.map((u) => (
                    <UserBadgeItem
                      key={u._id}
                      user={u}
                      admin={selectedChat.groupAdmin}
                      handleFunction={() => handleRemove(u)}
                    />
                  ))}
                </Box>
                <FormControl d="flex">
                  <Input
                    placeholder="Chat Name"
                    mb={3}
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                  <Button
                    variant="solid"
                    colorScheme="teal"
                    ml={1}
                    isLoading={renameloading}
                    onClick={handleRename}
                  >
                    Update 
                  </Button>
                </FormControl>
                <FormControl>
                  <Input
                    placeholder="Add User to group"
                    mb={1}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </FormControl>
    
                {loading ? (
                  <Spinner size="lg" />
                ) : (
                  searchResult?.map((user) => (
                    <UserListItem
                      key={user._id}
                      user={user}
                      handleFunction={() => handleAddUser(user)}
                    />
                  ))
                )}
              </ModalBody>
              <ModalFooter>
                <Button onClick={handleSelfRemove} colorScheme="red">
                  Leave Group
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      );
}

export default UpdateGroupChatModel
