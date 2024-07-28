import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
// import { ChatState } from "../Context/ChatProvider";
import { GlobalState } from "../../../globalState";
import { useContext } from "react";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const state = useContext(GlobalState);
  const [selectedChat,setSelectedChat] =state.selectedChat
  
  return (
    <Box
      d={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bg="white"
      w={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default Chatbox;