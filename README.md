# 🗨️ Ha-boliyein Chat App

A real-time chat app with an inbuilt AI assistant that helps users stay informed, engaged, and curious — all without leaving the chat window.

---

## 🧠 Inspiration

What happens when we focus on simple ideas? They evolve into something big. You don’t always need to plan everything in detail — just be ready to **explore, learn, and build**. Small, thoughtful steps can lead to unexpected and meaningful outcomes.

---

## 💬 What It Does

- Real-time chat application with an **AI-powered assistant**.
- Users can ask for:
  - **Live updates**
  - **Current news**
  - **Images**, **YouTube videos**, and **audio clips**
- The AI may also provide **helpful links (hrefs)** to explore more — all without leaving the chat interface.

---

## ⚙️ How We Built It

- Started with an existing chat app that lacked real-time AI capabilities.
- Integrated **Sonar API** to power the AI bot.
- The AI responds with:
  - **Citations**
  - **Media content** (like videos and images)
  - Rich, informative messages that enhance the user experience

---

## 🧩 Challenges We Ran Into

- We use **Draft.js** to render rich media content.
- The Sonar API responses (`data.choices[0].message.content`) often include Draft.js `rawContentState`.
- Parsing these responses safely was challenging — we had to extract valid JSON to avoid errors during `JSON.parse`.

---

## 🏆 Accomplishments We're Proud Of

- Created a powerful chat experience where:
  - Users can stay updated on **current affairs**, **local/global events**, and **economic data** (like GDP).
  - Data can be **visualized** and understood in context — all within a chat.
- Helped users **explore information** without needing to switch apps or tabs.

---

## 📚 What We Learned

- **Focus and concentration** are key to finishing meaningful work quickly.
- Acting without thinking can lead to **confusion and errors**.
- Being mindful during development helps avoid complications and increases efficiency.

---

## 🚀 What's Next for Ha-boliyein Chat App

- Improve robustness and performance
- Make the UI more **intuitive and beginner-friendly**
- Add more smart features to enhance content understanding and interaction

---

## 🛠️ Tech Stack

- **React** (Frontend)
- **Draft.js** (Rich text editor)
- **Node.js** / **Express** (Backend)
- **Sonar API** (AI Responses)
- **WebSockets / Socket.io** (Real-time communication)

---


## 🔐 Environment Variables Setup

### 🧩 Frontend (`apps/web/.env.local`)

Create a `.env.local` file inside the `apps/web` directory and add:

```env
SONAR_API_KEY=
PEXELS_API_KEY=
```

Replace the values with your actual API keys.

## ⚙️ Backend (apps/server/.env)
### Create a .env file inside the apps/server directory and add:

```env
REDIS_URL=mandatory
REDIS_PASSWORD=mandatory
NODE_ENV=production
DB_URL= mongodb-atlas mandatory
DB_PASSWORD = passowrd mandatory
```

Make sure to replace placeholders like mandatory, mongodb-atlas, and password with your actual credentials

# run npm install on (root-level, apps/server, app/web)
