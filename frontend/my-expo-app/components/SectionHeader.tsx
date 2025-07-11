// components/SectionHeader.tsx
import React from 'react';
import { View, Text } from 'react-native';
// No 'styled' import needed here

interface SectionHeaderProps {
  title: string;
  icon?: React.ReactNode; // Optional icon element
}

/**
 * A reusable component for displaying section headers with a title and optional icon.
 * Uses direct NativeWind classNames for consistent styling.
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, icon }) => {
  return (
    <View className="flex-row items-center mb-4 pb-2 border-b border-gray-200">
      {icon && <View className="mr-2">{icon}</View>}
      <Text className="text-xl font-bold text-primary">
        {title}
      </Text>
    </View>
  );
};

export default SectionHeader;

