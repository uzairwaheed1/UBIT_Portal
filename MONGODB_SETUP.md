# MongoDB Setup Guide

## Error: `connect ECONNREFUSED ::1:27017`

This error means MongoDB is not running on your local machine. Here are the solutions:

## Option 1: Install and Start MongoDB Locally

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. Start MongoDB service:
   - Open Services (Win + R, type `services.msc`)
   - Find "MongoDB" service
   - Right-click and select "Start"

Or use Command Prompt as Administrator:
```bash
net start MongoDB
```

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux:
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string
5. Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/university-portal?retryWrites=true&w=majority
```

Replace `username` and `password` with your MongoDB Atlas credentials.

## Option 3: Use Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Verify MongoDB is Running

Test the connection:
```bash
mongosh
```

Or check if the port is listening:
```bash
# Windows
netstat -an | findstr 27017

# macOS/Linux
lsof -i :27017
```

## After Setup

1. Restart your Next.js development server:
```bash
npm run dev
```

2. Try adding a semester again - it should work now!

