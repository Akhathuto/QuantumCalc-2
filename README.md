# QuantumCalc ⚛️

*Your All-in-One Scientific & Utility Suite, Powered by Gemini.*

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-Google-blue?logo=google)](https://ai.google.dev/)

QuantumCalc is a comprehensive, web-based suite of calculators and tools designed for students, professionals, and anyone in need of powerful, accessible calculation capabilities. It combines a professional-grade scientific calculator with a wide range of specialized tools for data analysis, finance, health, and everyday conversions.

---

## Key Features

### 🧠 Gemini-Powered Formula Explorer
Go beyond just getting an answer. The integrated **Formula Explorer**, powered by Google's Gemini API, provides clear, concise explanations for mathematical functions in real-time. Understand the *how* and *why* behind your calculations with beautifully rendered LaTeX formulas.

### 📈 Multi-Chart Graphing Suite
Transform data into insight with a versatile visualization tool. The graphing module isn't just a function plotter—it's a complete charting suite that supports:
- **Function Plotting**: Graph complex mathematical functions (`y = f(x)`).
- **Scatter Plots**: Visualize relationships between X,Y data points.
- **Bar & Pie Charts**: Compare categorical data and see proportions at a glance.

### ❤️ Health & Fitness Suite
Track and understand key wellness metrics with a dedicated suite of health calculators, including:
- **BMI Calculator**: Determine your Body Mass Index with support for both metric and imperial units.
- **BMR & Daily Calorie Calculator**: Estimate your basal metabolic rate and daily calorie needs based on your activity level.

### 🛠️ A Full Suite of Specialized Tools
QuantumCalc is more than one calculator—it's a massive collection of specialized utilities designed to handle any task you throw at it, from matrix algebra to mortgage planning.

---

## Full Feature List

### Core Tools
- **Scientific Calculator**: Full-featured with a "2nd function" key, memory, constants, and a ticker-tape history.
- **Graphing Suite**: Multi-mode charting for functions, scatter, bar, and pie charts.
- **History**: Saves your recent calculations for easy access, with the ability to "favorite" important entries and export your data.

### Mathematical Tools
- **Matrix Calculator**: Perform matrix operations like addition, multiplication, determinant, inverse, and transpose.
- **Statistics Calculator**: Instantly compute key statistical metrics (mean, median, standard deviation, etc.).
- **Equation Solver**: Solve linear and quadratic equations for 'x' with a step-by-step formula explainer.

### Financial Tools
- **Comprehensive Financial Suite**: A collection of over 15 calculators including:
  - Mortgage, Loan, and Auto Loan Calculators with amortization schedules.
  - Retirement, Investment, and Compound Interest projectors.
  - Tax, Salary, and Inflation calculators.

### Health & Fitness Tools
- **BMI Calculator**: Calculates Body Mass Index from height and weight.
- **BMR Calculator**: Estimates Basal Metabolic Rate.
- **Daily Calorie Calculator**: Recommends daily calorie intake for weight goals.

### Converters
- **Unit Converter**: Convert between units for Length, Mass, Temperature, Time, and Data Storage.
- **Currency Converter**: Get real-time exchange rates for over 160 currencies.
- **Percentage Calculator**: Quickly solve three different types of common percentage problems.
- **Base Converter**: Real-time conversion between Binary, Octal, Decimal, and Hexadecimal.

### Utility Tools
- **Date Calculator**: Calculate the duration between two dates or add/subtract time from a date.

---

## Running the Application (Local & Deployment)

This project is a static web application. It uses modern browser features but requires a local server for development due to security policies (CORS). **You cannot open the `index.html` file directly from your filesystem.**

### Local Development

1.  **Get the Code**: Clone or download the repository to your local machine.
2.  **Run a Server**: From the project's root directory, start a local web server. Here are some easy options:
    -   **Using `npx serve` (Easiest)**: If you have Node.js, run `npx serve` in your terminal and open the provided `localhost` URL.
    -   **VS Code Live Server**: Use the "Live Server" extension in VS Code. Right-click `index.html` and select "Open with Live Server".
    -   **Python Server**: Run `python -m http.server` (for Python 3) and navigate to `http://localhost:8000`.

### Deployment

To deploy QuantumCalc, simply upload all the project files to any static web hosting service (like Vercel, Netlify, GitHub Pages, etc.). No build step is necessary.

-   **Build Command:** Set to empty.
-   **Output Directory:** Set to the root directory.

---

## Configuring AI Features (Gemini API Key)

The AI-powered features in QuantumCalc (like the Formula Explorer and Currency Forecast) are powered by the Google Gemini API.

For these features to work, the application administrator must configure a Google Gemini API key as an environment variable (`process.env.API_KEY`) in the deployment environment. The application is designed to securely access this key without any action required from the end-user.

If the AI features are not working, it means the API key has not been configured in the environment where the application is hosted. The rest of the application will continue to function normally.

---

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini API
- **Mathematics Engine**: Math.js
- **Charting**: Recharts

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  **Fork the Project**
2.  **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3.  **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4.  **Push to the Branch** (`git push origin feature/AmazingFeature`)
5.  **Open a Pull Request**

### Reporting Bugs

If you encounter a bug, please open an issue on the repository. Be sure to include:
- A clear and descriptive title.
- A detailed description of the problem, including steps to reproduce it.
- Screenshots or screen recordings, if applicable.
- Information about your environment (browser, OS).

---

## About the Supplier (EDGTEC)
This application is provided by EDGTEC. The following information is based on the Central Supplier Database (CSD) Registration Report.

### Supplier Identification
| Field                                 | Detail                                      |
| ------------------------------------- | ------------------------------------------- |
| **Supplier Number**                   | MAAA1626554                                 |
| **Legal Name**                        | EDGTEC                                      |
| **Supplier Type**                     | CIPC Company - Private Company (Pty)(Ltd)   |
| **Registration Number**               | 2025/534716/07                              |
| **Business Status**                   | In Business                                 |
| **Country of Origin**                 | South Africa                                |
| **Total Annual Turnover**             | R10 million or less                         |
| **Tax Status**                        | Tax Compliant                               |

### Ownership Structure
EDGTEC is a 100% black-owned and 100% youth-owned enterprise.
| Owner Name                     | RSA Citizen | Ethnic Group    |
| ------------------------------ | ----------- | --------------- |
| Ranthutu Lepheane              | Yes         | Black African   |
| Siphosakhe Mathews Msimango    | Yes         | Black African   |

### Contact Information
**Primary Contact (Preferred)**
- **Name**: Ranthutu Lepheane
- **Type**: Bid Office
- **Email**: r.lepheane@outlook.com
- **Cellphone**: +277 11 84 6709

**Secondary Contact**
- **Name**: Siphosakhe Mathews Msimango
- **Type**: Administration, Bid Office
- **Email**: siphosakhemsimanngo@gmail.com
- **Cellphone**: 069 423 7030

### Registered Address
106312 NGWABE STREET KWA-THEMA MINI SELECOURT, SPRINGS, Springs Central, Gauteng, 1575, South Africa

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.