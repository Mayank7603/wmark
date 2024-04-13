import { useState, useRef, useEffect } from "react";
import { StyleSheet, View, Text, Pressable, PixelRatio } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";
import { Camera } from "expo-camera";
import React from "react";
import { Link, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Button from "../components/Button";
import ImageViewer from "../components/ImageViewer";
import EmojiSticker from "../components/EmojiSticker";
const PlaceholderImage = require("../assets/images/logo_2.png");
import * as SecureStore from "expo-secure-store";
import { DotIndicator } from "react-native-indicators";
import axios from "axios";
import { FontAwesome6, AntDesign } from "@expo/vector-icons";
import { Dimensions } from "react-native";
export default function Page(props) {
  const [loader, setLoader] = useState(false);
  const logoRef = useRef(null);
  const [pickedEmoji, setPickedEmoji] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.front);
  const [wType, setWType] = useState("");
  const [wVal, setWVal] = useState("");
  const [wPrp, setWPrp] = useState("");
  const [wwidth, setWwidth] = useState(0);
  const [wheight, setWheight] = useState(0);

  // Location
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lct, setlct] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access camera was denied");
      }
    })();
  }, []);

  useEffect(() => {
    setWwidth(Dimensions.get("window").width - 20);
    setWheight(Dimensions.get("window").height - 200);
  }, []);

  useEffect(() => {
    (async () => {
      const sessionData = await SecureStore.getItemAsync("sessionData");
      const tempData = await SecureStore.getItemAsync("Property");
      const tempData1 = await SecureStore.getItemAsync("markText");
      const tempData2 = await SecureStore.getItemAsync("wType");
      const templocation = await SecureStore.getItemAsync("datalct");
      setlct(JSON.parse(templocation));
      console.log(templocation);

      setWPrp(JSON.parse(tempData));
      setWVal(tempData1);
      setWType(tempData2);

      if (sessionData === null) {
        loadLogo();
      } else {
        setPickedEmoji(sessionData);
      }
    })();
  }, []);

  const loadLogo = async () => {
    setPickedEmoji(null);
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPickedEmoji(result.assets[0].uri.toString());
      logoRef.current = result.assets[0].uri.toString();
      await SecureStore.setItemAsync(
        "sessionData",
        result.assets[0].uri.toString()
      );
    } else {
      alert("You did not select any Logo.");
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef();

  if (status === null) {
    requestPermission();
  }

  const takePicture = async () => {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync();
      setSelectedImage(photo.uri);
    }
    setLoader(true);

    setTimeout(async () => {
      await onSaveImageAsync();
      setLoader(false);
    }, 3000);
  };

  const onReset = () => {
    setSelectedImage(null);
  };

  const onSaveImageAsync = async () => {
    try {
      const localUri = await captureRef(imageRef, {
        height: wheight,
        width: wwidth,
        quality: 1,
        format: "png",
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      if (localUri) {
        // alert("Saved!");
      }
    } catch (e) {
      console.log(e);
    }
    onReset();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View>
        <View
          ref={imageRef}
          collapsable={false}
          style={{ height: wheight, marginBottom: 10 }}
        >
          {selectedImage ? (
            <ImageViewer
              // ref={imageRef}
              style={styles.imageContainer}
              placeholderImageSource={PlaceholderImage}
              selectedImage={selectedImage}
            />
          ) : (
            <View
              style={{
                height: wheight,
                width: wwidth,
              }}
            >
              <Camera
                ref={(ref) => {
                  this.camera = ref;
                }}
                style={styles.imageContainer}
                type={cameraType}
              ></Camera>
            </View>
          )}
          {!loader ? (
            <View>
              <View style={styles.locationView}>
                <Text style={styles.location}>{lct.street}</Text>
                <Text style={styles.location}>{lct.postcode}</Text>
                <Text style={styles.location}>{lct.city}</Text>
                <Text style={styles.location}>{lct.state}</Text>
                <Text style={styles.location}>{lct.country}</Text>
              </View>
              <EmojiSticker
                imageSize={100}
                stickerSource={pickedEmoji}
                type={wType}
                val={wVal}
                valProp={wPrp}
              />
            </View>
          ) : (
            ""
          )}
        </View>

        {!loader ? (
          <View style={styles.footerContainer2}>
            <Pressable
              onPress={() => {
                router.replace("/");
              }}
            >
              <View
                style={{
                  padding: 9,
                  borderWidth: 2,
                  borderRadius: 11,
                  borderColor: "yellow",
                }}
              >
                <AntDesign name="upload" size={20} color="white" />
              </View>
            </Pressable>
            <Pressable onPress={takePicture}>
              <View
                style={{
                  padding: 5,
                  borderWidth: 2,
                  borderColor: "yellow",
                  borderRadius: 100,
                }}
              >
                <View
                  style={{
                    padding: 12,
                    borderWidth: 2,
                    borderColor: "white",
                    borderRadius: 100,
                  }}
                >
                  <FontAwesome6 name="camera" color="white" size={26} />
                </View>
              </View>
            </Pressable>
            <Pressable onPress={toggleCameraType}>
              <View
                style={{
                  padding: 9,
                  borderWidth: 2,
                  borderRadius: 11,
                  borderColor: "yellow",
                }}
              >
                <FontAwesome6 name="camera-rotate" size={20} color="white" />
              </View>
            </Pressable>
          </View>
        ) : (
          <View
            style={{
              height: 100,
            }}
          >
            <DotIndicator color="#00ff12" style={{ backgroundColor: "#000" }} />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    alignItems: "center",
  },
  imageContainer: {
    flex: 1,
    paddingTop: 5,
    backgroundColor: "red",
  },
  footerContainer: {
    paddingTop: 265,
    flex: 1 / 3,
    alignItems: "center",
  },
  footerContainer2: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 30,
  },
  optionsContainer: {
    position: "absolute",
    bottom: 80,
  },
  optionsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  location: {
    color: "yellow",
    width: 330,
    padding: "4px",
  },
  locationView: {
    width: 350,
    padding: 4,
    paddingLeft: 10,
    top: -120,
  },
});
