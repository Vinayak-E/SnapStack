# 📸 SnapStack

SnapStack is a full-featured image management application that allows users to register, log in, upload images to AWS S3 with custom titles, rearrange them using drag-and-drop, edit metadata, and delete images. Designed for both performance and usability, it utilizes the power of the **MERN stack** along with **AWS S3** for reliable image storage.

---

## 🚀 Features

- 🔐 User authentication with JWT  
- 🖼️ Upload images with custom titles  
- 📂 Store images in AWS S3  
- ✏️ Edit image details  
- 🗑️ Delete images  
- 🔃 Drag-and-drop image rearrangement  
- 📧 Email notifications (e.g., on successful registration)  

---

## 🛠️ Tech Stack

### 🔧 Backend:
- Node.js  
- Express.js  
- MongoDB with Mongoose  
- JWT for authentication  
- AWS SDK (S3) for image storage  
- Nodemailer for sending emails  

### 🎨 Frontend:
- React.js (Vite + TypeScript)  
- Axios for API communication  
- React DnD / SortableJS for drag-and-drop  



## ⚙️ Environment Variables

Create a `.env` file in the root of your backend folder and add the following:

PORT=5000 MONGO_URI=mongodb+srv://<your-mongo-uri> JWT_SECRET=your_jwt_secret

AWS_ACCESS_KEY_ID=your_aws_access_key_id AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key AWS_REGION=eu-north-1 S3_BUCKET=my-image-bucket-name

EMAIL_USER=your_email@example.com EMAIL_PASS=your_email_password

FRONTEND_URL=http://localhost:5173


> ⚠️ **Note:** Replace placeholder values with your actual credentials.

---

## 🧑‍💻 Getting Started

### 📌 Prerequisites

- Node.js (v16+)
- MongoDB Atlas or Local MongoDB
- AWS S3 Bucket
- Email account (e.g., Gmail)

---

### 📥 Backend Setup

```bash
cd server
npm install
npm run dev

💻 Frontend Setup
bash
Copy
Edit
cd client
npm install
npm run dev

📬 Contact
For any issues or questions, feel free to contact:

Vinayak E
📧 vinayake056@gmail.com
