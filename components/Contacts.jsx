"use client";


import { useEffect, useState } from "react";
import Loader from "./Loader";
import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { useUser } from "@clerk/nextjs";
const Contacts = () => {
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");


  const { user, isLoaded } = useUser();
  const [userData, setUserData] = useState({});
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

  const getContacts = async () => {
    try {
      const res = await fetch(
        search !== "" ? `/api/users/searchContact/${search}` : "/api/users"
      );
      const data = await res.json();
      setContacts(data.filter((contact) => contact._id !== userData._id));
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (userData) getContacts();
  }, [userData, search]);

  /* SELECT CONTACT */
  const [selectedContacts, setSelectedContacts] = useState([]);
  const isGroup = selectedContacts.length > 1;

  const handleSelect = (contact) => {
    if (selectedContacts.includes(contact)) {
      setSelectedContacts((prevSelectedContacts) =>
        prevSelectedContacts.filter((item) => item !== contact)
      );
    } else {
      setSelectedContacts((prevSelectedContacts) => [
        ...prevSelectedContacts,
        contact,
      ]);
    }
  };

  /* ADD GROUP CHAT NAME */
  const [name, setName] = useState("");

  const router = useRouter();

  /* CREATE CHAT */
  const createChat = async () => {
    const res = await fetch("/api/chats", {
      method: "POST",
      body: JSON.stringify({
        currentUserId: userData._id,
        members: selectedContacts.map((contact) => contact._id),
        isGroup,
        name,
      }),
    });
    const chat = await res.json();

    if (res.ok) {
      router.push(`/chats/${chat._id}`);
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="flex flex-col gap-5">
      <input
        placeholder="Search contact..."
        className="px-5 py-3 rounded-2xl bg-white outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex gap-7 items-start max-lg:flex-col">
        <div className="h-screen w-1/2 max-lg:w-full flex flex-col gap-5 bg-white rounded-3xl py-5 px-8 mb-20">
          <p className="text-body-bold">Select or Deselect</p>

          <div className="flex flex-col flex-1 gap-5 overflow-y-scroll custom-scrollbar">
            {contacts.map((user, index) => (
              <div
                key={index}
                className="flex gap-3 items-center cursor-pointer"
                onClick={() => handleSelect(user)}
              >
                {selectedContacts.find((item) => item === user) ? (
                  <CheckCircle sx={{ color: "red" }} />
                ) : (
                  <RadioButtonUnchecked />
                )}
                <img
                  src={user.profilePhoto || "/assets/person.jpg"}
                  alt="profile"
                  className="w-11 h-11 rounded-full object-cover object-center"
                />
                <p className="text-base-bold">{user.username}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/2 max-lg:w-full flex flex-col gap-7">
          {isGroup && (
            <>
              <div className="flex flex-col gap-3">
                <p className="text-body-bold">Group Chat Name</p>
                <input
                  placeholder="Enter group chat name..."
                  className="bg-white rounded-2xl px-5 py-3 outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-body-bold">Members</p>
                <div className="flex flex-wrap gap-3">
                  {selectedContacts.map((contact, index) => (
                    <p className="text-base-bold p-2 bg-pink-1 rounded-lg" key={index}>
                      {contact.username}
                    </p>
                  ))}
                </div>
              </div>
            </>
          )}
          <button
            className="flex items-center justify-center rounded-xl p-3 bg-gradient-to-l from-blue-1 to-blue-3 text-body-bold text-white"
            onClick={createChat}
            disabled={selectedContacts.length === 0}
          >
            FIND OR START A NEW CHAT
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
