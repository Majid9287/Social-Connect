"use client";


import { useUser } from "@clerk/nextjs";
import { use, useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import Loader from "./Loader";
import { pusherClient } from "@lib/pusher";

const ChatList = ({ currentChatId }) => {
 

  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState({});

  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const getUser = async () => {
    const response = await fetch(`/api/user/${user.id}`);
    const data = await response.json();
    setUserData(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const getChats = async () => {
    try {
      const res = await fetch(
        search !== ""
          ? `/api/users/${userData._id}/searchChat/${search}`
          : `/api/users/${userData._id}`
      );
      const data = await res.json();
      setChats(data);
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userData) {
      getChats();
    }
  }, [userData, search]);

  useEffect(() => {
    if (userData && userData._id && pusherClient) {
      pusherClient.subscribe(userData._id);

      const handleChatUpdate = (updatedChat) => {
        setChats((allChats) =>
          allChats.map((chat) => {
            if (chat._id === updatedChat.id) {
              return { ...chat, messages: updatedChat.messages };
            } else {
              return chat;
            }
          })
        );
      };

      const handleNewChat = (newChat) => {
        setChats((allChats) => [...allChats, newChat]);
      }

      pusherClient.bind("update-chat", handleChatUpdate);
      pusherClient.bind("new-chat", handleNewChat);

      return () => {
        pusherClient.unsubscribe(userData._id);
        pusherClient.unbind("update-chat", handleChatUpdate);
        pusherClient.unbind("new-chat", handleNewChat);
      };
    }
  }, [userData]);

  return loading ? (
    <Loader />
  ) : (
    <div className="h-screen flex flex-col gap-5 pb-20">
      <input
        placeholder="Search chat..."
        className="px-5 py-3 rounded-2xl bg-white outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex-1 flex flex-col bg-white rounded-3xl py-4 px-3 overflow-y-scroll custom-scrollbar">
        {chats?.map((chat, index) => (
          <ChatBox
            chat={chat}
            index={index}
            currentUser={userData}
            currentChatId={currentChatId}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatList;
