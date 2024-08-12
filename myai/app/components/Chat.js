import {
  Box,
  Button,
  Stack,
  TextField,
  Avatar,
  createTheme,
  ThemeProvider,
  IconButton,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReplayIcon from "@mui/icons-material/Replay";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SessionProvider } from "next-auth/react";

const customTheme = createTheme({
  palette: {
    primary: { main: "#F5631A" },
    secondary: { main: "#FC2E20" },
    error: { main: "#D41E00" },
    background: {
      default: "#0A0A0A",
      paper: "#FFF3E0",
    },
    text: {
      primary: "#ffffff",
      secondary: "#000000",
    },
  },
});

export default function Chat() {
  const { data: session } = useSession();
  const [markdownContent, setMarkdownContent] = useState("# Hello, Markdown!");

  // chat system prompt
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm the Headstarter AI Support Assistant. How can I help you today?",
    },
  ]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Function to send a message
  const sendMessage = async (userMessage) => {
    if (!userMessage.trim() || isLoading) return;
    setIsLoading(true);

    setMessages((messages) => [
      ...messages,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ...messages,
          { role: "user", content: userMessage },
        ]),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((messages) => [
        ...messages,
        {
          role: "assistant",
          content:
            "I'm sorry, but I encountered an error. Please try again later.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(message);
      setMessage(""); // Clear the message input after sending
    }
  };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!session) {
    return null;
  }

  const getAvatarSrc = () => {
    return "/favicon.ico"; // Path to the favicon.ico inside the app folder for the assistant's avatar
  };

  // Handle copying the message content to the clipboard
  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    alert("Message copied to clipboard!");
  };

  // Handle regenerating the bot's response using the last user input
  const handleRegenerate = async () => {
    const lastUserMessage = messages
      .reverse()
      .find((msg) => msg.role === "user")?.content;
    if (lastUserMessage) {
      sendMessage(lastUserMessage);
    }
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
      >
        <Button
          variant="outlined"
          onClick={() => signOut()}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            color: "text.secondary",
            borderColor: "text.secondary",
          }}
        >
          Sign out
        </Button>
        <Stack
          direction={"column"}
          width="80vw"
          height="80vh"
          border="1px solid #FFF3E0"
          p={4}
          spacing={3}
          bgcolor="background.paper"
          borderRadius={4}
        >
          <Stack
            direction={"column"}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
            p={2}
            sx={{
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                width: "0.4em",
              },
              "&::-webkit-scrollbar-track": {
                background: "#2e2e2e",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888",
                borderRadius: "10px",
              },
              // Table styles rendering for the chat messages
              table: {
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "1rem",
                marginTop: "1rem",
              },
              th: {
                border: "1px solid #ddd",
                padding: "0.5rem",
                backgroundColor: "#808080",
              },
              td: {
                border: "1px solid #ddd",
                padding: "0.5rem",
              },
            }}
          >
            {messages.map((message, index) => (
              <Box key={index} display="flex" flexDirection="column">
                <Box
                  display="flex"
                  justifyContent={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                >
                  {message.role === "assistant" && (
                    <Avatar
                      src={getAvatarSrc()}
                      alt="Assistant"
                      sx={{ width: 40, height: 40, mr: 2 }}
                    />
                  )}
                  <Box
                    bgcolor={
                      message.role === "assistant"
                        ? "primary.main"
                        : "secondary.main"
                    }
                    color="text.primary"
                    p={2}
                    maxWidth="75%"
                    wordWrap="break-word"
                    sx={{
                      borderRadius: 8,
                      boxShadow: 1, // Slight shadow for some depth
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </Box>
                </Box>

                {message.role === "assistant" && (
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-start"
                    mt={1}
                  >
                    <IconButton
                      onClick={() => handleCopy(message.content)}
                      size="small"
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={handleRegenerate} size="small">
                      <ReplayIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack direction={"row"} spacing={2}>
            <TextField
              label="Type your message..."
              variant="outlined"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              InputLabelProps={{
                style: { color: customTheme.palette.text.secondary },
              }}
              InputProps={{
                style: { color: customTheme.palette.text.primary },
              }}
              sx={{
                input: {
                  color: customTheme.palette.text.secondary, // Set input text color to black
                },
              }}
            />
            <Button
              variant="contained"
              onClick={() => sendMessage(message)}
              disabled={isLoading}
              sx={{
                bgcolor: "primary.main",
                color: "text.primary",
                borderRadius: 8,
              }}
            >
              {isLoading ? "Sending..." : <ArrowUpwardIcon color="white" />}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
