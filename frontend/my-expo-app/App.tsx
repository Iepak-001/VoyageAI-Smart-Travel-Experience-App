// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
// No 'styled' import needed here
import {VoyageAIScreen} from './screens/VoyageAIScreen';
import { SafeAreaView } from 'react-native';
import { EditScreenInfo } from 'components/EditScreenInfo';
/**
 * The root component of the VoyageAI application.
 * It sets up the status bar and renders the main single screen, VoyageAIScreen.
 * SafeAreaView is used directly with NativeWind classNames to ensure content is not
 * obscured by notches or status bars on mobile devices.
 */
export default function App() {
  return (
    // Use SafeAreaView to handle notches and status bars on iOS
    // Apply flex-1 and background color to ensure it fills the screen
    <SafeAreaView className="flex-1 bg-background p-8">
      <StatusBar/> Manages the device's status bar appearance
      <VoyageAIScreen /> {/* .Render the main screen of the application */}
      {/* <EditScreenInfo path='Hello_World'/> Render the main single screen of the application */}
    </SafeAreaView>
  );
}

