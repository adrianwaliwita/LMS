// ExampleChatPage.js
import React from "react";
import Chat from "../components/Chat"; // Adjust the import path as needed

function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      {/* You can pass a specific channel name if needed */}
      <Chat channelName="Student Channel" />
    </div>
  );
}

export default ChatPage;
