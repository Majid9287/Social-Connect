"use client"

import ChatDetails from "@components/ChatDetails"
import ChatList from "@components/ChatList"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs";
import {useEffect, useState } from "react"; 

const ChatPage = () => {
  const { chatId } = useParams()


  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState({});
  const getUser = async () => {
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const seenMessages = async () => {
    try {
      await fetch (`/api/chats/${chatId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentUserId: userData._id
        })
      })
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (userData && chatId) seenMessages()
  }, [userData, chatId])

  return (
    <div className="h-screen flex justify-between gap-5 px-2 md:px-10 md:py-3 max-lg:gap-8">
      <div className="w-1/3 max-lg:hidden"><ChatList currentChatId={chatId}/></div>
      <div className="w-2/3 max-lg:w-full"><ChatDetails chatId={chatId}/></div>
    </div>
  )
}

export default ChatPage