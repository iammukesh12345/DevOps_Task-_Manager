# Three-Tier Java DevOps Application

A production-style practice project containing:

- **Frontend:** React + Vite
- **Backend:** Java 21 + Spring Boot + Maven
- **Database:** MySQL 8
- **CI/CD:** Jenkins
- **Artifact Repository:** Nexus Repository
- **Security:** OWASP Dependency-Check + Trivy
- **Container Registry:** Docker Hub
- **Source Control:** GitHub

## Architecture

Browser
  |
  v
React Frontend (Nginx container)
  |
  | HTTP /api
  v
Spring Boot Backend
  |
  | JDBC
  v
MySQL

## Repository Layout

```text
three-tier-java-devops-app/
├── backend/
│   ├── pom.xml
│   ├── Dockerfile
│   ├── dependency-check-suppressions.xml
│   └── src/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf
│   ├── Dockerfile
│   └── src/
├── database/
│   ├── Dockerfile
│   └── init/
│       └── 01-schema.sql
├── docker-compose.yml
├── Jenkinsfile
├── jenkins/
│   └── settings.xml
└── .gitignore
```

## Local Run

Requirements:

- Java 21
- Maven 3.9+
- Node.js 20+
- Docker / Docker Compose

### Start the database

```bash
docker compose up -d mysql
```

### Run backend

```bash
cd backend
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### Run frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

The Vite development proxy forwards `/api` to `http://localhost:8080`.

## Docker Compose

To run the complete stack:

```bash
docker compose up -d --build
```

Open:

```text
http://localhost
```

## CI/CD Flow

The Jenkins pipeline is designed around:

1. Checkout source from GitHub
2. Build backend with Maven
3. Unit tests
4. OWASP Dependency-Check
5. Integration tests
6. Publish Maven artifact to Nexus
7. Build Docker images
8. Scan Docker images with Trivy
9. Push images to Docker Hub

The frontend is built during the Docker image build using a multi-stage Dockerfile.

## Jenkins Credentials

Create these Jenkins credentials before running the pipeline:

| Credential ID | Type | Purpose |
|---|---|---|
| `github-credentials` | Username/Password or SSH | GitHub checkout if private |
| `nexus-credentials` | Username/Password | Nexus Maven repository |
| `nexus-url` | Secret Text | Nexus base URL, e.g. `https://nexus.example.com:8081` |
| `dockerhub-credentials` | Username/Password or token | Docker Hub push |

Configure these Jenkins environment variables:

```text
NEXUS_URL=https://your-nexus-host:8081
NEXUS_REPOSITORY=maven-releases
DOCKERHUB_USERNAME=your-dockerhub-user
```

Do not commit passwords, Docker Hub tokens, private keys, or production database credentials.

## Nexus

Create a Maven hosted repository in Nexus, for example:

```text
maven-releases
```

Store the Nexus base URL in Jenkins as the `nexus-url` secret-text credential. The pipeline supplies the repository URL at deploy time and keeps it out of source control.

## OWASP Dependency-Check

The backend `pom.xml` includes the OWASP Dependency-Check Maven plugin.

The Jenkins pipeline runs:

```bash
mvn dependency-check:check
```

For an enterprise setup, the NVD API key and a persistent Dependency-Check data directory should be configured to reduce repeated database downloads.

## Trivy

The pipeline scans:

- backend image
- frontend image
- MySQL image

The build fails on HIGH/CRITICAL vulnerabilities when the configured Trivy command returns a failure.

## GitHub Webhook

Configure the GitHub repository webhook to point to your Jenkins endpoint, for example:

```text
https://YOUR_JENKINS_HOST/github-webhook/
```

Use:

```text
Content type: application/json
Events: Just the push event
```

Then configure the Jenkins Pipeline job with GitHub hook triggering.

## Important Production Improvements

For a real production deployment, add:

- Kubernetes
- Ingress / TLS
- External secrets manager
- Managed MySQL
- Redis/cache where appropriate
- Centralized logging
- Prometheus/Grafana
- SonarQube
- SAST
- SBOM generation
- Image signing
- Dependency-Track
- Backup and restore automation
- Database migrations using Flyway/Liquibase
- Blue/green or canary deployment
