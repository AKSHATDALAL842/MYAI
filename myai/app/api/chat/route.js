"use client";
import { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome to MYAI, How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (message.trim() === "") return; // Prevent sending empty messages

    const userMessage = { role: "user", content: message };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, userMessage]),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      const processText = async ({ done, value }) => {
        if (done) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: result },
          ]);
          return;
        }

        const text = decoder.decode(value, { stream: true });
        result += text;

        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage.role === "assistant") {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, content: lastMessage.content + text },
            ];
          } else {
            return [...prevMessages, { role: "assistant", content: text }];
          }
        });

        reader.read().then(processText);
      };

      reader.read().then(processText);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

  return (
    <Box bgcolor="#121212">
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          direction="column"
          width="600px"
          height="700px"
          border="1px solid #333"
          borderRadius="10px"
          p={2}
          spacing={3}
          bgcolor="#181818"
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            sx={{
              paddingRight: "10px",
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#555",
                borderRadius: "16px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#282828",
              },
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={message.role === "assistant" ? "#282828" : "#AF47D2"}
                  color="#e0e0e0"
                  borderRadius="7px"
                  p={2}
                  border={`1px solid ${
                    message.role === "assistant" ? "#444" : "#AF47D2"
                  }`}
                >
                  {message.content}
                </Box>
              </Box>
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              "& .MuiTextField-root": {
                "& .MuiInputBase-input": {
                  color: "#e0e0e0",
                },
                "& .MuiInputLabel-root": {
                  color: "#444",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#444",
                },
              },
            }}
          >
            <TextField
              label="Message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              InputLabelProps={{
                sx: {
                  "&.Mui-focused": {
                    color: "#AF47D2",
                  },
                  "&:hover": {
                    color: "#555",
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                backgroundColor: "#AF47D2",
                "&:hover": {
                  backgroundColor: "#9242ad",
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
