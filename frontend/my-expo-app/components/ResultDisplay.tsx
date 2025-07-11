// components/ResultDisplay.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
// No 'styled' import needed here

interface ResultDisplayProps {
  title: string;
  content: string;
  emptyMessage?: string;
}

/**
 * A reusable component to display AI-generated text results.
 * It provides a scrollable area for longer content and a message when content is empty.
 * Uses direct NativeWind classNames for styling.
 */
const ResultDisplay: React.FC<ResultDisplayProps> = ({
  title,
  content,
  emptyMessage = "No results to display yet. Generate something!"
}) => {
  return (
    <View className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
      <Text className="text-base font-semibold text-gray-700 mb-2">{title}</Text>
      {content ? (
        <ScrollView className="max-h-60"> {/* Limit height for scrollability */}
          <Text className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{content}</Text>
        </ScrollView>
      ) : (
        <Text className="text-sm text-gray-500 italic">{emptyMessage}</Text>
      )}
    </View>
  );
};

export default ResultDisplay;

