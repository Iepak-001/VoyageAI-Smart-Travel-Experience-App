// components/LoadingIndicator.tsx
import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
// No 'styled' import needed here

interface LoadingIndicatorProps {
  message?: string;
}

/**
 * A reusable loading indicator component with an optional message.
 * Uses ActivityIndicator for the spinner and direct NativeWind classNames for styling.
 */
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message = "Loading..." }) => {
  return (
    <View className="flex-row items-center justify-center p-4 bg-white rounded-lg shadow-md my-4">
      <ActivityIndicator size="small" color="#6200EE" />
      <Text className="ml-3 text-base text-gray-700 font-medium">
        {message}
      </Text>
    </View>
  );
};

export default LoadingIndicator;

