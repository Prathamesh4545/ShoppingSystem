# Deployment Guide

## Environment Configuration

### Backend (Spring Boot)

#### Development
```bash
# Run with dev profile
java -jar -Dspring.profiles.active=dev ShoppingBackend.jar
```

#### Production
```bash
# Set environment variables
export DATABASE_URL=jdbc:postgresql://your-db-host:5432/ShoppingSystemDB
export DATABASE_USERNAME=your_username
export DATABASE_PASSWORD=your_password
export FRONTEND_URL=https://your-frontend-domain.com

# Run with prod profile
java -jar -Dspring.profiles.active=prod ShoppingBackend.jar
```

### Frontend (React + Vite)

#### Development
```bash
npm run dev
```

#### Production Build
```bash
# Create .env.production file
echo "VITE_API_URL=https://your-api-domain.com" > .env.production

# Build
npm run build

# Preview
npm run preview
```

## Docker Deployment

### Backend
```bash
docker build -t shopping-backend ./ShoppingBackend
docker run -p 8080:8080 \
  -e DATABASE_URL=jdbc:postgresql://host:5432/db \
  -e DATABASE_USERNAME=user \
  -e DATABASE_PASSWORD=pass \
  shopping-backend
```

### Frontend
```bash
docker build -t shopping-frontend ./ShoppingFrontend
docker run -p 5173:5173 \
  -e VITE_API_URL=http://your-api:8080 \
  shopping-frontend
```

## Environment Variables

### Backend
- `DATABASE_URL` - PostgreSQL connection URL
- `DATABASE_USERNAME` - Database username
- `DATABASE_PASSWORD` - Database password
- `FRONTEND_URL` - Frontend URL for CORS
- `SPRING_PROFILE` - Active profile (dev/prod)

### Frontend
- `VITE_API_URL` - Backend API URL
- `VITE_PORT` - Frontend port (optional)
