//https://aboutreact.com/example-of-image-picker-in-react-native/   arayüz bu siteden uyarlanmıştır
//https://medium.com/@mlapeter/using-google-cloud-vision-with-expo-and-react-native-7d18991da1dd    googleGonder fonksiyonu bu siteden uyarlanmıştır.

// Import React
import React, { useState } from 'react';

// Import required components
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';

// Import Image Picker
// import ImagePicker from 'react-native-image-picker';
import {
  launchCamera,
  launchImageLibrary
} from 'react-native-image-picker';

import { utils } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

const App = () => {

  const [filePath, setFilePath] = useState({});
  let responseJson;


  const kameraIzinIste = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Kamera İzni',
            message: 'Uygulamanın kamera iznine ihtiyacı var',
          },
        );
        // KAMERA İzni verilirse
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else return true;
  };

  const yazmaIzniIste = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Harici Depolama Yazma İzni',
            message: 'Uygulamanın yazma iznine ihtiyacı var',
          },
        );
        //HARİCİ DEPOLAMA YAZMA İzni verilirse
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        alert('İzin yazma hatası', err);
      }
      return false;
    } else return true;
  };

  const goruntuYakala = async (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
      saveToPhotos: true,
    };
    let kameraIzinKontrol = await kameraIzinIste();
    let depolamaIzinKontrol = await yazmaIzniIste();
    if (kameraIzinKontrol && depolamaIzinKontrol) {
      launchCamera(options, (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          alert('Kullanıcı kamera seçiciyi iptal etti');
          return;
        } else if (response.errorCode == 'camera_unavailable') {
          alert('Kamera cihazda kullanılamıyor');
          return;
        } else if (response.errorCode == 'permission') {
          alert('İzin karşılanmadı');
          return;
        } else if (response.errorCode == 'others') {
          alert(response.errorMessage);
          return;
        }
        console.log('base64 -> ', response.base64);
        console.log('uri -> ', response.uri);
        console.log('width -> ', response.width);
        console.log('height -> ', response.height);
        console.log('fileSize -> ', response.fileSize);
        console.log('type -> ', response.type);
        console.log('fileName -> ', response.fileName);
        setFilePath(response);

        this.fireBaseyolla(response);
        //this.googleGonder(response.fileName);
      });
    }
  };

  const galeridenSec = (type) => {
    let options = {
      mediaType: type,
      maxWidth: 300,
      maxHeight: 550,
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        alert('Kullanıcı kamera seçiciyi iptal etti');
        return;
      } else if (response.errorCode == 'camera_unavailable') {
        alert('Kamera cihazda kullanılamıyor');
        return;
      } else if (response.errorCode == 'permission') {
        alert('İzin karşılanmadı');
        return;
      } else if (response.errorCode == 'others') {
        alert(response.errorMessage);
        return;
      }
      console.log('base64 -> ', response.base64);
      console.log('uri -> ', response.uri);
      console.log('width -> ', response.width);
      console.log('height -> ', response.height);
      console.log('fileSize -> ', response.fileSize);
      console.log('type -> ', response.type);
      console.log('fileName -> ', response.fileName);
      setFilePath(response);

      this.fireBaseyolla(response);
      //this.googleGonder(response.fileName);
    });
  };

  googleGonder = async () => {
    try {
      console.log("response.fileName::"+filePath.fileName);
      let body = JSON.stringify({
        requests: [
          {
            features: [
              { type: "OBJECT_LOCALIZATION", maxResults: 10 }
            ],
            image: {
              source: {
                imageUri:"gs://fir-9c05f.appspot.com/"+filePath.fileName
              }
            }
          }
        ]
      });
      let response = await fetch(
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCDeMpZfHohH9Q2K2Yd3fpAKul_pTc8a-Q",
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: body
        }
      );
      responseJson = await response.json();
      nesne=responseJson.responses[0].localizedObjectAnnotations.length;
      console.log('number of objects -> '+nesne);
      console.log(JSON.stringify(responseJson));     
    } catch (error) {
      console.log(error);
    }
  };

  fireBaseyolla = async response => {
    try{
      await storage().ref(response.fileName).putFile(response.uri);
    }catch(error){
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.titleText}>
        HOŞGELDİNİZ
      </Text>
      <View style={styles.container}>
        {/* <Image
          source={{
            uri: 'data:image/jpeg;base64,' + filePath.data,
          }}
          style={styles.imageStyle}
        /> */}
        <Image
          source={{ uri: filePath.uri }}
          style={styles.imageStyle}
        />
        <Text style={styles.textStyle}>{filePath.uri}</Text>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => goruntuYakala('photo')}>
          <Text style={styles.textStyle}>
            Kamera'yı Aç
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => galeridenSec('photo')}>
          <Text style={styles.textStyle}>Galeriden Seç</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={() => this.googleGonder()} >
          <Text style={styles.textStyle}>Analiz Et</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#2f4f4f',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
    backgroundColor: '#bc8f8f',
    color: '#faebd7',
  },
  textStyle: {
    padding: 10,
    color: 'black',
    textAlign: 'center',

  },
  buttonStyle: {
    alignItems: 'center',
    backgroundColor: '#b0c4de',
    padding: 5,
    marginVertical: 10,
    width: 250,
    borderRadius: 50,
  },
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
})