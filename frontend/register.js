import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const RegisterScreen = () => {
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleRegister = () => {
    var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

var raw = JSON.stringify({
  "first_name": firstName,
  "last_name": lastName,
  "email": email,
  "password": password
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("http://localhost:3000/register", requestOptions)
  .then(response => response.text())
  .then((result) => {
    console.log(result);
    navigation.navigate("Login");
  })
  .catch(error => console.log('error', error));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>YuriShort</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        onChangeText={(text) => setFirst(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Cognome"
        onChangeText={(text) => setLast(text)}
      />
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
      <Pressable style={styles.loginButton} onPress={handleRegister}>
        <Text style={styles.loginButtonText}>Iscriviti</Text>
      </Pressable>
    </View>
  );
};

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
  forgotPassword: {
    color: "#1877F2",
    marginBottom: 10,
  },
  signupLink: {
    color: "#1877F2",
  },
});

export default RegisterScreen;
