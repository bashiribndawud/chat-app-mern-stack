import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/userContext";
import UserAvatar from "../components/UserAvatar";
import Logo from "../components/Logo";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const {
    state: { username, id },
  } = useUserContext();
  const [onlinePeople, setOnlinePeople] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    //    const uniquePeople = [... new Set(people.map(people => people.username))]
    const people = {};
    peopleArray.forEach(({ username, userId }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  //fetch Messages from wss in the backend
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    console.log({e, messageData})
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    }else if("text" in messageData) {
        console.log(messageData)
        setMessages(prevMes => ([...prevMes, {...messageData}]))
    }
  }

  const onlinePeopleExcludingLoggedInUser = { ...onlinePeople };
  delete onlinePeopleExcludingLoggedInUser[id];

//   send message to the wss in the backend
  function handleSubmitNewMessage(evt) {
    evt.preventDefault();
      ws.send(
        JSON.stringify({
          recipient: selectedUserId,
          text: newMessage,
        })
      );
    
    // ws.close();
    setNewMessage("");
    setMessages((prevMes) => [...prevMes, { text: newMessage, isOur: true }]);
  }
  return (
    <div className="h-screen w-screen flex">
      <div className="bg-white w-1/4 py-4">
        <Logo />

        {Object.keys(onlinePeopleExcludingLoggedInUser).map((userId) => (
          <div
            key={userId}
            className={`border-b border-gray-100 flex items-center gap-2 hover:cursor-pointer mt-8 ${
              selectedUserId === userId ? "bg-blue-50" : ""
            }`}
            onClick={() => setSelectedUserId(userId)}
          >
            {userId === selectedUserId && (
              <div className="w-1 h-20 bg-blue-400"></div>
            )}
            <div className="flex gap-2 items-center px-2 py-4">
              {" "}
              <UserAvatar char={onlinePeople[userId].split("")[0]} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Messages Arena */}
      <div className="bg-blue-50 flex-1 p-4 flex flex-col justify-between">
        <div className="flex-grow mb-4 overflow-y-auto overflow-x-hidden">
          {!selectedUserId && (
            <div className="h-full w-full flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-64 h-64 text-blue-200"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
                  clip-rule="evenodd"
                />
              </svg>
              <span className="font-semibold text-2xl text-gray-300 flex items-center justify-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  class="w-9 h-9"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                Start a Conversation
              </span>
            </div>
          )}
          {!!selectedUserId && (
            <div>
                {messages.map(message => (
                    <div>{message.sender === id? 'ME' : ''}{message.text}</div>
                ))}
            </div>
          )}
        </div>
        {/* Input Message */}
        {!!selectedUserId && (
          <form onSubmit={handleSubmitNewMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your messages here..."
              className="p-3 border bg-white rounded flex-grow focus:outline-none text-xl"
              name=""
              id=""
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="bg-blue-500 px-4 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-6 h-6 text-white"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
