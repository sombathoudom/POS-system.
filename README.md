# Laravel POS System

A modern Point of Sale (POS) system built with **Laravel**, **Inertia.js**, **React**, **TypeScript**, and **shadcn/ui**. This project provides a robust, scalable, and visually appealing solution for managing sales, inventory, and transactions for small to medium-sized businesses.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication and authorization
- Product management (CRUD operations)
- Sales and transaction processing
- Inventory tracking
- Responsive and modern UI with shadcn/ui components
- Type-safe frontend with TypeScript
- Server-side rendering with Inertia.js
- RESTful API integration with Laravel

## Technologies
- **Laravel**: Backend framework for handling business logic and APIs
- **Inertia.js**: Seamless integration between Laravel and React for server-driven single-page applications
- **React**: Frontend library for building dynamic user interfaces
- **TypeScript**: Adds static types to JavaScript for improved developer experience and code reliability
- **shadcn/ui**: Accessible, customizable, and reusable UI components for React

## Prerequisites
Ensure you have the following installed on your system:
- **PHP** (>= 8.1)
- **Composer** (latest version)
- **Node.js** (>= 16.x) and **npm** or **yarn**
- **MySQL** or any other database supported by Laravel
- **Git**

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/sombathoudom/laravel-pos-sys.git
   cd laravel-pos-sys
   ```

2. **Install PHP dependencies**:
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies** (including shadcn/ui):
   ```bash
   npm install
   ```
   or
   ```bash
   yarn install
   ```

4. **Copy the environment file**:
   ```bash
   cp .env.example .env
   ```

5. **Generate the application key**:
   ```bash
   php artisan key:generate
   ```

## Configuration
1. **Set up the database**:
   - Create a new database in your MySQL (or preferred database) server.
   - Update the `.env` file with your database credentials:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=your_database_name
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     ```

2. **Run migrations**:
   ```bash
   php artisan migrate
   ```

3. **Seed the database** (optional, if seeders are available):
   ```bash
   php artisan db:seed
   ```

4. **Configure Inertia and frontend**:
   - Ensure the `APP_URL` in the `.env` file matches your local server (e.g., `http://localhost`).
   - Compile the frontend assets (including shadcn/ui components):
     ```bash
     npm run dev
     ```
     or
     ```bash
     yarn dev
     ```

5. **shadcn/ui setup**:
   - If shadcn/ui components are not already installed, add them using:
     ```bash
     npx shadcn-ui@latest add [component-name]
     ```
     Replace `[component-name]` with the desired component (e.g., `button`, `input`).
   - Ensure your `tsconfig.json` and `vite.config.ts` are configured to support shadcn/ui and TypeScript.

## Running the Application
1. **Start the Laravel development server**:
   ```bash
   php artisan serve
   ```

2. **Run the frontend development server** (for Vite's hot module replacement):
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```

3. Open your browser and navigate to `http://localhost:8000` (or the port specified by `php artisan serve`).

## Project Structure
```
laravel-pos-sys/
├── app/                    # Laravel application logic (Controllers, Models, etc.)
├── database/               # Migrations, seeders, and factories
├── resources/              # Frontend assets
│   ├── js/                # React components, TypeScript files, and shadcn/ui components
│   ├── css/               # Stylesheets (including shadcn/ui styles)
│   └── views/             # Blade templates (used by Inertia)
├── routes/                 # API and web routes
├── public/                 # Publicly accessible files
├── vite.config.ts         # Vite configuration for frontend bundling
└── .env                   # Environment configuration
```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes and commit (`git commit -m "Add your feature"`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a pull request.

Please ensure your code follows the project's coding standards, includes TypeScript type definitions, and adheres to shadcn/ui component guidelines.

## License
This project is licensed under the [MIT License](LICENSE).