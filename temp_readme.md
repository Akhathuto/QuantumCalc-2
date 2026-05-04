# Edgtec Creative AI

![Edgtec Creative AI Screenshot](https://picsum.photos/seed/edgtec-ui/1200/600)

Welcome to the official repository for **Edgtec Creative AI**, an all-in-one, AI-powered creative suite designed to bring your imagination to life. Our platform empowers creators of all skill levels to generate stunning visuals, compelling content, original music, dynamic videos, and intricate 3D models with ease.

---

## 🚀 What's New: Live AI Integration!

We're excited to announce our latest major update:

-   **Live Image Generation:** The AI Image Generator is now powered by **Google's `imagen-4.0-generate-001` model**. Create unique, high-quality images directly from your prompts.
-   **Live Content Writing:** The AI Content Writer is now connected to the **Google Gemini API (`gemini-2.5-flash`)**. Generate articles, marketing copy, and stories in real-time.

Our core creative tools are now fully functional, moving from mock data to powerful, live AI generation.

---

## About EDGTEC

At **EDGTEC**, we are a passionate team of developers, designers, and AI researchers on a mission to democratize creativity. Based in South Africa, EDGTEC is a proud **100% black youth-owned enterprise** committed to innovation and empowerment. We believe that technology should be a partner in the creative process, amplifying human imagination, not replacing it. Our goal is to build a future where anyone, regardless of their technical expertise, can transform their ideas into professional-quality creations.

### Company Details
- **Legal Name:** EDGTEC
- **Company Registration Number:** 2025/534716/07
- **CSD Supplier Number:** MAAA1626554

---

## ✨ Features

Our platform is packed with cutting-edge tools to streamline your creative workflow:

-   **🎨 AI Image Generation:** Create breathtaking images and art from simple text descriptions.
-   **✍️ Content Creation:** Generate high-quality articles, marketing copy, stories, and scripts in seconds.
-   **🎵 Music Generation:** Compose original, royalty-free music tracks tailored to any mood or genre.
-   **🎬 Video Production:** Produce professional-grade videos from text prompts with AI-powered editing.
-   **🧊 3D Model Generation:** Generate detailed 3D models for use in games, animation, or 3D printing.
-   **👥 Real-time Collaboration:** Work seamlessly with your team on projects in a shared creative space.
-   **🖼️ Unified Gallery:** Manage all your generated assets in one organized and accessible gallery.

---

## 🛠️ Tech Stack

Edgtec Creative AI is built with a modern and performant technology stack:

-   **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Routing:** [React Router](https://reactrouter.com/)
-   **AI Integration:** [Google Gemini API](https://ai.google.dev/)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

-   [Node.js](https://nodejs.org/) (which includes npm) - Recommended for the easiest setup.
-   Alternatively, [Python 3](https://www.python.org/) is also a great option.
-   An API key for the **Google Gemini API**.

### API Key Setup

Our application expects the Google Gemini API key to be available as an environment variable named `API_KEY`. The execution environment where this code runs must have this variable pre-configured for the AI features to work.

### Installation & Running the App

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/edgtec-creative-ai.git
    cd edgtec-creative-ai
    ```

2.  **Serve the application:**
    This is a static web application. You can use any simple HTTP server to run it. Below are a few common methods.

    #### Option 1: Using Node.js (Recommended)
    The `serve` package is a simple and powerful tool for this.

    ```sh
    # Install serve globally if you haven't already
    npm install -g serve

    # Run the server from the project's root directory
    serve
    ```
    Your application will typically be available at `http://localhost:3000`.

    #### Option 2: Using Python
    Python comes with a built-in HTTP server, making it a great zero-dependency choice.

    -   **On macOS / Linux (with Python 3):**
        ```sh
        python3 -m http.server
        ```
    -   **On Windows (with Python 3):**
        ```sh
        python -m http.server
        ```
    Your application will be available at `http://localhost:8000`.

3.  **Open your browser** and navigate to the address provided by your server to see the app live!

---

## 📂 File Structure

The codebase is organized to be clean and maintainable:

```
/
├── components/       # Reusable React components (UI elements, AI tools)
├── pages/            # Top-level page components for each route
├── types/            # TypeScript type definitions
├── App.tsx           # Main application component with routing
├── index.html        # The main HTML file
├── index.tsx         # The entry point for the React application
└── metadata.json     # Application metadata
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License.

---

## 📫 Contact

- **Email:** [r.lepheane@outlook.com](mailto:r.lepheane@outlook.com)
- **Address:** Springs, Gauteng, South Africa

&copy; 2024 EDGTEC. All Rights Reserved.