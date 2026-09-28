# 🚀 Production Deployment & Operations Guide
## **ScholarSphere — Deployment Architecture**

---

### **1. Environment Configuration**

Create a production `.env` file in `/backend`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/scholarsphere?retryWrites=true&w=majority
JWT_SECRET=production_secure_256bit_random_secret_gndec
JWT_EXPIRES_IN=7d
CLIENT_URL=https://scholarships.gndec.ac.in
UPLOAD_DIR=uploads
```

---

### **2. Docker Containerization**

```dockerfile
# Dockerfile for Backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

---

### **3. Nginx Reverse Proxy Configuration**

```nginx
server {
    listen 80;
    server_name scholarships.gndec.ac.in;

    location / {
        root /var/www/scholarsphere/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host $host;
    }
}
```
