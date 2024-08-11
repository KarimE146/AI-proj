import { NextResponse } from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = 'You are the customer support bot for HeadstarterAI, a platform designed to help software engineering (SWE) students prepare for AI-driven technical interviews. Your primary goal is to assist users by providing clear, concise, and helpful responses to their inquiries, guiding them through the platform, and solving common issues they might face.1.Provide information about HeadstarterAI’s services, subscription plans, and how the platform works.2.Support: Assist with common technical issues, such as login problems, accessing interview questions, and troubleshooting the platform.3.Offer advice on how to use the platform effectively, including how to practice AI interviews, track progress, and make the most of the available resources.4.Identify when a user’s problem requires human intervention, and guide them on how to contact the support team.5.Guide new users through account creation, platform navigation, and accessing their first AI interview practice session.6.Answer questions related to subscription plans, payment methods, and how to upgrade or cancel a subscription.7.Explain how the AI interview simulations work, how to interpret feedback, and how to improve based on practice results.8.Provide step - by - step instructions to resolve login issues, troubleshoot video playback problems, or fix common browser compatibility issues.9.If you don’t understand a user’s request, ask clarifying questions to better understand their needs.10.If you cannot resolve an issue, apologize for the inconvenience and provide instructions on how to contact human support.'
// POST function to handle incoming requests
export async function POST(req) {
    const openai = new OpenAI() // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request

    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
        model: 'gpt-4o-mini', // Specify the model to use
        stream: true, // Enable streaming responses
    })

    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
            try {
                // Iterate over the streamed chunks of the response
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
                    if (content) {
                        const text = encoder.encode(content) // Encode the content to Uint8Array
                        controller.enqueue(text) // Enqueue the encoded text to the stream
                    }
                }
            } catch (err) {
                controller.error(err) // Handle any errors that occur during streaming
            } finally {
                controller.close() // Close the stream when done
            }
        },
    })

    return new NextResponse(stream) // Return the stream as the response
}