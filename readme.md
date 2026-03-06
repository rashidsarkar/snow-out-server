# Health Vault Server

A comprehensive RESTful API for a health management mobile application. Built with Node.js, Express, TypeScript, and MongoDB, this server supports user authentication, appointment scheduling, health logging, medical document management, notifications, and various health-related services.

---

## Features

- **User Management**:

  - User registration, login, and profile management.
  - Role-based access control (Admin, Provider, Normal User).

- **Appointment Management**:

  - Schedule, update, and cancel appointments with healthcare providers.

- **Health Logging**:

  - Log and track personal health data.

- **Medical Documents**:

  - Upload and manage medical documents and images.

- **Insurance Management**:

  - Handle insurance information and documents.

- **Provider Management**:

  - Manage healthcare providers, their types, availability, and services.

- **Notifications**:

  - Real-time notifications for appointments, reminders, and updates.

- **Articles**:

  - Publish and manage health-related articles.

- **Favorites**:

  - Save favorite providers or services.

- **Reminders**:

  - Set and manage health reminders.

- **Meta Data**:

  - Retrieve application metadata.

- **Authorization**:

  - JWT-based authentication for secure access.
  - Role-based authorization for different user types.

- **Error Handling**:

  - Centralized error handling for validation and server errors.
  - Detailed error messages for debugging.

- **File Uploads**:
  - Support for uploading images and documents.

---

## Technologies

- **Backend**: Node.js, Express
- **Database**: MongoDB (using Mongoose)
- **Validation**: Zod
- **Language**: TypeScript
- **Authentication**: JSON Web Tokens (JWT)
- **File Upload**: Multer
- **Real-time**: Socket.io
- **Environment Variables**: Dotenv

---

## Prerequisites

Ensure you have the following installed:

- **Node.js** (v16+)
- **MongoDB Atlas Account** or a local MongoDB setup
- **npm** (Node Package Manager)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/rashidsarkar/Health-Vault-Mobile-Application.git
cd Health-Vault-Mobile-Application
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT=5000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 4. Start the Server

Run the following command to start the application:

```bash
npm run start:dev
```

The server will start on `http://localhost:5000`.

---

## API Endpoints

### Auth Endpoints

- **POST** `/api/v1/auth/register` - Register a new user.
- **POST** `/api/v1/auth/login` - Login to get access tokens.

### User Endpoints

- **GET** `/api/v1/user` - Retrieve user profile.
- **PATCH** `/api/v1/user` - Update user profile.

### Appointment Endpoints

- **POST** `/api/v1/appointment` - Create a new appointment.
- **GET** `/api/v1/appointment` - Retrieve user's appointments.
- **PATCH** `/api/v1/appointment/:id` - Update an appointment.
- **DELETE** `/api/v1/appointment/:id` - Cancel an appointment.

### Provider Endpoints

- **GET** `/api/v1/provider` - Retrieve providers.
- **POST** `/api/v1/provider` - Add a new provider (Admin/Provider).
- **PATCH** `/api/v1/provider/:id` - Update provider info.

### Availability Endpoints

- **GET** `/api/v1/availability-day` - Get availability days.
- **GET** `/api/v1/availability-slot` - Get availability slots.

### Health Log Endpoints

- **POST** `/api/v1/healthLog` - Add a health log entry.
- **GET** `/api/v1/healthLog` - Retrieve health logs.

### Medical Document Endpoints

- **POST** `/api/v1/medicalDocument` - Upload a medical document.
- **GET** `/api/v1/medicalDocument` - Retrieve user's documents.

### Insurance Endpoints

- **POST** `/api/v1/insurance` - Add insurance info.
- **GET** `/api/v1/insurance` - Retrieve insurance details.

### Notification Endpoints

- **GET** `/api/v1/notification` - Get notifications.

### Article Endpoints

- **POST** `/api/v1/article` - Create an article (Admin/Provider).
- **GET** `/api/v1/article` - Retrieve articles.
- **PATCH** `/api/v1/article/:id` - Update an article.
- **DELETE** `/api/v1/article/:id` - Delete an article.

### Reminder Endpoints

- **POST** `/api/v1/reminder` - Set a reminder.
- **GET** `/api/v1/reminder` - Get reminders.

### Service Endpoints

- **GET** `/api/v1/service` - Retrieve services.

### Favorite Endpoints

- **POST** `/api/v1/favorite` - Add to favorites.
- **GET** `/api/v1/favorite` - Get favorites.

### Meta Endpoints

- **GET** `/api/v1/meta` - Get application metadata.

### Admin Endpoints (Admin only)

- Various management endpoints for web content, users, etc.

---

## Contributing

We welcome contributions! Follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Make your changes and commit: `git commit -m 'Add feature-name'`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Author

**MD Rashid Sarkar**

- [GitHub](https://github.com/rashidsarkar)
- [Portfolio](https://fabulous-meringue-442652.netlify.app)
- [Email](mailto:rashidsarkar558@gmail.com)
