import ChatList from "@components/ChatList"
import Contacts from "@components/Contacts"

const Chats = () => {
  return (
    <div className="h-screen flex justify-between gap-5 px-10 py-3 max-lg:gap-8">
      <div className="w-1/3 max-lg:w-1/2 max-md:w-full">
        <ChatList />
      </div>
      <div className="w-2/3 max-lg:w-1/2 max-md:hidden">
        <Contacts />
      </div>
    </div>
  )
}

export default Chats