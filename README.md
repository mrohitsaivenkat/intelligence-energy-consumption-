# SMART HOUSEHOLD ENERGY

## AI-Powered Consumption, Analysis, Forecasting & Energy Services Platform

A premium full-stack web application for Indian households to monitor energy, analyze bills, and optimize consumption using AI.

### Features
- **Smart Energy Dashboard**: Real-time monitoring and analytics.
- **AI Energy Assistant**: Mistral-powered chat for energy advice.
- **Bill Analyzer**: PDF/Image bill processing with AI insights.
- **ML Forecasting**: Predictive analysis of future consumption.
- **Solar ROI Calculator**: Personalized solar potential analysis.
- **Service Marketplace**: Connect with certified energy providers.

### Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide React.
- **Backend**: FastAPI (Python), SQLAlchemy, MySQL.
- **ML**: Scikit-learn, XGBoost, Pandas.
- **AI**: Mistral AI (Generative AI).

### Setup

#### Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL Server

#### Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `pip install -r requirements.txt`
3. Configure `.env` with your `MISTRAL_API_KEY` and `DATABASE_URL`.
4. Run server: `python src/main.py`

#### ML Service Setup
1. Navigate to `ml-service/`
2. Install dependencies: `pip install -r requirements.txt`
3. Run server: `python app/main.py`

#### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

### Project Structure
- `frontend/`: React application.
- `backend/`: FastAPI application & business logic.
- `ml-service/`: Machine learning forecasting service.
- `prisma/`: Database schema (if using Prisma, otherwise SQLAlchemy models are in backend).
