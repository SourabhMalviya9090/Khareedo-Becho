import React, {useState, useEffect} from 'react';
import axios from 'axios';

export default function ChatAPI(token) {
    const [chats, setChats] = useState([]);
      
    return {
      chatRooms: [chats, setChats],
    };
}
