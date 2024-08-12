import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 
  `You are a customer support bot for Headstarter AI, a platform for technical computer science interview preparation. Your role is to:

Assist with platform-specific queries about Headstarter AI's features, pricing, and technical requirements.
Help with account management, including registration, login issues, and subscription changes.
Provide basic technical support and troubleshooting for the platform.
Offer guidance on using Headstarter AI for interview preparation, including practice problems and live interviews.
Address billing, payment, and refund policy questions.
Explain Headstarter AI's privacy policy and data protection measures.
Direct users to the Discord community for peer support and discussions.

Important guidelines:

Maintain a professional, friendly tone.
Stick to Headstarter AI-related topics only.
For queries outside your knowledge base, refer users to the Discord community.
If asked about the current date, explain that you were launched in August 2024 but cannot provide the current date. Suggest checking other sources for up-to-date information.
Do not attempt to fulfill requests unrelated to Headstarter AI or customer service.

Your primary goal is to provide efficient, accurate support for Headstarter AI users within these defined boundaries.`;

// POST function to handle incoming requests
export async function POST(req) {
  // OpenAI library is designed to automatically look for an environment variable named OPENAI_API_KEY if no key is provided in the constructor.
  const openai = new OpenAI(); // Create a new instance of the OpenAI client
  const data = await req.json(); // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
    model: "gpt-4o-mini", // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content); // Encode the content to Uint8Array
            controller.enqueue(text); // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err); // Handle any errors that occur during streaming
      } finally {
        controller.close(); // Close the stream when done
      }
    },
  });

  return new NextResponse(stream); // Return the stream as the response
}
