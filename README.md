# 🏋️‍♂️ GymFlow - Gym Management Web App

A full-stack **MERN** application designed for gyms and fitness centers.  
This platform allows users to manage memberships, book training sessions, shop for supplements, and view schedules — while administrators can manage members, trainers, and operations via a dedicated dashboard.

---
![License](https://img.shields.io/github/license/vyshnvv/tictactoe-web-app)

## 🚀 Features

### User Features
- 🔐 **Authentication** – Secure login and registration
- 💳 **Subscription Management** – Subscribe or renew monthly memberships
- 🏋️ **Personal Training & Nutritionist Booking** – Schedule 1-on-1 sessions
- 🛒 **Supplement Shop** – Browse and order fitness supplements
- 📅 **Group Class Schedule** – View upcoming group classes
- 🗺️ **OpenStreetMap Integration** – View gym location on an interactive map

### Admin Features
- 🔐 **Admin Login** – Admins are added manually in the database
- 👥 **Member Management** – Update or delete members
- 💵 **Fee Package Management** – Assign or edit subscription packages
- 📊 **Reports** – Export reports for members and subscriptions
- 🛒 **Supplement Store Management** – Manage available supplements
- 🧑‍🏫 **Trainer Management** – Add, update, or remove trainers
- 📆 **Member Subscription Control** – Manage subscription renewals and cancellations

---

## 🧰 Technologies Used

### Frontend
- [React.js](https://reactjs.org/) — UI library
- [React Router](https://reactrouter.com/) — Client-side routing
- [Axios](https://axios-http.com/) — HTTP requests
- [Redux Toolkit](https://redux-toolkit.js.org/) — State management (if used)
- [Leaflet.js](https://leafletjs.com/) — Interactive maps (OpenStreetMap)

### Backend
- [Node.js](https://nodejs.org/) — JavaScript runtime
- [Express.js](https://expressjs.com/) — Web framework
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud database
- [Mongoose](https://mongoosejs.com/) — MongoDB ODM
- [JWT](https://jwt.io/) — Authentication tokens
- [bcrypt](https://www.npmjs.com/package/bcrypt) — Password hashing
- [dotenv](https://www.npmjs.com/package/dotenv) — Environment variables

### Others
- [OpenStreetMap](https://www.openstreetmap.org/) — Map service

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vyshnvv/gymmanagement-web-app
cd gymmanagement-web-app
```
### 2. Install Dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 3. Set Up Environment Variables
Create a .env file inside the server/ directory with the following content:

```bash
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```
Replace ```your_mongodb_atlas_connection_string``` and ```your_jwt_secret_key``` with actual values.
Use ```openssl rand -base64 32``` to create a JWT secret or provide a random string.


### 4. Build the App
From the root directory:

```bash
npm run build
```

### 5. Start Development Servers

Backend (Express + Socket.IO)
```bash
cd server
npm run dev
```

Frontend (React)
```bash
cd client
npm run dev
```
