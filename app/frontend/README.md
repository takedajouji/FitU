# FitU Frontend - Barebones UI/UX Testing Interface

A clean, functional web interface to test all FitU backend features including food logging, exercise tracking, calorie balance, and AI recommendations.

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd /Users/takeda/Project/Front-end/FitU/app
node backend/src/server.js
```

### 2. Open the Frontend
Open `index.html` in your web browser or serve it with a local server:

```bash
# Option 1: Simple file open
open frontend/index.html

# Option 2: Local server (recommended)
cd frontend
python3 -m http.server 8080
# Then visit: http://localhost:8080
```

## 🔐 Authentication

The frontend uses Firebase Authentication with two options:
- **Google Sign-in** (recommended for testing)
- **Email/Password** (for existing accounts)

Once authenticated, you'll get access to all features with your JWT token automatically included in API requests.

## ✨ Features Tested

### 📊 Dashboard
- Real-time calorie balance overview
- Daily food vs exercise calories
- Goal status tracking
- One-click refresh

### 🍎 Food Logging
- Log food with nutritional details
- Support for meals (breakfast, lunch, dinner, snack)
- Macronutrient tracking (protein, carbs, fat)
- View daily food entries

### 💪 Exercise Logging
- Select from available exercises
- Smart hybrid calorie calculation
- Optional sets, reps, weight tracking
- Exercise notes and ratings
- View daily exercise logs

### ⚖️ Calorie Balance
- Daily calorie balance analysis
- Weekly trends and patterns
- Overall summary statistics
- Goal progress tracking

### 🤖 AI Recommendations
- Personalized workout suggestions
- Quick workout generation
- Progressive workout plans
- Goal-based recommendations

### 🔧 System Testing
- Backend health checks
- Authentication status
- API connectivity tests

## 🎯 How to Test

1. **Start with Authentication**: Login with Google or create an account
2. **Check Dashboard**: Click "🔄 Refresh" to load your current data
3. **Log Some Food**: Add a few food entries with different meals
4. **Log Exercise**: Select exercises and log your workouts
5. **View Balance**: Check your daily calorie balance
6. **Try AI Features**: Get personalized workout recommendations
7. **Test System**: Verify health and auth status

## 🛠️ Technical Details

### Frontend Stack
- **HTML5** - Clean semantic structure
- **CSS3** - Modern responsive design with gradients
- **Vanilla JavaScript** - No frameworks, pure JS
- **Firebase SDK v9** - Client-side authentication
- **Fetch API** - RESTful backend communication

### API Integration
- **Automatic JWT authentication** - Tokens included in all requests
- **Error handling** - User-friendly error messages
- **Loading states** - Visual feedback for all operations
- **Real-time updates** - Data refreshes after operations

### Security Features
- **Firebase JWT verification** - Secure authentication
- **CORS handling** - Proper cross-origin requests
- **Token refresh** - Automatic token management
- **Error boundaries** - Graceful error handling

## 🎨 UI/UX Design

### Clean & Modern
- **Gradient headers** - Professional purple/blue theme
- **Card-based layout** - Organized sections
- **Responsive design** - Works on mobile and desktop
- **Loading animations** - Smooth user experience

### User-Friendly
- **Clear navigation** - Logical feature organization
- **Instant feedback** - Success/error messages
- **Form validation** - Required fields and proper types
- **Data visualization** - JSON displays for development

### Accessibility
- **Semantic HTML** - Screen reader friendly
- **Color contrast** - WCAG compliant colors
- **Keyboard navigation** - Full keyboard support
- **Mobile responsive** - Touch-friendly interface

## 🔍 Debug Features

Open browser console for debug functions:
```javascript
// Refresh all data
FitUApp.refreshAll()

// Clear all displays
FitUApp.clearAllData()

// Test all features
FitUApp.testAllFeatures()

// Show custom message
showMessage("Test message", "success")

// Access Firebase auth
FirebaseAuth.getCurrentUser()

// Access APIs directly
FoodAPI.getDailyEntries()
ExerciseAPI.getAvailableExercises()
```

## 📱 Mobile Support

The interface is fully responsive and works well on:
- **Desktop browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Android Chrome)
- **Tablet browsers** (iPad, Android tablets)

## 🚨 Troubleshooting

### Authentication Issues
- Make sure Firebase credentials are properly set in backend
- Check browser console for Firebase errors
- Try Google login if email login fails

### API Connection Issues
- Verify backend server is running on port 3000
- Check browser network tab for failed requests
- Ensure CORS is properly configured

### Data Loading Issues
- Click refresh buttons to reload data
- Check authentication status
- Verify API endpoints are responding

## 🔧 Development Notes

### File Structure
```
frontend/
├── index.html          # Main UI structure
├── styles.css          # All styling and animations
├── firebase-config.js  # Firebase setup and auth
├── api-client.js       # Backend API communication
├── ui-handlers.js      # Form handling and UI updates
├── app.js             # Main app initialization
└── README.md          # This documentation
```

### API Endpoints Tested
- `GET /api/health` - Server health
- `POST /api/calorie-entries` - Log food
- `GET /api/calorie-entries/daily` - Daily food
- `POST /api/exercise-logging` - Log exercise
- `GET /api/exercise-logging/exercises` - Available exercises
- `GET /api/calorie-balance/daily` - Daily balance
- `GET /api/ai-recommendations/*` - AI features

This frontend provides a complete testing interface for your FitU backend, demonstrating the full hybrid Firebase + MySQL authentication system in action! 🎉
