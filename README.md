# Gaia (Winner of IBM's prompt for GreenHax'25)

> "How would your actions change if you knew what their consequences were?"

Gaia was built with that thought in mind, to showcase how small changes in our day-to-day life can compound into a positive difference for the environment and to enlighten individuals of the shadow effects that their actions create which causes harm to the environment.

## Design Process
- The app is designed with gamification features and creative user-friendly interface to engage the users and prompt them to take actions. You can look at our design process and the research behind Gaia, at our [Notion Page](https://jagged-look-a81.notion.site/Project-Gaia-Green-Hacks-1c4e83d29f6180a2896fc94cc00444a5).

## Features

- **Mirror Dashboard**: For tracking your contribution towards environment sustainability
- **Daily Tasks**: Daily actions that individuals could take for the environment 
- **Global Impact**: View interactive 3D Earth model with environmental metrics, reflecting Earth's current health
- **Carbon Trace**: Calculate emissions from flights, vehicles, shipping, electricity and fuel combustion

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Three.js
- **Backend**: Node.js, Express, MongoDB
- **APIs**: [Carbon Interface API](https://docs.carboninterface.com) for emissions calculations

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Carbon Interface API key

### Installation

1. Clone the repository
2. Install backend dependencies: `cd backend && npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Create environment variables (see below)
5. Start the backend: `cd backend && npm run dev`
6. Start the frontend: `cd frontend && npm run dev`
7. Open `http://localhost:3000` in your browser

### Environment Variables

Backend (.env):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gaia
CARBON_INTERFACE_API_KEY=your_api_key
```

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```
