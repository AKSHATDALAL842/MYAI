"use client";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import Image from "next/image";
import { useState } from "react";
import { Bubblegum_Sans } from "@next/font/google";

// Import the font
const bubblegumSans = Bubblegum_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello, I am an Emotional Support Agent willing to help you through difficult times. How may I be of assistance? `,
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
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: messages }]),
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
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#ffecf2"
    >
      <Typography
        variant="h1"
        className={bubblegumSans.className}
        color="#137a63"
      >
        Emotional Support Agent
      </Typography>
      <Typography
        variant="h6"
        className={bubblegumSans.className}
        color="#137a63"
      >
        Disclaimer: I am not paying for the OpenAI API, so this is not a
        functional chatbot.
      </Typography>
      <Typography
        variant="h6"
        className={bubblegumSans.className}
        color="#137a63"
      >
        Someone pay me $20 USD so this will be functional :)
      </Typography>
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        padding={2}
        spacing={3}
        borderRadius={5}
        bgcolor="white"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
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
                bgcolor={
                  message.role === "assistant" ? "#137a63" : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
                className={bubblegumSans.className}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            label="Send Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              className: bubblegumSans.className,
            }}
            InputLabelProps={{
              className: bubblegumSans.className,
            }}
            borderRadius={2}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            color="secondary"
            className={bubblegumSans.className}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
