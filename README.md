# SpendWise - Full Stack Smart Expense & Budget Tracker

SpendWise is a production-ready, mobile-first **Full Stack Personal Expense & Budget Tracker** built with **Java Spring Boot 3**, **Spring Security (JWT)**, **Spring Data JPA**, **MySQL 8.0**, and a modern **Vanilla JavaScript Progressive Web App (PWA)** frontend.

---

## 🌟 Key Features

- **🔐 Robust Authentication & Security**:
  - Secure registration, login, and logout powered by Spring Security 6 & JJWT.
  - Password hashing via `BCryptPasswordEncoder` (strength 12).
  - Stateless session management with HMAC-SHA256 JWT bearer tokens.
- **🛡️ Strict User Data Isolation**:
  - Multi-user isolation enforced at the database layer via foreign keys and repository queries (`user_id`).
  - Zero cross-user data leakage (IDOR-safe: attempts to access or mutate other users' records return 404/401).
- **💰 Financial Accuracy (`BigDecimal`)**:
  - All monetary calculations (Income, Expense, Net Balance, Budget limits) utilize `BigDecimal` with strict boundary checks (positive amounts, 2 decimal places precision) preventing floating-point rounding errors.
- **📊 Real-time Dashboard & KPI Metrics**:
  - Monthly Income, Expense, Net Balance, and Savings Rate.
  - Month-over-month percentage change indicators.
  - Interactive Chart.js visualizations: Weekly bar chart, 6-Month trend chart, and Category breakdown charts.
- **🎯 Category Budgets & Automated Alerts**:
  - Set and manage monthly spending caps per expense category.
  - Real-time spending progress bars.
  - Automated budget status alerts:
    - **NORMAL**: Spending under 75% of monthly budget limit.
    - **WARNING**: Spending at 75% - 100% of budget limit.
    - **EXCEEDED / OVER BUDGET**: Spending exceeding 100% of budget limit with over-budget notifications.
- **🔍 Search & Filter**:
  - Filter transactions by category or transaction type (`EXPENSE`, `INCOME`).
  - Live text search querying descriptions and notes simultaneously.
- **📁 RFC 4180 CSV Export**:
  - Stream transaction logs directly from the backend with UTF-8 BOM encoding for seamless Microsoft Excel and Google Sheets compatibility.
- **📱 Mobile-First Responsive PWA**:
  - Responsive layouts tailored for Android, iPhone, iPad/tablets, and desktops.
  - Mobile bottom navigation bar (`Dashboard`, `Transactions`, `Budgets`, `Reports`, `Account`).
  - Touch-friendly tap targets (minimum 44×44px) and Floating Action Button (FAB).
  - Installable as a Progressive Web App (PWA) on Android and iOS with web manifest and service worker.
  - **Online/Offline Connectivity Sync**: Detects offline network status, displays an offline banner, and syncs data on reconnection.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | Java 21 / 25, Spring Boot 3.4.2 |
| **Security & Auth** | Spring Security 6, JJWT 0.12.6, BCrypt |
| **Data Persistence** | Spring Data JPA, Hibernate, MySQL Connector/J |
| **Validation** | Jakarta Bean Validation (Hibernate Validator) |
| **Database** | MySQL 8.0 (InnoDB, `utf8mb4_unicode_ci`), H2 for testing |
| **Frontend** | Semantic HTML5, Vanilla JavaScript (ES6+), Modern CSS3 |
| **Styling & Charts** | Tailwind CSS, FontAwesome 6.5, Google Fonts, Chart.js 4.4 |
| **PWA & Offline** | Web App Manifest, Service Worker (`sw.js`), Cache API |
| **DevOps / Containers** | Docker (multi-stage build), Docker Compose |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java**: JDK 21 or higher (`java -version`)
- **Maven**: 3.9+ (`mvn -version`)
- **MySQL**: MySQL Server 8.0 (or Docker)

---

### Option A: Running with Local MySQL & Maven (Recommended)

1. **Create the MySQL Database**:
   Log into MySQL and execute the schema:
   ```sql
   CREATE DATABASE IF NOT EXISTS spendwise_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Alternatively, the Spring Boot application will create the database and tables automatically on first start).*

2. **Configure Environment Variables (Optional)**:
   By default, the backend connects to `localhost:3306/spendwise_db` using username `root` and password `root`. You can override these using environment variables:
   ```powershell
   $env:DB_URL="jdbc:mysql://localhost:3306/spendwise_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   $env:DB_USERNAME="your_mysql_username"
   $env:DB_PASSWORD="your_mysql_password"
   $env:JWT_SECRET="YourSuperSecretStrongKeyForJwtTokensMinimum32BytesLong"
   ```

3. **Start the Application**:
   Navigate to the `backend/` directory and run:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

4. **Access the Application**:
   Open your browser and navigate to:
   **[http://localhost:8080](http://localhost:8080)**

   - Click **"Fill Demo Credentials (alice)"** or create a new account.
   - Start adding income, expenses, and monthly budgets!

---

### Option B: Running with Docker Compose (Zero Configuration)

With Docker Desktop installed and running:
```bash
docker-compose up --build
```
This spins up:
- MySQL 8.0 container on port `3307` (internal `3306`) with persistent data storage.
- Spring Boot container on port `8080` containing the full backend and bundled PWA frontend.

---

## 🧪 Running Automated Tests

Run the comprehensive unit, security, and integration test suite:
```powershell
cd backend
mvn clean test
```

### Test Coverage Highlights:
- **`AuthControllerTest`**: Verifies user registration, duplicate email rejection, password length validation, JWT generation on login, and 401 unauthorized handling for bad credentials.
- **`TransactionSecurityTest`**: Verifies user data isolation between User A and User B (attempts by User B to view or delete User A's data return 404), and tests `BigDecimal` validation rejecting zero/negative values.
- **`BudgetAlertTest`**: Verifies monthly spending calculations against category budgets, testing the `NORMAL`, `WARNING` (75%+), and `EXCEEDED` (100%+) alert states.
- **`ReportControllerTest`**: Verifies dashboard summary calculations, weekly/monthly period aggregations, category breakdowns, and RFC 4180 CSV export generation.

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:
`Authorization: Bearer <your_jwt_token>`

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `POST` | `/api/auth/logout` | Sign out session | Yes |

#### Sample Register Request:
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123",
  "fullName": "Alice Smith",
  "currency": "USD"
}
```

---

### 2. Transactions (`/api/transactions`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/transactions` | Create income or expense (`BigDecimal`) | Yes |
| `GET` | `/api/transactions` | Search & paginate transactions (`type`, `category`, `search`, `startDate`, `endDate`, `page`, `size`) | Yes |
| `GET` | `/api/transactions/{id}` | Get transaction by ID (scoped to user) | Yes |
| `PUT` | `/api/transactions/{id}` | Update transaction | Yes |
| `DELETE` | `/api/transactions/{id}` | Delete transaction | Yes |
| `GET` | `/api/transactions/export/csv` | Download transactions as CSV attachment | Yes |

#### Sample Transaction Request:
```json
{
  "type": "EXPENSE",
  "categoryId": "food",
  "description": "Weekly Groceries",
  "amount": 142.50,
  "transactionDate": "2026-10-13",
  "notes": "Farmer's market vegetables"
}
```

---

### 3. Budgets (`/api/budgets`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/budgets` | Get category budgets with spent amounts, remaining balance, and alert statuses | Yes |
| `POST` | `/api/budgets` | Set or update single category budget | Yes |
| `PUT` | `/api/budgets/batch` | Batch update category budgets (`{ "food": 500.00, "bills": 250.00 }`) | Yes |
| `DELETE` | `/api/budgets/{category}` | Delete budget limit for category | Yes |

---

### 4. Reports & Analytics (`/api/reports`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reports/dashboard` | Monthly income, expense, net balance, savings rate, and comparisons | Yes |
| `GET` | `/api/reports/period?type=WEEKLY` | Period reports (`WEEKLY`, `MONTHLY`, `YEARLY`, `DAILY`) | Yes |
| `GET` | `/api/reports/category-breakdown` | Category expense distribution and percentages | Yes |

---

## 📱 Android & Mobile PWA Installation Guide

SpendWise is configured as an installable Progressive Web App (PWA) with a manifest, high-resolution icons, and a service worker.

### Installing on Android (Google Chrome / Edge):
1. Open Chrome on your Android device and navigate to your SpendWise URL (e.g. `https://your-domain.com` or `http://<your-lan-ip>:8080`).
2. Chrome will automatically display an **"Add SpendWise to Home screen"** banner at the bottom of the screen.
3. Tap **Install** or tap the **three dots menu (⋮)** in the top right corner and select **"Install app"** or **"Add to Home screen"**.
4. Confirm by tapping **Add**.
5. SpendWise will appear as a standalone app on your home screen and app drawer with the native wallet icon, launching in full-screen standalone mode without URL bars.

### Installing on iPhone (Apple Safari):
1. Open Safari on iOS and navigate to the application URL.
2. Tap the **Share button** (square with an arrow pointing up) at the bottom of Safari.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add** in the top right corner.

---

## ⚙️ Environment Variables Reference

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8080` | Server HTTP port |
| `DB_URL` | `jdbc:mysql://localhost:3306/spendwise_db?...` | JDBC connection string |
| `DB_USERNAME` | `root` | Database user |
| `DB_PASSWORD` | `root` | Database password |
| `JWT_SECRET` | 32-byte default key | Secret key for HMAC-SHA256 JWT signing |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | JWT token lifespan in milliseconds |
| `CORS_ALLOWED_ORIGINS`| `http://localhost:8080,http://localhost:3000` | Whitelisted CORS origins |
| `SPRING_PROFILES_ACTIVE` | `default` (or `prod`) | Active Spring profile |
