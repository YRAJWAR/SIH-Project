# SDG Nexus — SIH 2026
### Problem Statement SIH26043 | Government of Jharkhand | Smart Education Theme

**SDG Nexus** is a multi-stakeholder collaborative innovation platform connecting 
communities, universities, industry (CSR), NGOs, and government around Jharkhand's 
documented societal challenges.

## Live Demo
🌐 **[Link will be added after deployment]**

## Demo Accounts (Password for all: `Demo@1234`)
| Role | Email |
|------|-------|
| Citizen | citizen@jharkhand.gov.in |
| Government | collector@jharkhand.gov.in |
| University/HEI | faculty@nitjsr.ac.in |
| CSR Company | csr@tatasteel.com |
| NGO | admin@pradan.net |
| Student | student@nitjsr.ac.in |

## Tech Stack
- **Frontend/Backend**: Next.js 16.1.6 (App Router + Turbopack)
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL via Prisma ORM 7.4
- **Styling**: Tailwind CSS 4.2
- **Maps**: Leaflet + React-Leaflet
- **Auth**: JWT + bcryptjs
- **AI**: OpenAI GPT API with keyword fallback
- **Reports**: jsPDF

## Local Setup
```bash
git clone https://github.com/YRAJWAR/SIH-Project.git
cd SIH-Project
npm install
cp .env.example .env.local   # fill in your values
npx prisma migrate dev
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
npm run dev
```

## SIH 2026
- **PS Number**: SIH26043
- **Organization**: Government of Jharkhand
- **Theme**: Smart Education
