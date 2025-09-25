🎬 WatchTogether (WIP)

WatchTogether is an application that allows people to watch movies together in real time, with features for video synchronization, room management, and live chat.
The project is currently under development.

🚀 Tech Stack
Backend

Java 21 + Spring Boot 3

Spring Security (JWT Authentication)

Spring Data JPA + PostgreSQL

Redis (temporary room storage, TTL)

WebSocket (coming soon, for video sync & chat)

JWT (jjwt)

Frontend

React 19 + Vite 7

Tailwind CSS 4 (plugin for Vite)

✨ Current Features

🏠 Create a shared room (POST /rooms) → returns:

roomId, inviteCode, accessToken, joinUrl, wsUrl

🗃️ Store temporary rooms in Redis (TTL 24h)

👤 Save Host (participant) into PostgreSQL

🔑 JWT for authenticating subsequent actions

🔍 Test endpoints:

GET /hello → test API

GET /db-check → test DB connection

🛠️ Planned Features

🔗 Join a room using inviteCode

🎥 Synchronize video playback state (play/pause/seek) via WebSocket

👥 Manage participants list, with host/guest roles

💬 Simple in-room chat

🎨 Full UI/UX for room creation & shared watching experience

📂 Main Project Structure
