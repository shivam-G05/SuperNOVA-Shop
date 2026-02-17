# 🚀 SuperNOVA Shop

A full-stack **e-commerce microservices application** built with React, Node.js, Docker, and deployed on AWS EC2 with a custom domain via Cloudflare.

![SuperNOVA Shop](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue)
![AWS](https://img.shields.io/badge/AWS-EC2-orange)

---

## 🌐 Live Demo

- **Frontend:** [https://supernova-4suf.onrender.com](https://supernova-4suf.onrender.com)
- **Backend API:** [https://api.shivamg.me](https://api.shivamg.me)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Microservices](#-microservices)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker Setup](#-docker-setup)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)

---

## ✨ Features

- 🔐 **Authentication** - Register, Login, Logout with JWT tokens and secure cookies
- 🛍️ **Product Catalog** - Browse, search, and filter products by category
- 🛒 **Shopping Cart** - Add, remove, and manage cart items
- 📦 **Order Management** - Place and track orders
- 💳 **Payment Integration** - Razorpay payment gateway
- 🤖 **AI Buddy** - Real-time AI assistant using Socket.io
- 🏪 **Seller Dashboard** - Manage products, view orders and revenue metrics
- 📧 **Notifications** - RabbitMQ-powered event-driven notifications
- 👤 **User Profile** - Manage profile and multiple delivery addresses
- 📱 **Responsive Design** - Works on all screen sizes

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Socket.io Client | Real-time communication |
| CSS3 | Styling with CSS variables |
| Vite | Build tool |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 18 | Runtime environment |
| Express.js | Web framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| RabbitMQ | Message queue / Event bus |
| Socket.io | Real-time WebSocket communication |
| Razorpay | Payment processing |
| ImageKit | Image storage and CDN |
| dotenv | Environment variable management |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| AWS EC2 | Backend hosting |
| Render | Frontend hosting |
| Nginx | Reverse proxy + SSL termination |
| Cloudflare | DNS management |
| Let's Encrypt | SSL certificates |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                         │
│         supernova-4suf.onrender.com              │
│              (React Frontend)                    │
└────────────────────┬────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────┐
│              api.shivamg.me                      │
│           (Nginx Reverse Proxy)                  │
│              AWS EC2 Instance                    │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬───┘
   │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼
 Auth  Product  Cart  Order  Payment  AI  Seller
:3000  :3001  :3002  :3003  :3004  :3005  :3007
                                           +
                                      Notification
                                         :3006
                     │
                     ▼
              ┌─────────────┐
              │   RabbitMQ  │  ←── Event Bus
              └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │   MongoDB   │  ←── Database (each service)
              └─────────────┘
```

---

## 🔧 Microservices

| Service | Port | Description |
|---------|------|-------------|
| **Auth** | 3000 | User registration, login, logout, profile management |
| **Product** | 3001 | Product CRUD, search, category filtering |
| **Cart** | 3002 | Add/remove items, cart management |
| **Order** | 3003 | Order creation, status tracking |
| **Payment** | 3004 | Razorpay payment integration |
| **AI Buddy** | 3005 | Real-time AI chat via Socket.io |
| **Notification** | 3006 | Email/push notifications via RabbitMQ |
| **Seller Dashboard** | 3007 | Seller metrics, product management |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas account (or local MongoDB)
- RabbitMQ instance
- ImageKit account
- Razorpay account

### Clone the Repository

```bash
git clone https://github.com/yourusername/supernova-shop.git
cd supernova-shop
```

### Install Frontend Dependencies

```bash
cd FRONTEND
npm install
npm run dev
```

### Install Backend Dependencies (Each Service)

```bash
cd BACKEND/auth
npm install

cd ../product
npm install
# Repeat for all services
```

---

## 🔐 Environment Variables

Each microservice needs a `.env` file. Below are the required variables:

### Auth Service (`/BACKEND/auth/.env`)

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RABBITMQ_URL=your_rabbitmq_url
```

### Product Service (`/BACKEND/product/.env`)

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_url
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

### Cart Service (`/BACKEND/cart/.env`)

```env
PORT=3002
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_url
```

### Order Service (`/BACKEND/order/.env`)

```env
PORT=3003
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_url
```

### Payment Service (`/BACKEND/payment/.env`)

```env
PORT=3004
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RABBITMQ_URL=your_rabbitmq_url
```

### AI Buddy Service (`/BACKEND/ai-buddy/.env`)

```env
PORT=3005
MONGODB_URI=your_mongodb_connection_string
AI_API_KEY=your_ai_api_key
```

### Notification Service (`/BACKEND/notification/.env`)

```env
PORT=3006
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_url
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Seller Dashboard Service (`/BACKEND/seller-dashboard/.env`)

```env
PORT=3007
MONGODB_URI=your_mongodb_connection_string
RABBITMQ_URL=your_rabbitmq_url
```

---

## 🐳 Docker Setup

### Build and Run All Services

```bash
cd BACKEND

# Stop and remove existing containers
docker stop auth product cart order payment ai-buddy seller-dashboard notification
docker rm auth product cart order payment ai-buddy seller-dashboard notification

# Build all images
docker build -t auth ./auth
docker build -t product ./product
docker build -t cart ./cart
docker build -t order ./order
docker build -t payment ./payment
docker build -t ai-buddy ./ai-buddy
docker build -t seller-dashboard ./seller-dashboard
docker build -t notification ./notification

# Run all containers with restart policy
docker run -d --name auth -p 3000:3000 --restart always --env-file ./auth/.env auth
docker run -d --name product -p 3001:3001 --restart always --env-file ./product/.env product
docker run -d --name cart -p 3002:3002 --restart always --env-file ./cart/.env cart
docker run -d --name order -p 3003:3003 --restart always --env-file ./order/.env order
docker run -d --name payment -p 3004:3004 --restart always --env-file ./payment/.env payment
docker run -d --name ai-buddy -p 3005:3005 --restart always --env-file ./ai-buddy/.env ai-buddy
docker run -d --name seller-dashboard -p 3007:3007 --restart always --env-file ./seller-dashboard/.env seller-dashboard
docker run -d --name notification -p 3006:3006 --restart always --env-file ./notification/.env notification
```

### Using the Rebuild Script

```bash
cd BACKEND
chmod +x rebuild-all.sh
./rebuild-all.sh
```

### Check Container Status

```bash
docker ps
```

---

## 📡 API Endpoints

### Auth Service (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| POST | `/api/auth/logout` | Logout user | ✅ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Product Service (`/api/products`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | ❌ |
| GET | `/api/products/:id` | Get product by ID | ❌ |
| POST | `/api/products` | Create product | ✅ Seller |
| PUT | `/api/products/:id` | Update product | ✅ Seller |
| DELETE | `/api/products/:id` | Delete product | ✅ Seller |
| POST | `/api/products/:id/review` | Add review | ✅ |

### Cart Service (`/api/cart`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/cart` | Get user cart | ✅ |
| POST | `/api/cart` | Add item to cart | ✅ |
| DELETE | `/api/cart/:itemId` | Remove item | ✅ |
| DELETE | `/api/cart` | Clear cart | ✅ |

### Order Service (`/api/orders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders` | Get user orders | ✅ |
| POST | `/api/orders` | Create order | ✅ |
| GET | `/api/orders/:id` | Get order by ID | ✅ |
| PUT | `/api/orders/:id/status` | Update status | ✅ Seller |

### Payment Service (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-order` | Create Razorpay order | ✅ |
| POST | `/api/payments/verify` | Verify payment | ✅ |

### Seller Dashboard (`/api/seller`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/seller/metrics` | Get sales metrics | ✅ Seller |
| GET | `/api/seller/orders` | Get seller orders | ✅ Seller |
| GET | `/api/seller/products` | Get seller products | ✅ Seller |

---

## 🌍 Deployment

### Frontend (Render)

1. Push code to GitHub
2. Connect repository to [Render](https://render.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables

### Backend (AWS EC2)

#### Nginx Configuration

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name api.shivamg.me;

    ssl_certificate /etc/letsencrypt/live/api.shivamg.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shivamg.me/privkey.pem;

    location /api/auth { proxy_pass http://127.0.0.1:3000; }
    location /api/products { proxy_pass http://127.0.0.1:3001; }
    location /api/cart { proxy_pass http://127.0.0.1:3002; }
    location /api/orders { proxy_pass http://127.0.0.1:3003; }
    location /api/payments { proxy_pass http://127.0.0.1:3004; }
    location /api/ai { proxy_pass http://127.0.0.1:3005; }
    location /api/notifications { proxy_pass http://127.0.0.1:3006; }
    location /api/seller { proxy_pass http://127.0.0.1:3007; }
    location /socket.io/ { proxy_pass http://127.0.0.1:3005; }
}
```

#### SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.shivamg.me
```

### Cloudflare DNS Setup

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | `api` | `YOUR_EC2_IP` | ☁️ DNS Only |

---

## 📁 Project Structure

```
SuperNOVA-Shop/
├── FRONTEND/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── SellerDashboard.jsx
│   │   │   └── SellProducts.jsx
│   │   ├── context/           # React context (AuthContext)
│   │   ├── store/             # Redux store & actions
│   │   └── App.jsx
│   └── package.json
│
└── BACKEND/
    ├── auth/                  # Auth microservice (port 3000)
    │   ├── src/
    │   │   ├── controllers/
    │   │   ├── models/
    │   │   ├── routes/
    │   │   └── app.js
    │   ├── Dockerfile
    │   └── .env
    ├── product/               # Product microservice (port 3001)
    ├── cart/                  # Cart microservice (port 3002)
    ├── order/                 # Order microservice (port 3003)
    ├── payment/               # Payment microservice (port 3004)
    ├── ai-buddy/              # AI Buddy microservice (port 3005)
    ├── notification/          # Notification microservice (port 3006)
    ├── seller-dashboard/      # Seller Dashboard microservice (port 3007)
    └── rebuild-all.sh         # Script to rebuild all Docker containers
```

---

## 🔒 Security

- JWT tokens stored in **httpOnly cookies** (prevents XSS)
- `sameSite: 'none'` with `secure: true` for cross-origin cookie support
- Passwords hashed with **bcrypt** (10 salt rounds)
- CORS configured to allow only trusted frontend origins
- AWS Security Groups restrict port access
- SSL/TLS encryption via Let's Encrypt
- Environment variables never committed to repository

---

## 🐛 Known Issues & Troubleshooting

### CORS Error
Make sure all backend services have the correct frontend URL in their CORS config:
```javascript
app.use(cors({
  origin: 'https://supernova-4suf.onrender.com',
  credentials: true
}));
```

### Cookie Not Being Set
Ensure cookie settings in auth controller are:
```javascript
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/'
});
```

### Container Not Starting
```bash
docker logs <service-name> --tail 50
```

### WebSocket Connection Failed
Ensure Nginx has WebSocket upgrade headers:
```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_read_timeout 86400;
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Shivam Goel**

- GitHub: [@yourusername](https://github.com/shivam-G05)
- LinkedIn: [Shivam Goel](https://www.linkedin.com/in/shivam-goel-6236432a8/)
- Email: shivamkgjj2005@gmail.com

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Render](https://render.com) - Frontend hosting
- [AWS EC2](https://aws.amazon.com/ec2/) - Backend hosting
- [Cloudflare](https://cloudflare.com) - DNS management
- [ImageKit](https://imagekit.io) - Image CDN
- [Razorpay](https://razorpay.com) - Payment gateway
- [RabbitMQ](https://rabbitmq.com) - Message broker
- [MongoDB Atlas](https://mongodb.com/atlas) - Database

---

<div align="center">
  Made with ❤️ by Shivam Goel
</div>
