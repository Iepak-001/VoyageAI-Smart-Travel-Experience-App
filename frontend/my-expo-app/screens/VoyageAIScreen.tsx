// screens/VoyageAIScreen.tsx
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert, ActivityIndicator } from 'react-native';
import { generateGeminiContent, generateStructuredGeminiContent } from '../api/geminiApi';
import LoadingIndicator from '../components/LoadingIndicator';
import SectionHeader from '../components/SectionHeader';
import InputGroup from '../components/InputGroup';
import ResultDisplay from '../components/ResultDisplay';

// Firebase imports
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The single main screen for the VoyageAI application.
 * It integrates all AI functionalities: Itinerary Generation, Sentiment Analysis,
 * Visit Sequencing (simulated), YouTube Video Suggestions (simulated), and
 * Content-based Recommendations (simulated).
 * Uses Gemini API for all AI interactions and direct NativeWind classNames for styling.
 */
const VoyageAIScreen: React.FC = () => {
  // --- State for Firebase/Auth ---
  const [db, setDb] = useState<any>(null);
  const [auth, setAuth] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  // useEffect hook to handle Firebase initialization and authentication on component mount
  useEffect(() => {
    const initializeFirebase = async () => {
      let firebaseAppInstance;
      try {
        let firebaseConfig = {};
        // Attempt to parse __firebase_config from the environment
        if (typeof __firebase_config !== 'undefined' && __firebase_config) {
          try {
            firebaseConfig = JSON.parse(__firebase_config);
          } catch (parseError) {
            console.error("Failed to parse __firebase_config JSON:", parseError);
            setFirebaseError("Failed to parse Firebase configuration from environment. Please check the environment setup.");
            setIsAuthReady(true);
            return;
          }
        } else {
          // If __firebase_config is not provided at all, this is a critical environment issue.
          console.error("Firebase config (__firebase_config) not found in environment. Cannot initialize Firebase.");
          setFirebaseError("Firebase configuration is missing from the environment. Please ensure it's provided.");
          setIsAuthReady(true);
          return;
        }

        console.log("Received Firebase Config:", firebaseConfig);

        // --- Firebase App Initialization ---
        if (!getApps().length) {
          firebaseAppInstance = initializeApp(firebaseConfig);
          console.log("Firebase app initialized.");
        } else {
          firebaseAppInstance = getApp();
          console.log("Firebase app already initialized, reusing existing app.");
        }

        // --- Firebase Auth Initialization with Persistence ---
        const firebaseAuth = initializeAuth(firebaseAppInstance, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage)
        });
        console.log("Firebase Auth initialized with AsyncStorage persistence.");

        const firestoreDb = getFirestore(firebaseAppInstance); // Get Firestore instance
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        // --- User Authentication ---
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          console.log("Attempting to sign in with custom token...");
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
          console.log("Signed in with custom token.");
        } else {
          console.log("No custom token found, signing in anonymously...");
          await signInAnonymously(firebaseAuth);
          console.log("Signed in anonymously.");
        }

        onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("Firebase User ID (from onAuthStateChanged):", user.uid);
          } else {
            setUserId(null);
            console.log("No Firebase user signed in (from onAuthStateChanged).");
          }
          setIsAuthReady(true);
        });
      } catch (e: any) {
        console.error("Error initializing Firebase:", e);
        let errorMessage = "An unknown error occurred during Firebase initialization.";
        if (e.code) {
          errorMessage = `Firebase Error (${e.code}): ${e.message}`;
        } else if (e.message) {
          errorMessage = `Error: ${e.message}`;
        }
        setFirebaseError(errorMessage);
        setIsAuthReady(true);
      }
    };

    initializeFirebase();
  }, []);

  // --- State for Itinerary Generation ---
  const [itineraryDestination, setItineraryDestination] = useState('');
  const [itineraryPreferences, setItineraryPreferences] = useState('');
  const [itineraryResult, setItineraryResult] = useState('');
  const [itineraryLoading, setItineraryLoading] = useState(false);

  // --- State for Sentiment Analysis ---
  const [reviewText, setReviewText] = useState('');
  const [reviewAnalysisPros, setReviewAnalysisPros] = useState('');
  const [reviewAnalysisCons, setReviewAnalysisCons] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // --- State for Visit Sequencing (Simulated) ---
  const [attractionsList, setAttractionsList] = useState('');
  const [sequencingResult, setSequencingResult] = useState('');
  const [sequencingLoading, setSequencingLoading] = useState(false);

  // --- State for YouTube Video Suggestions (Simulated) ---
  const [videoTopic, setVideoTopic] = useState('');
  const [videoSuggestions, setVideoSuggestions] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);

  // --- State for Content-based Recommendations (Simulated) ---
  const [recommendationInterests, setRecommendationInterests] = useState('');
  const [recommendationResult, setRecommendationResult] = useState('');
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // --- Handlers for AI Functionalities ---

  /**
   * Handles the generation of a custom travel itinerary.
   * Calls the Gemini API with destination and preferences.
   */
  const handleGenerateItinerary = async () => {
    if (!itineraryDestination.trim()) {
      Alert.alert("Input Required", "Please enter a travel destination.");
      return;
    }
    setItineraryLoading(true);
    setItineraryResult('');
    const prompt = `Generate a detailed travel itinerary for ${itineraryDestination}. ${
      itineraryPreferences ? `The traveler's preferences are: ${itineraryPreferences}.` : ''
    } Include daily activities, suggested places to visit, and estimated times. Focus on a 3-day trip. Make it creative and engaging.`;

    try {
      const result = await generateGeminiContent(prompt);
      setItineraryResult(result);
    } catch (error: any) {
      Alert.alert("Error", `Failed to generate itinerary: ${error.message}`);
    } finally {
      setItineraryLoading(false);
    }
  };

  /**
   * Handles the sentiment analysis of a user review.
   * Calls the Gemini API to extract pros and cons in a structured format.
   */
  const handleAnalyzeReview = async () => {
    if (!reviewText.trim()) {
      Alert.alert("Input Required", "Please enter a user review to analyze.");
      return;
    }
    setReviewLoading(true);
    setReviewAnalysisPros('');
    setReviewAnalysisCons('');

    // Define the schema for the structured response
    const reviewSchema = {
      type: "OBJECT",
      properties: {
        pros: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        cons: {
          type: "ARRAY",
          items: { type: "STRING" }
        }
      },
      required: ["pros", "cons"]
    };

    const prompt = `Analyze the following user review and extract the key pros and cons. Provide the output as a JSON object with two arrays: "pros" and "cons". If no pros or cons are found, return empty arrays.
    Review: "${reviewText}"`;

    try {
      const result = await generateStructuredGeminiContent(prompt, reviewSchema);
      setReviewAnalysisPros(result.pros.join('\n- '));
      setReviewAnalysisCons(result.cons.join('\n- '));
    } catch (error: any) {
      Alert.alert("Error", `Failed to analyze review: ${error.message}`);
    } finally {
      setReviewLoading(false);
    }
  };

  /**
   * Handles the simulation of AI-based visit sequencing.
   * Calls the Gemini API to order a list of attractions.
   */
  const handleSequenceAttractions = async () => {
    if (!attractionsList.trim()) {
      Alert.alert("Input Required", "Please enter a list of attractions.");
      return;
    }
    setSequencingLoading(true);
    setSequencingResult('');
    const prompt = `Given the following attractions: ${attractionsList}. Suggest an optimal visit sequence, considering logical flow and typical travel patterns. Assume these are in a single city. Provide the output as a numbered list.`;

    try {
      const result = await generateGeminiContent(prompt);
      setSequencingResult(result);
    } catch (error: any) {
      Alert.alert("Error", `Failed to sequence attractions: ${error.message}`);
    } finally {
      setSequencingLoading(false);
    }
  };

  /**
   * Handles the simulation of YouTube video suggestions.
   * Calls the Gemini API to suggest relevant video titles and descriptions.
   */
  const handleSuggestVideos = async () => {
    if (!videoTopic.trim()) {
      Alert.alert("Input Required", "Please enter a video topic.");
      return;
    }
    setVideoLoading(true);
    setVideoSuggestions('');
    const prompt = `Suggest 3-5 relevant YouTube video titles and brief descriptions (1-2 sentences each) for the travel topic: "${videoTopic}". Format as a numbered list.`;

    try {
      const result = await generateGeminiContent(prompt);
      setVideoSuggestions(result);
    } catch (error: any) {
      Alert.alert("Error", `Failed to suggest videos: ${error.message}`);
    } finally {
      setVideoLoading(false);
    }
  };

  /**
   * Handles the simulation of content-based recommendations.
   * Calls the Gemini API to provide personalized travel suggestions.
   */
  const handleGetRecommendations = async () => {
    if (!recommendationInterests.trim()) {
      Alert.alert("Input Required", "Please enter your travel interests.");
      return;
    }
    setRecommendationLoading(true);
    setRecommendationResult('');
    const prompt = `Based on the following travel interests: "${recommendationInterests}", provide 3-5 personalized travel destination or activity recommendations. Explain briefly why each recommendation is suitable.`;

    try {
      const result = await generateGeminiContent(prompt);
      setRecommendationResult(result);
    } catch (error: any) {
      Alert.alert("Error", `Failed to get recommendations: ${error.message}`);
    } finally {
      setRecommendationLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="items-center mb-6">
        <Text className="text-4xl font-extrabold text-primary mt-8 mb-2">VoyageAI</Text>
        <Text className="text-lg text-gray-600 text-center">Your Smart Travel Experience</Text>
        {/* Display User ID once authentication is ready */}
        {isAuthReady && userId && (
          <Text className="text-xs text-gray-500 mt-2">User ID: {userId}</Text>
        )}
      </View>

      {/* Display Firebase Initialization Status */}
      {!isAuthReady && (
        <View className="my-4 p-4 bg-blue-100 rounded-lg flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#2196F3" />
          <Text className="ml-3 text-blue-800">Initializing Firebase...</Text>
        </View>
      )}
      {firebaseError && (
        <View className="my-4 p-4 bg-red-100 rounded-lg">
          <Text className="text-red-800 font-semibold">Firebase Error:</Text>
          <Text className="text-red-700 text-sm">{firebaseError}</Text>
          <Text className="text-red-600 text-xs mt-1">Please ensure Firebase configuration is correctly provided by the environment.</Text>
        </View>
      )}

      {/* Itinerary Generation Section */}
      <View className="mb-8 p-4 bg-white rounded-xl shadow-md">
        <SectionHeader
          title="Custom Itinerary Generator"
          icon={<Text className="text-2xl">✈️</Text>}
        />
        <InputGroup
          label="Travel Destination"
          placeholder="e.g., Paris, Japan, Coastal California"
          value={itineraryDestination}
          onChangeText={setItineraryDestination}
          buttonText="Generate Itinerary"
          onButtonPress={handleGenerateItinerary}
          isButtonDisabled={itineraryLoading || !isAuthReady || !!firebaseError}
          loading={itineraryLoading}
          buttonColor="bg-primary"
        />
        <InputGroup
          label="Travel Preferences (Optional)"
          placeholder="e.g., historical sites, food tours, relaxing beaches"
          value={itineraryPreferences}
          onChangeText={setItineraryPreferences}
          buttonText="Add Preferences (for next generation)"
          onButtonPress={() => Alert.alert("Preferences Added", "Preferences will be used in the next itinerary generation.")}
          isButtonDisabled={false}
          multiline
          numberOfLines={3}
          buttonColor="bg-gray-500"
        />
        {itineraryLoading && <LoadingIndicator message="Crafting your itinerary..." />}
        <ResultDisplay
          title="Generated Itinerary"
          content={itineraryResult}
          emptyMessage="Your custom itinerary will appear here."
        />
      </View>

      {/* Sentiment Analysis Section */}
      <View className="mb-8 p-4 bg-white rounded-xl shadow-md">
        <SectionHeader
          title="User Review Analyzer"
          icon={<Text className="text-2xl">💬</Text>}
        />
        <InputGroup
          label="Paste User Review"
          placeholder="e.g., 'The hotel was fantastic, great service and clean rooms, but the breakfast was a bit pricey.'"
          value={reviewText}
          onChangeText={setReviewText}
          buttonText="Analyze Review"
          onButtonPress={handleAnalyzeReview}
          isButtonDisabled={reviewLoading || !isAuthReady || !!firebaseError}
          loading={reviewLoading}
          multiline
          numberOfLines={5}
          buttonColor="bg-accentGreen"
        />
        {reviewLoading && <LoadingIndicator message="Analyzing sentiment..." />}
        {(reviewAnalysisPros || reviewAnalysisCons) ? (
          <View className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <Text className="text-base font-semibold text-gray-700 mb-2">Review Analysis:</Text>
            <Text className="text-sm font-medium text-gray-800">Pros:</Text>
            <Text className="text-sm text-gray-800 mb-2 whitespace-pre-wrap">
              {reviewAnalysisPros ? `- ${reviewAnalysisPros}` : 'None found.'}
            </Text>
            <Text className="text-sm font-medium text-gray-800">Cons:</Text>
            <Text className="text-sm text-gray-800 whitespace-pre-wrap">
              {reviewAnalysisCons ? `- ${reviewAnalysisCons}` : 'None found.'}
            </Text>
          </View>
        ) : (
          <ResultDisplay
            title="Review Analysis"
            content=""
            emptyMessage="Pros and cons will appear here after analysis."
          />
        )}
      </View>

      {/* Visit Sequencing Section (Simulated) */}
      <View className="mb-8 p-4 bg-white rounded-xl shadow-md">
        <SectionHeader
          title="AI-based Visit Sequencing"
          icon={<Text className="text-2xl">🗺️</Text>}
        />
        <InputGroup
          label="List of Attractions (comma-separated)"
          placeholder="e.g., Eiffel Tower, Louvre Museum, Notre Dame Cathedral, Arc de Triomphe"
          value={attractionsList}
          onChangeText={setAttractionsList}
          buttonText="Sequence Attractions"
          onButtonPress={handleSequenceAttractions}
          isButtonDisabled={sequencingLoading || !isAuthReady || !!firebaseError}
          loading={sequencingLoading}
          multiline
          numberOfLines={3}
          buttonColor="bg-accentBlue"
        />
        {sequencingLoading && <LoadingIndicator message="Optimizing sequence..." />}
        <ResultDisplay
          title="Optimal Visit Sequence"
          content={sequencingResult}
          emptyMessage="The optimal visit order will appear here."
        />
      </View>

      {/* YouTube Video Integration Section (Simulated) */}
      <View className="mb-8 p-4 bg-white rounded-xl shadow-md">
        <SectionHeader
          title="Relevant Travel Videos"
          icon={<Text className="text-2xl">🎬</Text>}
        />
        <InputGroup
          label="Travel Video Topic"
          placeholder="e.g., 'Best food in Rome', 'Hiking trails in Patagonia'"
          value={videoTopic}
          onChangeText={setVideoTopic}
          buttonText="Suggest Videos"
          onButtonPress={handleSuggestVideos}
          isButtonDisabled={videoLoading || !isAuthReady || !!firebaseError}
          loading={videoLoading}
          buttonColor="bg-red-500"
        />
        {videoLoading && <LoadingIndicator message="Finding videos..." />}
        <ResultDisplay
          title="Suggested Videos"
          content={videoSuggestions}
          emptyMessage="Relevant travel videos will be suggested here."
        />
      </View>

      {/* Content-based Recommendation System Section (Simulated) */}
      <View className="mb-8 p-4 bg-white rounded-xl shadow-md">
        <SectionHeader
          title="Personalized Recommendations"
          icon={<Text className="text-2xl">✨</Text>}
        />
        <InputGroup
          label="Your Travel Interests"
          placeholder="e.g., adventure sports, cultural immersion, luxury travel, budget backpacking"
          value={recommendationInterests}
          onChangeText={setRecommendationInterests}
          buttonText="Get Recommendations"
          onButtonPress={handleGetRecommendations}
          isButtonDisabled={recommendationLoading || !isAuthReady || !!firebaseError}
          loading={recommendationLoading}
          multiline
          numberOfLines={3}
          buttonColor="bg-purple-600"
        />
        {recommendationLoading && <LoadingIndicator message="Generating recommendations..." />}
        <ResultDisplay
          title="Your Personalized Recommendations"
          content={recommendationResult}
          emptyMessage="Personalized travel suggestions will appear here."
        />
      </View>

      <View className="h-20" /> {/* Spacer for bottom */}
    </ScrollView>
  );
};

export default VoyageAIScreen;
