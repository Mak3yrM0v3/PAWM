// Import necessary dependencies
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

// Define LoginScreen component
const LoginScreen = () => {
  // Setup useState hooks to handle email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Use navigation from react navigation
  const navigation = useNavigation();

  const handleGoToRegister = () => {
    // Navigation function to Register screen
    navigation.navigate("Register");
  };

  const handleLogin = async () => {
    try {
      // Send POST request to login endpoint
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
  
      if (response.status === 200) {
        // If login successful, store the returned token
        const data = await response.json();
        const token = data.token;
        localStorage.setItem("token", token);
        // Clear form fields after successful login.
        setEmail(' ');
        setPassword(' ');
        // Navigate to Dashboard
        navigation.navigate("Dashboard");
      } else {
        // If login unsuccessful, log the error and alert the user
        console.error('Errore durante il login');
        window.alert('Credenziali Errate');
      }
    } catch (error) {
      // Log any login error
      console.error('Errore durante il login:', error);
      
    }
  };
  
  // Render the LoginScreen component  
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>YuriShortUrl</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={(text) => setPassword(text)}
      />
      <Pressable style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Accedi</Text>
      </Pressable>
      <Pressable style={styles.loginButton} onPress={handleGoToRegister}>
        <Text style={styles.loginButtonText}>Registrati</Text>
      </Pressable>
    </View>
  );
};

// Styles for components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    fontSize: 36,
    color: "#1877F2",
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  loginButton: {
    backgroundColor: "#1877F2",
    width: 300,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  loginButtonText: {
    color: "white",
  },
});

// Export default LoginScreen component
export default LoginScreen;