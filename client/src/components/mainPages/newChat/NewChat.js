import React, { useContext, useEffect } from 'react'
import {Box} from "@chakra-ui/react"
import { GlobalState } from "../../../globalState";
import SideDrawer from '../miscellaneous/SideDrawer';
import MyChats from '../miscellaneous/MyChats';
import ChatBox from '../miscellaneous/ChatBox';
import { useState } from 'react';
function NewChat(props) {
    const state = useContext(GlobalState);
    const [user] = state.userAPI.user;
    const [fetchAgain, setFetchAgain] = useState(true);
    // const { user } = ChatState();
    // console.log("hello",user)
    const id=props.match.params.id
  return (
    <div style={{ width:"100%"}}>
        {user&&<SideDrawer fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} id={id}/>}
      <Box d='flex' justifyContent="space-between" w='100%' h='90vh' p='10px'>
       {(user&& <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>)}
       {(user&& <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>)}
      </Box>
    </div>
  )
}

export{NewChat}
 