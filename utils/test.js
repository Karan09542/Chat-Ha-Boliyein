// Online Javascript Editor for free
// Write, Edit and Run your Javascript code using JS Online Compiler
async function validateUrl(url) {
  try {
    const res = await fetch(`${url}`);
    console.log({ url, isOk: res.ok });
    return res.ok; // returns true for 2xx responses
  } catch (err) {
    return false;
  }
}

const entityMap = {
  0: {
    type: "LINK",
    mutability: "MUTABLE",
    data: {
      url: "https://officialwebsite.com",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "link",
    },
  },
  1: {
    type: "LINK",
    mutability: "IMMUTABLE",
    data: {
      url: "https://om.com",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "link",
    },
  },
};

async function getValidEntityMap() {
  let newEntityMap = {};
  for (let [key, entity] of Object.entries(entityMap)) {
    const isValid = await validateUrl(entity?.data?.url || entity?.data?.src);
    if (isValid) {
      newEntityMap[Object.keys(newEntityMap).length] = entity;
    }
  }
  console.log(newEntityMap);
}
// getValidEntityMap()

// const text = `{
//   "blocks": [
//     {
//       "key": "a1b2c",
//       "text": "✨ Ashutosh Shashank Shekhar's Bhajans ✨",
//       "type": "header-one",
//       "depth": 0,
//       "inlineStyleRanges": [
//         {
//           "offset": 0,
//           "length": 36,
//           "style": "BOLD"
//         }
//       ],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "d3e4f",
//       "text": "I don't have specific information about an individual named Ashutosh Shashank Shekhar who performs bhajans. This could be referring to either a single person with this full name or possibly multiple individuals.",
//       "type": "unstyled",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "g5h6i",
//       "text": "About Bhajans 🎵",
//       "type": "header-two",
//       "depth": 0,
//       "inlineStyleRanges": [
//         {
//           "offset": 0,
//           "length": 14,
//           "style": "BOLD"
//         }
//       ],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "j7k8l",
//       "text": "Bhajans are devotional songs in the Hindu tradition that express love and devotion to deities. They are commonly performed during religious ceremonies, temple gatherings, and private worship. These songs typically include:",
//       "type": "unstyled",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "m9n0o",
//       "text": "• Melodious compositions with religious themes",
//       "type": "unordered-list-item",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "p1q2r",
//       "text": "• Lyrics that praise deities or tell stories from religious texts",
//       "type": "unordered-list-item",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "s3t4u",
//       "text": "• Often accompanied by instruments like harmonium, tabla, and manjira",
//       "type": "unordered-list-item",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "v5w6x",
//       "text": "• Call-and-response format where the lead singer is followed by a chorus",
//       "type": "unordered-list-item",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "y7z8a",
//       "text": "Popular Bhajan Performers 🎤",
//       "type": "header-two",
//       "depth": 0,
//       "inlineStyleRanges": [
//         {
//           "offset": 0,
//           "length": 27,
//           "style": "BOLD"
//         }
//       ],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "b9c0d",
//       "text": "Some well-known bhajan singers include Anup Jalota, Narendra Chanchal, Anuradha Paudwal, and Sonu Nigam. If you're looking for specific bhajans by Ashutosh Shashank Shekhar, you might want to search on music platforms like Spotify, YouTube, or other Indian music services.",
//       "type": "unstyled",
//       "depth": 0,
//       "inlineStyleRanges": [
//         {
//           "offset": 30,
//           "length": 11,
//           "style": "BOLD"
//         },
//         {
//           "offset": 43,
//           "length": 18,
//           "style": "BOLD"
//         },
//         {
//           "offset": 63,
//           "length": 17,
//           "style": "BOLD"
//         },
//         {
//           "offset": 86,
//           "length": 10,
//           "style": "BOLD"
//         }
//       ],
//       "entityRanges": [],
//       "data": {}
//     },
//     {
//       "key": "e1f2g",
//       "text": "If you're interested in listening to or learning bhajans, I'd be happy to provide more information about popular bhajans, their meanings, or how to get started with devotional music! 🙏",
//       "type": "unstyled",
//       "depth": 0,
//       "inlineStyleRanges": [],
//       "entityRanges": [],
//       "data": {}
//     }
//   ],
//   "entityMap": {}
// }`

