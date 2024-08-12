"use client";
import Image from "next/image";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useState } from "react";
import { Box, Button, TextField, Stack } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Welome to MYAI, How can I help you today?`,
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Int8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
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
              paddingRight: "10px", // Add padding to the right to create space between the scrollbar and text boxes
              "&::-webkit-scrollbar": {
                width: "6px", // Width of the scrollbar
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#555", // Color of the scrollbar thumb
                borderRadius: "16px", // Rounded corners of the scrollbar thumb
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#282828", // Color of the scrollbar track
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
                  }`} // Conditional border color
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
                  color: "#e0e0e0", // Change text color here
                },
                "& .MuiInputLabel-root": {
                  color: "#444", // Change label color here
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#444", // Change border color here
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
                    color: "#AF47D2", // Color when the input is focused
                  },
                  "&:hover": {
                    color: "#555", // Color on hover
                  },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              sx={{
                backgroundColor: "#AF47D2", // Initial background color
                "&:hover": {
                  backgroundColor: "#9242ad", // Background color on hover
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
