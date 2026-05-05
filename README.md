# SquareNet Frontend 🏠

The modern, responsive user interface for **SquareNet**, a premium real estate platform. Built with React.js, Tailwind CSS, and Vite, it offers a seamless experience for browsing, managing, and inquiring about properties.

## ✨ Features

- **Modern UI/UX**: Professional design with smooth animations and responsive layouts for all devices.
- **Property Discovery**: Advanced search and filtering to find the perfect home or investment.
- **Real-time Communication**: Integrated chat system to connect buyers and sellers directly.
- **User Dashboard**: Personal area for managing profile, listings, and favorites.
- **Interactive Maps**: (Optional/Planned) View property locations with precision.
- **Light/Dark Mode**: Optimized for comfortable viewing in any environment.
- **Dynamic Content**: Powered by the SquareNet Backend API.

## 🛠️ Tech Stack

- **Framework**: React.js
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Networking**: Fetch API / Axios
- **Real-time**: Socket.io-client

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Youssef-Mansour854/SquareNet-Frontend.git
   ```
2. Navigate to the project directory:
   ```bash
   cd front-end
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## ⚙️ Configuration

Create a `.env` file in the root of the `front-end` directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
```

## 🏃‍♂️ Running the Project

- **Development mode**:
  ```bash
  npm run dev
  ```
- **Build for production**:
  ```bash
  npm run build
  ```
- **Preview production build**:
  ```bash
  npm run preview
  ```

## 📄 License

This project is licensed under the ISC License.
