// components/InputGroup.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
// No 'styled' import needed here

interface InputGroupProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  buttonText: string;
  onButtonPress: () => void;
  isButtonDisabled: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  loading?: boolean; // To show loading state on button
  buttonColor?: string; // Tailwind color class for button background
}

/**
 * A reusable component for an input field with a label and an associated button.
 * Supports single-line or multiline text input.
 * Uses direct NativeWind classNames for styling.
 */
const InputGroup: React.FC<InputGroupProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  buttonText,
  onButtonPress,
  isButtonDisabled,
  multiline = false,
  numberOfLines = 1,
  loading = false,
  buttonColor = "bg-primary" // Default button color
}) => {
  const handlePress = () => {
    if (!value.trim()) {
      Alert.alert("Input Required", `Please enter ${label.toLowerCase()} to proceed.`);
      return;
    }
    onButtonPress();
  };

  return (
    <View className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <Text className="text-base font-semibold text-gray-700 mb-2">{label}</Text>
      <TextInput
        className="border border-gray-300 rounded-md p-3 text-base text-gray-800 mb-4 focus:border-accentBlue focus:ring-1 focus:ring-accentBlue"
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        style={multiline ? { height: numberOfLines * 20 + 20 } : {}} // Basic height for multiline
      />
      <TouchableOpacity
        onPress={handlePress}
        disabled={isButtonDisabled || loading}
        className={`py-3 rounded-lg flex-row items-center justify-center ${buttonColor} ${
          (isButtonDisabled || loading) ? 'opacity-60' : 'active:opacity-80'
        }`}
      >
        {loading ? (
          <Text className="text-white font-bold text-lg">Processing...</Text>
        ) : (
          <Text className="text-white font-bold text-lg">{buttonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default InputGroup;

