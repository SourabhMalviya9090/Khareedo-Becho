import React, { useEffect } from 'react'
import {Box} from "@chakra-ui/react"
import {Tooltip} from '@chakra-ui/react'
import { Spinner } from "@chakra-ui/spinner";
import { useDisclosure } from "@chakra-ui/hooks";
import { useToast } from "@chakra-ui/toast";
import axios from 'axios';
import NotificationBadge from "react-notification-badge";
import {Button ,Input,Text,Menu,MenuButton,Avatar,MenuList,MenuDivider,ProfileModal,MenuItem} from "@chakra-ui/react"
import {
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerHeader,
    DrawerOverlay,
  } from "@chakra-ui/modal";
  import ChatLoading from './ChatLoading';
import {BellIcon, ChevronDownIcon} from "@chakra-ui/icons" 
import { useContext } from 'react'
import { GlobalState } from '../../../globalState'
import { useState } from 'react'
import UserListItem from './UserListItem';
import { Effect } from "react-notification-badge";
// import { GlobalState } from '../../../globalState';
import ProfileModel from './ProfileModel'
// import { use } from 'passport';
function SideDrawer({fetchAgain,setFetchAgain,id}) {
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    // const [state] =useContext(GlobalState)
     
    const getSender = (loggedUser, users) => {
      return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
    };
    const { isOpen, onOpen, onClose } = useDisclosure();
    // const user=false;
    const state = useContext(GlobalState);
    const [user] = state.userAPI.user;
    const [token,setToken]=state.token
    const [chats,setChats] =state.chatAPI.chatRooms
    // console.log("hello there",user)
    const [selectedChat,setSelectedChat]=state.selectedChat
    const [notifications,setNotifications]=state.notifications

    const toast = useToast();
    const handleSearch = async()=>{
        if (!search) {
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
        const {data}= await axios.get(`/user/searchusers?search=${search}`,config)
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
const accessChat =async(id)=>{
       setLoadingChat(true)
       setFetchAgain(false)
       try{
        const config ={
            headers:{
            'content-type':"application/json",
            Authorization: token
            }

        }
        const {data}= await axios.post(`/rooms/userchat`,{userId:id},config)
       setSelectedChat(data)
       setLoadingChat(false)
       setFetchAgain(true)
       onClose()
       }catch(err){
        toast({
            title: "error loading chat..",
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top-left",
          }); 
       }
       setLoadingChat(false)
} 
 useEffect(()=>{
   if(id){
    accessChat(id)
   }
 },[])
  return ( 
    <> 
    <Box d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px" 
        borderWidth="5px">
     <Tooltip label="search a user" hasArrow placement="bottom">
        <Button variant="ghost" onClick={onOpen}><i class="fa-solid fa-magnifying-glass" ></i>
        <Text d={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text></Button>
     </Tooltip>
     <Text fontSize="2xl" fontFamily="Work sans">
          Talk-A-Tive
        </Text>
        <div>
        <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notifications.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2}>
              {!notifications.length && "No New Messages"}
              {notifications.map((notif) => (
                <MenuItem
                  key={notif.latestMessage._id}
                  onClick={() => {
                    setSelectedChat(notif);
                    setNotifications(notifications.filter((n) => n !== notif));
                  }}
                >
                  {notif.isGroupChat
                    ? `New Message in ${notif.chatName}`
                    : `New Message from ${getSender(user, notif.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
            <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={"https://api.multiavatar.com/stefan.svg"}
              />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
                </ProfileModel>
             
              <MenuDivider />
              <MenuItem >Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
    </Box>
    
    <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px" color="white" >Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick ={handleSearch}>Go</Button>
            </Box>
             {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
             
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default SideDrawer
