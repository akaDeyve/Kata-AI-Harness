import { useState, useRef } from "react";
import "./AIModal.css";
import { GoogleGenAI } from "@google/genai";
import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
});

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY,
});

function AIModal() {
  const [promt, setPromt] = useState("say hello");
  const [aiOutput, setAiOutput] = useState("");

  async function main() {
    setAiOutput("");
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-flash-lite-latest",
      contents: [{ text: promt }],
    });

    let fullResponse = "";
    for await (const chunk of responseStream) {
      fullResponse += chunk.text;
      setAiOutput(fullResponse);
    }

    // const responseStream = await openrouter.chat.send({
    //   chatRequest: {
    //     model: "nvidia/nemotron-3-super-120b-a12b:free",
    //     messages: [
    //       {
    //         role: "user",
    //         content: promt,
    //       },
    //     ],
    //     stream: true,
    //   },
    // });

    // let response = "";
    // for await (const chunk of responseStream) {
    //   const content = chunk.choices[0]?.delta?.content;
    //   if (content) {
    //     response += content;
    //     setAiOutput(response);
    //   }
    // }
  }
  return (
    <>
      <div className="ai-modal">
        <p className="ai-modal-output">{aiOutput}</p>
        <div className="ai-modal-input">
          <textarea
            value={promt}
            onChange={(e) => setPromt(e.target.value)}
            className="ai-modal-textarea"
            placeholder="Enter your prompt here..."
          ></textarea>

          <button onClick={main} className="ai-modal-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 24 24"
              width="36"
              height="36"
            >
              <path d="m21.916,8.727L3.965.282C2.951-.211,1.756-.041.917.713.076,1.47-.216,2.646.172,3.708c.017.043,4.411,8.296,4.411,8.296,0,0-4.313,8.251-4.328,8.293-.387,1.063-.092,2.237.749,2.993.521.467,1.179.708,1.841.708.409,0,.819-.092,1.201-.279l17.872-8.438c1.285-.603,2.083-1.859,2.082-3.278,0-1.42-.801-2.675-2.084-3.275ZM2.032,2.967c-.122-.415.138-.69.223-.768.089-.079.414-.324.838-.116.005.002,17.974,8.455,17.974,8.455.239.112.438.27.591.462H6.315L2.032,2.967Zm19.034,10.504L3.178,21.917c-.425.209-.749-.035-.838-.116-.086-.076-.346-.353-.223-.769l4.202-8.032h15.345c-.153.195-.355.357-.597.471Z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

export default AIModal;
