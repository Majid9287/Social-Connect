"use client"

import { Logout } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {UserButton, useUser } from "@clerk/nextjs";

import { dark } from "@clerk/themes";

import { useRouter } from "next/navigation";
import {useEffect, useState } from "react";
const BottomBar = () => {
  const router = useRouter();
  const pathname = usePathname();
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
  const handleLogout = async () => {
  
  };


  return (
    <div className="fixed bottom-0 z-50 w-full flex justify-between items-center px-5 py-2 bg-white sm:hidden">
      <Link
        href="/chats"
        className={`${
          pathname === "/chats" ? "text-red-1" : ""
        } text-heading4-bold`}
      >
        Chats
      </Link>
      <Link
        href="/contacts"
        className={`${
          pathname === "/contacts" ? "text-red-1" : ""
        } text-heading4-bold`}
      >
        Contacts
      </Link>

      <Logout
        sx={{ color: "#737373", cursor: "pointer" }}
        onClick={() => router.push("/")}
      />

    
<UserButton appearance={{ baseTheme: dark }} afterSignOutUrl="/sign-in"/>
      
    </div>
  );
};

export default BottomBar;
