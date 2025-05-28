# Cover Page App

A modern, dark-themed Expo React Native app with a TopBar, BottomNavBar, and dynamic content pages.

## Features

- Dark, transparent, glassy modern UI
- TopBar with user profile and credits display
- BottomNavBar with 4 navigation options
- Dynamic content rendering based on navigation selection
- DM Sans font integration

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

3. Download DM Sans fonts from Google Fonts and place them in the `assets/fonts` directory:
   - DMSans-Regular.ttf
   - DMSans-Medium.ttf
   - DMSans-Bold.ttf

### Running the App

```
npm start
```
or
```
yarn start
```

This will start the Expo development server. You can then run the app on:
- iOS Simulator
- Android Emulator
- Physical device using the Expo Go app

## Project Structure

```
cover-page/
├── App.js             # Main app component
├── index.js           # App entry point
├── package.json       # Project dependencies
├── assets/            # Static assets
│   ├── fonts/         # Custom fonts
│   └── ...            # Icons and images
├── components/        # Reusable UI components
│   ├── TopBar.js      # Top navigation bar
│   └── BottomNavBar.js # Bottom navigation bar
└── screens/           # App screens
    ├── HomePage.js
    ├── CreatePage.js
    ├── ToolsPage.js
    └── SettingsPage.js
``` 