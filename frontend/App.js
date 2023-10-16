// Import necessary dependencies
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native'; 
import AppNavigator from './AppNavigator'; // Import the navigation setup from AppNavigator

// Define the default function which will be exported
export default function App() {

  // This function renders a view with StatusBar and the AppNavigator
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />  // StatusBar comes from Expo. It puts a status bar (battery, time, notifications) at the top of the screen
      <AppNavigator /> // This is the navigation setup, imported from AppNavigator
    </View>
  );
}

// StyleSheet.create is a way of making an object of styles that can be referenced by components
const styles = StyleSheet.create({
  container: {
    flex: 1, // Makes the container take up the full screen
    backgroundColor: '#fff', // Set the background color of the screen
    justifyContent: 'center', // Aligns children of a container in the center of the container's main axis
  },
});