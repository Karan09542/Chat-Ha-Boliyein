import clipboard from "clipboardy";

const token = process.env.SONAR_API_KEY;

const options = (input: string) => ({
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "sonar-reasoning-pro",
    messages: [
      { role: "system", content: "Be precise and concise." },
      { role: "user", content: input },
    ],
  }),
});

const generateResponse = async (input: string) => {
 try {
   const res = await fetch("https://api.perplexity.ai/chat/completions", options(input));
   const data = await res.json();
   clipboard.writeSync(JSON.stringify(data));
   return data.choices[0].message.content;
 } catch (error) {
   console.error("AI Error:", error);
   return `{
      blocks: [
        {
          key: "error",
          text: "राधे राधे 🙏 | Something went wrong, कृपया थोड़ी देर बाद फिर प्रयास करें। हर हर महादेव 🔱",
          type: "header-one",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {}
        }
      ],
      entityMap: {}
    };`
  }
};

export { generateResponse };
