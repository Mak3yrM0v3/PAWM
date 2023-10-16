import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import { 
  Alert,
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  Linking 
} from 'react-native';
// Define DashboardScreen component
const DashboardScreen = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [urlList, setUrlList] = useState([]);
  const navigation = useNavigation();
  // Function to shorten the url using API call
  const handleShortenUrl = () => {
    const jwtToken = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${jwtToken}`);
    
    var raw = JSON.stringify({
      "url": originalUrl
    });
    
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };
    
    fetch("http://localhost:3000/url-shortner/url", requestOptions)
      .then(response => response.json())
      .then(result => {
        getShortenUrl();
        setOriginalUrl('');
      })
      .catch(error => console.log('error', error));
  };
  //Function to fetch all shortened urls related to the current authenticated account
  const getShortenUrl = () => {
    const jwtToken = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${jwtToken}`);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    
    fetch("http://localhost:3000/url-shortner/url", requestOptions)
      .then(response => response.json())
      .then(result => {
        setUrlList(result);
      })
      .catch(error => console.log('error', error));
  }

  // Function to delete a shortened url by its id
  const deleteShortenUrl = (shortUrl) => {
    const jwtToken = localStorage.getItem("token");
    var requestOptions = {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwtToken}`
      },
      redirect: 'follow'
    };

    fetch(`http://localhost:3000/url-shortner/url/${shortUrl}`, requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log("Delete operation result:", result);
        if (result.message === 'URL deleted successfully') {
          getShortenUrl();
        }
      })
      .catch(error => console.log('error', error));
  };
    // Function to open original url in browser
const openUrl = (shortUrl) => {
  // take the shortUrl and re-construct full URL
  const fullShortUrl = `http://localhost:3000/${shortUrl}`;

  // open the full short URL in the browser
  Linking.openURL(fullShortUrl);
};
   // Function to delete user account using API call
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("http://localhost:3000/account", {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
      });
  
      if (response.status === 200) {
        navigation.navigate('Login');
      } else {
        console.error('Error while deleting account');
        window.alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error while deleting account:', error);
      
    }
};
  useEffect(() => {
    getShortenUrl();
  }, []);

  return (
    <View style={styles.page}>
      <View style={styles.container}>
        <Text style={styles.header}>Insert URL to shorten!</Text>
        <Text style={styles.inputLabel}></Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your URL here" 
          onChangeText={(text) => setOriginalUrl(text)} 
          value={originalUrl} 
          accessible={true} 
          accessibilityLabel="URL Input"
        />
        <TouchableOpacity 
          style={styles.shortenButton} 
          onPress={handleShortenUrl} 
          accessible={true} 
          accessibilityLabel="Shorten URL Button"
          accessibilityRole="button" 
        >
          <Text style={styles.shortenButtonText}>Create Short URL</Text>
        </TouchableOpacity>
        <ScrollView style={styles.urlList}>
          {
            urlList.map((urlEntry, index) => (
              <View key={index} style={styles.urlItemContainer}>
                <TouchableOpacity 
                  onPress={() => openUrl(urlEntry.shortUrl)} 
                  accessible={true} 
                  accessibilityRole="link" 
                  accessibilityHint={`Link to Shortened URL ${index + 1}`} 
                  
                >
                  
                  <Text style={[styles.urlItem, styles.urlItemLink]}>Shortened URL {index + 1}: {urlEntry.shortUrl}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => deleteShortenUrl(urlEntry.shortUrl)} 
                  accessible={true} 
                  accessibilityRole="button" 
                  accessibilityLabel={`Delete Shortened URL ${index + 1}`} 
                >
                  <Text style={styles.deleteButton}>X</Text>
                </TouchableOpacity>
              </View>
            ))
          }
          <TouchableOpacity 
           style={styles.deleteAccountButton} 
           onPress={handleDeleteAccount} 
           accessible={true}
           accessibilityLabel="Delete Account Button"
           accessibilityRole="button"
           accessibilityHint="Deletes your account and exits the application"
         >
           <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { width: '33%', padding: 20 },
  header: { fontSize: 24, textAlign: 'center', margin: 10 },
  inputLabel: { fontSize: 16, marginTop: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1 },
  shortenButton: { backgroundColor: '#3498db', padding: 10, margin: 15, height: 40, alignItems: 'center', justifyContent: 'center' },
  shortenButtonText: { color: 'white' },
  urlList: { marginTop: 20 },
  urlItemContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  urlItem: { flex: 0.9, paddingRight: 5 },
  urlItemLink: { color: '#0000EE', textDecorationLine: 'underline' },
  deleteButton: { flex: 0.1, color: 'red', textAlign: 'center' },
});

export default DashboardScreen;