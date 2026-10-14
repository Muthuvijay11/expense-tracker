# SpendWise - Production Deployment Guide

This guide provides step-by-step instructions for deploying SpendWise to production with HTTPS, MySQL persistence, environment variable security, and zero downtime.

---

## 🔒 Security Best Practices for Production

1. **Never Commit Secrets**: Never commit real database passwords or JWT secret keys to Git. Always inject them via environment variables.
2. **Generate a Cryptographically Secure JWT Secret**:
   Generate a 64-character (512-bit) random secret key using OpenSSL or PowerShell:
   ```bash
   openssl rand -hex 32
   ```
3. **Mandatory HTTPS / SSL**: PWA features (service workers, installation prompts, background sync) strictly require an HTTPS connection in production.

---

## 🌐 Option 1: Docker Compose on a Cloud VPS (Recommended)

Deploy on any Linux VPS (DigitalOcean, Linode, AWS EC2, Hetzner, Oracle Cloud):

### 1. Provision Server & Install Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Clone the Repository & Configure Environment
```bash
git clone https://github.com/your-username/spendwise-expense-tracker.git /opt/spendwise
cd /opt/spendwise
```

Create a production `.env` file:
```bash
cat << 'EOF' > .env
PORT=8080
MYSQL_ROOT_PASSWORD=Yajiv*112
MYSQL_USER=spendwise_user
MYSQL_PASSWORD=Yajiv*112
DB_URL=jdbc:mysql://db:3306/spendwise_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=spendwise_user
DB_PASSWORD=Yajiv*112
JWT_SECRET=f4a2b9e6c1d84711823a49f50e82937465019283746581920394857162534123
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=https://spendwise.yourdomain.com
EOF
```

### 3. Launch with Docker Compose
```bash
docker-compose up -d --build
```
Verify containers are healthy:
```bash
docker-compose ps
docker-compose logs -f app
```

### 4. Setup Nginx Reverse Proxy with Free Let's Encrypt SSL (HTTPS)
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Configure `/etc/nginx/sites-available/spendwise`:
```nginx
server {
    server_name spendwise.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and acquire SSL:
```bash
sudo ln -s /etc/nginx/sites-available/spendwise /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d spendwise.yourdomain.com
```

Now your app is live with valid HTTPS at `https://spendwise.yourdomain.com`!

---

## ☁️ Option 2: Cloud PaaS Deployment (Render / Railway)

### Deploying to Render:
1. **Create Managed MySQL Database**:
   - Go to Render Dashboard -> **New** -> **PostgreSQL or MySQL (via Docker)**.
   - Note the Internal Database URL.
2. **Create Web Service**:
   - Connect your GitHub repository.
   - Environment: **Docker**
   - Health check path: `/`
   - Set Environment Variables:
     - `PORT`: `8080`
     - `DB_URL`: `jdbc:mysql://<internal-mysql-host>:3306/spendwise_db`
     - `DB_USERNAME`: `<db-user>`
     - `DB_PASSWORD`: `<db-password>`
     - `JWT_SECRET`: `<64-character-hex-secret>`
     - `CORS_ALLOWED_ORIGINS`: `https://spendwise.onrender.com`
3. Render automatically assigns a free public HTTPS URL (`https://spendwise.onrender.com`) where the Android PWA installation works out-of-the-box!

---

## 💾 Database Backups & Maintenance

### Daily Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/opt/spendwise/backups"
mkdir -p "$BACKUP_DIR"
DATE=$(date +"%Y%m%d_%H%M%S")
docker exec spendwise-mysql sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" spendwise_db' | gzip > "$BACKUP_DIR/spendwise_backup_$DATE.sql.gz"

# Keep last 14 days of backups
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +14 -exec rm {} \;
```

Set cron job (`crontab -e`):
```cron
0 2 * * * /opt/spendwise/backup.sh
```

---

## 📱 Verifying Android PWA Installation on Production

Once deployed to your public HTTPS URL:
1. Open Google Chrome on Android.
2. Visit `https://your-domain.com`.
3. Open Chrome DevTools (or use Remote Debugging):
   - Navigate to the **Application** tab -> **Manifest**: Verify `name`, `icons`, and `display: standalone` are detected.
   - Navigate to **Service Workers**: Verify `sw.js` is active and running.
4. Tap the browser install prompt or **Install App** in Chrome's options.
5. Launch SpendWise from your Android home screen as a native application!
