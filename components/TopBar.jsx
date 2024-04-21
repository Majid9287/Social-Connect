"use client"


import { UserButton,useUser } from "@clerk/nextjs";

import { dark } from "@clerk/themes";
import { Logout } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { useRouter } from "next/navigation";
import {useEffect, useState } from "react";
const TopBar = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState({});
  const pathname = usePathname();
  const handleLogout = async () => {
   
  };
  
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


  return (
    <div className="top-0 sticky px-10 py-5 flex items-center justify-between bg-blue-2">
      <Link href="/chats">
       
      </Link>

      <div className="flex items-center gap-8 max-sm:hidden">
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
    </div>
  );
};

export default TopBar;
