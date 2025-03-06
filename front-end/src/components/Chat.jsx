// StyledChat.js - Improved Chat component with new styling
import React, { useState, useEffect, useRef } from "react";
import { usePubNub } from "pubnub-react";
import { useAuth } from "../context/AuthContext"; // Adjust the import path as needed

function Chat({ channelName = "default-channel" }) {
  const pubnub = usePubNub();
  const { user } = useAuth(); // Assuming your AuthContext provides a user object
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const processedMessages = useRef(new Set()); // Track processed message IDs

  useEffect(() => {
    // If using the actual user ID from auth context
    if (user && user.id) {
      pubnub.setUUID(user.id);
    }

    const handleMessage = (event) => {
      const messageId = event.timetoken;

      // Skip if we've already processed this message
      if (processedMessages.current.has(messageId)) {
        return;
      }

      // Mark this message as processed
      processedMessages.current.add(messageId);

      const message = event.message;
      if (typeof message === "string" || message.text) {
        setMessages((msgs) => [
          ...msgs,
          {
            id: messageId,
            author: event.publisher,
            text: typeof message === "string" ? message : message.text,
            timetoken: messageId,
            userName: message.userName || null,
          },
        ]);
      }
    };

    pubnub.addListener({ message: handleMessage });
    pubnub.subscribe({ channels: [channelName] });

    pubnub.fetchMessages(
      { channels: [channelName], count: 20 },
      (status, response) => {
        if (status.statusCode === 200 && response.channels[channelName]) {
          const history = response.channels[channelName].map((msg) => {
            const messageId = msg.timetoken;
            // Mark historical messages as processed too
            processedMessages.current.add(messageId);

            return {
              id: messageId,
              author: msg.uuid || msg.publisher,
              text:
                typeof msg.message === "string"
                  ? msg.message
                  : msg.message.text,
              timetoken: messageId,
              userName: msg.message.userName || null,
            };
          });

          setMessages(history);
        }
      }
    );

    return () => {
      pubnub.removeListener({ message: handleMessage });
      pubnub.unsubscribe({ channels: [channelName] });
    };
  }, [pubnub, channelName, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      // Generate a unique message ID for local reference
      const clientMessageId = `local-${Date.now()}`;

      // First add the message optimistically to the UI
      const messagePayload = {
        text: input,
        time: Date.now(),
        userName: user?.name || "Anonymous",
        userId: user?.id || pubnub.getUUID(),
      };

      pubnub.publish(
        {
          channel: channelName,
          message: messagePayload,
        },
        (status, response) => {
          if (status.error === false) {
            processedMessages.current.add(response.timetoken);
          }
        }
      );

      setInput("");
    }
  };

  return (
    <div className="w-full max-w-lg flex flex-col h-96 border-2 border-blue-700 rounded-lg overflow-hidden bg-white shadow">
      <div className="bg-blue-700 text-white p-3">
        <h2 className="text-lg font-bold">Chat Room</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 italic py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-3/4 rounded-lg p-3 ${
                message.author === pubnub.getUUID()
                  ? "ml-auto bg-blue-100 border border-blue-300"
                  : "mr-auto bg-gray-100 border border-gray-300"
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  message.author === pubnub.getUUID()
                    ? "text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {message.userName || message.author}
              </div>
              <div className="mt-1">{message.text}</div>
              <div className="text-xs text-right mt-1 opacity-75">
                {new Date(
                  parseInt(message.timetoken) / 10000
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-300 p-3 bg-gray-50">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
          <button
            onClick={handleSend}
            className="bg-blue-700 text-white px-4 py-2 rounded-r-lg hover:bg-blue-800 transition-colors focus:outline-none"
            disabled={!input.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