const text = `<think>\nOkay, let me try to figure out how to respond to this user's query. They want the response converted into a valid Draft.js rawContentState JSON format. The user input is \"har har mahadev,\" which is a Hindu devotional chant praising Lord Shiva. \n\nFirst, I need to follow the core rules. The response must start with a helpful answer and then provide the JSON. But the user emphasized that the final response should be only the JSON, so maybe the initial text is just for me to structure, but the actual output is JSON. Wait, the instructions say the final response must be only the raw Draft.js JSON with no extra text. So I need to make sure that the JSON is correct and meets all the requirements.\n\nLooking at the rules, the JSON must have blocks and entityMap. Each block needs key, text, type, depth, inlineStyleRanges, entityRanges, and data (optional). Since the user input is simple text without any links, images, etc., I don't need to include entities. But I should check if there are any specific structures. The example in search result [5] shows a block with type \"unstyled\", depth 0, and empty arrays for inlineStyleRanges and entityRanges. \n\nI need to generate a unique key for the block. Maybe using a random string like \"abc1\". The text is \"Har Har Mahadev 🙏\", including an emoji as per the core rule 1. The type should be \"header-three\" to make it a heading, but the user didn't specify headings. Wait, rule 11 says to use header types for titles. Since \"Har Har Mahadev\" is a chant, maybe using a header makes it stand out. Alternatively, \"unstyled\" is the default. But the user wants it aesthetically pleasing, so maybe using a header. Let's go with \"header-three\" for an H3 style.\n\nInline styles: if I want to emphasize part of the text, but the input is just \"Har Har Mahadev\", so maybe no styles. So inlineStyleRanges and entityRanges can be empty arrays. The entityMap would be an empty object since there are no links or images.\n\nWait, the user's input is simple text, so the JSON structure should have one block. Let me construct that. The key should be unique, perhaps \"b1ito\" as in the example. Text: \"Har Har Mahadev 🙏\". Type: \"header-three\". Depth: 0. inlineStyleRanges and entityRanges empty. Then entityMap is empty. \n\nWait, but the core rules say to include all required keys. Each block must have key, text, type, depth, inlineStyleRanges, entityRanges, data. So even if they're empty, they need to be present. So the block would look like:\n\n{\n  \"blocks\": [\n    {\n      \"key\": \"b1ito\",\n      \"text\": \"Har Har Mahadev 🙏\",\n      \"type\": \"header-three\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [],\n      \"entityRanges\": [],\n      \"data\": {}\n    }\n  ],\n  \"entityMap\": {}\n}\n\nThat should meet all the requirements. No images or links needed here. The emoji is included in the text. The type is a header for visual appeal. All keys are present, even if empty. The JSON is valid and follows the structure from the examples provided in the search results, especially [5]. I think this should work.\n</think>\n\n{\n  \"blocks\": [\n    {\n      \"key\": \"b1ito\",\n      \"text\": \"Har Har Mahadev 🙏\",\n      \"type\": \"header-three\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [],\n      \"entityRanges\": [],\n      \"data\": {}\n    }\n  ],\n  \"entityMap\": {}\n}`;
let match = text.matchAll(/\{\s*"blocks"\s*:/g);
match = [...match].at(-1);
// console.log({ index: text.slice(match.index) });

// if(/\{[\s\S]*?"blocks":[\s\S]*?"entityMap":[\s\S]*\}/.test(text)) {
//   let match = text.match(/\{[\s\S]*?"blocks":[\s\S]*?"entityMap":[\s\S]*\}/)[0]
//   match = match
//   .replace(/\\\\/g, "\\") // Convert \\ to \
//   .replace(/\\n/g, "\\n") // Escape newlines
//   .replace(/\\r/g, "\\r") // Escape carriage returns (optional)
//   .replace(/\\(?!["\\/bfnrtu])/g, "\\\\"); // Escape lone backslashes
//     console.log(match)
//     // console.log(JSON.parse(match).entityMap)
// }

// fetch("https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bhajan_at_ISKCON_Bangalore.jpg/800px-Bhajan_at_ISKCON_Bangalore.jpg").then(res => console.log(res.ok))

// function fixBrackets(str) {
//   const stack = [];
//   const opening = ['(', '{', '['];
//   const closing = [')', '}', ']'];
//   const pairMap = { '(': ')', '{': '}', '[': ']' };

//   let result = '';

//   for (const char of str) {
//     if (opening.includes(char)) {
//       stack.push(char);
//       result += char;
//     } else if (closing.includes(char)) {
//       if (stack.length && opening.includes(stack[stack.length - 1]) && pairMap[stack[stack.length - 1]] === char) {
//         stack.pop();
//         result += char;
//       } else {
//         // Insert missing opening bracket
//         const missingOpen = opening[closing.indexOf(char)];
//         result = missingOpen + result;
//         result += char;
//       }
//     } else {
//       result += char; // Keep non-bracket characters
//     }
//   }

//   // Add missing closing brackets at the end
//   while (stack.length) {
//     const open = stack.pop();
//     result += pairMap[open];
//   }

//   return result;
// }

function fixRawContentStateString(rawString) {
  const sanitized = sanitizeJsonString(rawString);
  let parsed = parseJsonSafely(sanitized);

  if (!parsed || Object.keys(parsed).length === 0) {
    // Manual recovery if JSON.parse fails
    parsed = tryToRecoverFromString(rawString);
  }

  return validateAndRepairRawContentState(parsed);
}

function sanitizeJsonString(input) {
  return input
    .replace(/([\{\[,])\s*([\w$]+)\s*:/g, '$1"$2":') // quote unquoted keys
    .replace(/entityMap"\s*:\s*(?=[,\}])/g, 'entityMap": {}') // replace entityMap: (no value) with {}
    .replace(/entityMap\s*:\s*(?=[,\}])/g, '"entityMap": {}') // unquoted variant
    .replace(/'/g, '"') // single to double quotes
    .replace(/,\s*([}\]])/g, "$1") // remove trailing commas
    .replace(/\n/g, " ") // normalize line breaks
    .replace(/\s+/g, " ") // normalize space
    .trim();
}

function parseJsonSafely(input) {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

// Manual structure recovery
function tryToRecoverFromString(str) {
  const fallback = { blocks: [], entityMap: {} };

  // Try to extract blocks manually
  const blockRegex = /{[^{}]*key[^{}]*}/g;
  const blocks = [];
  let match;
  while ((match = blockRegex.exec(str))) {
    try {
      const blockStr = sanitizeJsonString(match[0]);
      const blockObj = JSON.parse(blockStr);
      blocks.push(blockObj);
    } catch {
      // skip individual broken block
    }
  }

  fallback.blocks = blocks;

  // Try to find entityMap
  const entityMapMatch = str.match(/entityMap\s*:\s*(\{[^}]*\})/);
  if (entityMapMatch) {
    try {
      const entityMapSanitized = sanitizeJsonString(entityMapMatch[1]);
      fallback.entityMap = JSON.parse(entityMapSanitized);
    } catch {
      fallback.entityMap = {};
    }
  }

  return fallback;
}

// Repairs structure
function validateAndRepairRawContentState(raw) {
  const output = {};
  output.entityMap =
    typeof raw.entityMap === "object" && raw.entityMap !== null
      ? raw.entityMap
      : {};

  if (Array.isArray(raw.blocks)) {
    output.blocks = raw.blocks.map((block, index) => {
      const repaired = typeof block === "object" ? { ...block } : {};

      repaired.key =
        typeof repaired.key === "string" ? repaired.key : `block-${index}`;
      repaired.text =
        typeof repaired.text === "string"
          ? repaired.text
          : String(repaired.text ?? "");
      repaired.type =
        typeof repaired.type === "string" ? repaired.type : "unstyled";
      repaired.depth = Number.isInteger(repaired.depth)
        ? repaired.depth
        : parseInt(repaired.depth) || 0;

      repaired.inlineStyleRanges = Array.isArray(repaired.inlineStyleRanges)
        ? repaired.inlineStyleRanges
        : [];

      repaired.entityRanges = Array.isArray(repaired.entityRanges)
        ? repaired.entityRanges
        : [];

      repaired.data =
        typeof repaired.data === "object" && repaired.data !== null
          ? repaired.data
          : {};

      return repaired;
    });
  } else {
    output.blocks = [];
  }

  return output;
}

const str =
  '\n{\n  "blocks": [\n    {\n      "key": "1k1q1",\n      "text": "Here is a simple example of Python code using the Draft.js format.",\n      "type": "unstyled",\n      "depth": 0,\n      "inlineStyleRanges": [],\n      "entityRanges": [],\n      "data": {}\n    },\n    {\n      "key": "2g2g2",\n      "text": "```python\\n# Example Python code\\ndef hello_world(name):\\n    print(f\\"Hello, {name}!\\")\\n\\nhello_world(\\"World\\")\\n```",\n      "type": "code-block",\n      "depth": 0,\n      "inlineStyleRanges": [],\n      "entityRanges": [],\n      "data": {}\n    }\n  ],\n  "entityMap": \n}\n';
// console.log(fixRawContentStateString(str))

// ram = {
//   "type": "GRAPH",
//   "mutability": "IMMUTABLE",
//   "data": {
//     "type": "LINE" || "BAR" || "PIE",
//     "data": "GRAPH_DATA",
//   },
// };

const input = `{"id":"7e26f06e-13ac-4fb1-a4c2-d60a548e5a30","model":"sonar-reasoning-pro","created":1748429565,"usage":{"prompt_tokens":3180,"completion_tokens":1025,"total_tokens":4205,"search_context_size":"low"},"citations":["https://draftjs.org/docs/api-reference-data-conversion","https://github.com/facebook/draft-js/issues/2071","https://www.tuomokankaanpaa.com/blog/simple-easy-way-display-draft-js-content","https://www.draftail.org/docs/content-storage","https://reactrocket.com/post/draft-js-persisting-content/"],"object":"chat.completion","choices":[{"index":0,"finish_reason":"stop","message":{"role":"assistant","content":"<think>\nOkay, let's tackle this query. The user wants a response in Draft.js rawContentState JSON format that includes trigonometric formulas with graphs. First, I need to recall the structure required by Draft.js. From the search results, I see that rawContentState has blocks and entityMap. Each block needs keys like key, text, type, depth, inlineStyleRanges, entityRanges, and data.\n\nThe user specified including graphs, so I should use the entityMap with a GRAPH type. The data for the graph should be Chart.js-compatible. I'll need to create a block with an atomic type and link it to an entity in entityMap.\n\nNext, the trigonometric formulas. Each formula should be in a separate block. Since they include LaTeX, I'll use the LATEX inline style. I'll assign offsets and lengths correctly to apply the style to the LaTeX parts.\n\nHeaders should use header-one or header-two types. Maybe start with a main header for the title, then subheaders for formulas and graphs. \n\nFor the graph block, I'll set the type to 'atomic' and reference an entity in entityMap. The entity will have type GRAPH, mutability IMMUTABLE, and include the graph data. I'll structure the graph data as a line chart with sample data points for sine and cosine.\n\nI need to ensure all keys are unique. Using timestamps or random strings for keys might work. Also, check that inlineStyleRanges and entityRanges have correct offsets and lengths matching the text.\n\nFinally, the entityMap should have entries for each entity referenced. The graph entity will be in entityMap with a data object containing the graph details. Make sure no extra characters are outside the JSON structure and everything is properly formatted.\n</think>\n\n{\n  \"blocks\": [\n    {\n      \"key\": \"a1b2c\",\n      \"text\": \"📐 Essential Trigonometric Formulas with Graphs\",\n      \"type\": \"header-one\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [],\n      \"entityRanges\": []\n    },\n    {\n      \"key\": \"d3e4f\",\n      \"text\": \"Fundamental Identities & Equations\",\n      \"type\": \"header-two\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [],\n      \"entityRanges\": []\n    },\n    {\n      \"key\": \"g5h6i\",\n      \"text\": \"Pythagorean Identity: \\\\(\\\\sin^2(x) + \\\\cos^2(x) = 1\\\\)\",\n      \"type\": \"unstyled\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [\n        {\n          \"offset\": 20,\n          \"length\": 23,\n          \"style\": \"LATEX\"\n        }\n      ],\n      \"entityRanges\": []\n    },\n    {\n      \"key\": \"j7k8l\",\n      \"text\": \"Sum Formula: \\\\(\\\\sin(A \\\\pm B) = \\\\sin A \\\\cos B \\\\pm \\\\cos A \\\\sin B\\\\)\",\n      \"type\": \"unordered-list-item\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [\n        {\n          \"offset\": 12,\n          \"length\": 46,\n          \"style\": \"LATEX\"\n        }\n      ],\n      \"entityRanges\": []\n    },\n    {\n      \"key\": \"m9n0o\",\n      \"text\": \"Graph: Trigonometric Wave Comparison\",\n      \"type\": \"header-two\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [],\n      \"entityRanges\": []\n    },\n    {\n      \"key\": \"p1q2r\",\n      \"text\": \" \",\n      \"type\": \"atomic\",\n      \"depth\": 0,\n      \"inlineStyleRanges\": [],\n      \"entityRanges\": [\n        {\n          \"offset\": 0,\n          \"length\": 1,\n          \"key\": 0\n        }\n      ],\n      \"data\": {\n        \"type\": \"GRAPH\"\n      }\n    }\n  ],\n  \"entityMap\": {\n    \"0\": {\n      \"type\": \"GRAPH\",\n      \"mutability\": \"IMMUTABLE\",\n      \"data\": {\n        \"graph\": {\n          \"type\": \"LINE\",\n          \"data\": {\n            \"labels\": [\"0\", \"π/2\", \"π\", \"3π/2\", \"2π\"],\n            \"datasets\": [\n              {\n                \"label\": \"Sine\",\n                \"data\": [0, 1, 0, -1, 0],\n                \"borderColor\": \"#ff6384\"\n              },\n              {\n                \"label\": \"Cosine\",\n                \"data\": [1, 0, -1, 0, 1],\n                \"borderColor\": \"#36a2eb\"\n              }\n            ]\n          }\n        }\n      }\n    }\n  }\n}"},"delta":{"role":"assistant","content":""}}]}`
const cleaned = input
   .replace(/\\\\\(/g, "")
            .replace(/\\\\\)/g, "")
            .replace(/\\\\/g, "\\")
            .replace(/\\n/g, "\\n")
            .replace(/\\r/g, "\\r")
            .replace(/\\(?!["\\/bfnrtu])/g, "\\\\")
            .replace(/```/g, "");

console.log(cleaned);
