# Guide d'Installation Complet - Infralyonix sur VPS OVH (Ubuntu 22.04)

Ce guide vous explique comment déployer Infralyonix sur un VPS OVH avec Ubuntu 22.04 LTS.

## 1. Mise à jour du système
Connectez-vous en SSH à votre VPS et commencez par mettre à jour les paquets.
```bash
sudo apt update && sudo apt upgrade -y
```

## 2. Installation des dépendances (Node.js, PostgreSQL, Nginx)

### Node.js (Version 20.x)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Nginx & Outils
```bash
sudo apt install -y nginx git certbot python3-certbot-nginx
```

## 3. Configuration de la Base de Données
```bash
sudo -i -u postgres
psql
```
Dans l'interface psql :
```sql
CREATE DATABASE infralyonix;
CREATE USER infralyonixuser WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';
GRANT ALL PRIVILEGES ON DATABASE infralyonix TO infralyonixuser;
\q
exit
```

## 4. Préparation de l'application

### Clonage
```bash
cd /var/www
sudo git clone https://github.com/VOTRE_DEPOT/infralyonix.git
sudo chown -R $USER:$USER /var/www/infralyonix
cd /var/www/infralyonix
```

### Installation du Backend
```bash
cd backend
npm install
cp .env.example .env
```
Éditez le fichier `.env` : `nano .env`
```env
DATABASE_URL="postgresql://infralyonixuser:VOTRE_MOT_DE_PASSE_SECURISE@localhost:5432/infralyonix?schema=public"
JWT_SECRET="générer_une_clé_aléatoire_ici"
PORT=5000
```
Générez le client Prisma et lancez le build :
```bash
npx prisma generate
npm run build
npx prisma db push
npx prisma db seed
```

### Installation du Frontend
```bash
cd ../frontend
npm install
```
Créez un fichier `.env` pour le frontend si nécessaire (pour l'URL API) : `nano .env`
```env
VITE_API_URL=https://votre-domaine.com/api
```
Lancez le build :
```bash
npm run build
```

## 5. Gestion des processus avec PM2
```bash
sudo npm install -g pm2
cd ../backend
pm2 start dist/index.js --name infralyonix-api
pm2 save
pm2 startup
```

## 6. Configuration de Nginx (Reverse Proxy & Static Files)
```bash
sudo nano /etc/nginx/sites-available/infralyonix
```
Collez cette configuration (remplacez `votre-domaine.com`) :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend (Fichiers Statiques)
    location / {
        root /var/www/infralyonix/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Activez le site :
```bash
sudo ln -s /etc/nginx/sites-available/infralyonix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 7. Sécurisation avec SSL (Certbot)
```bash
sudo certbot --nginx -d votre-domaine.com
```

## 8. Accès Admin par défaut
Après l'installation, utilisez ces identifiants pour vous connecter :
- **Email** : `admin@infralyonix.com`
- **Mot de passe** : `admin123`

---
**⚠️ NOTE CRITIQUE PTERODACTYL** :
Pour que les boutons **Start / Stop / Reboot** fonctionnent :
1. Allez dans l'administration Infralyonix > **Infrastructure**.
2. Modifiez votre serveur Pterodactyl.
3. Dans le champ **"Secret (Account API Key)"**, vous **DEVEZ** mettre une clé API de type **"Account"** (créée sur votre profil utilisateur Pterodactyl, pas dans l'admin). Sans cela, les actions de contrôle seront refusées par Pterodactyl.
