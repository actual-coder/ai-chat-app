import { View, Text, TouchableOpacity } from "react-native";
import React, { useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTheme } from "@/providers/theme-provider";
import { StyleSheet } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { toast } from "sonner-native";
import * as ImagePicker from "expo-image-picker";
import type { MediaType } from "expo-image-picker";

export default function Camera() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const callbackUrl = params.callbackUrl;

  const [facing, setFacing] = useState<"front" | "back">("back");
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) return <View />;

  if (!permission.granted) {
    requestPermission();
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  const returnWithImage = (uri: string) => {
    if (!callbackUrl) {
      router.back();
      return;
    }

    router.replace({
      pathname: callbackUrl as any,
      params: {
        imageUri: uri,
      },
    });
  };

  const toggleFacing = () =>
    setFacing((prev) => (prev === "front" ? "back" : "front"));

  const takePicture = async () => {
    const cam = cameraRef.current;
    if (!cam) return toast.error("Camera does not exist");

    try {
      const photo = await cam.takePictureAsync({ quality: 1 });
      if (photo.uri) returnWithImage(photo.uri);
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to capture image");
    }
  };

  const pickImage = async () => {
    try {
      const mediaTypes: MediaType[] = [];
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        returnWithImage(result.assets[0].uri);
      }
    } catch (error) {
      toast.error("Failed to pick image");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Feather name="x" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
          <Feather name="image" size={28} color={"white"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={toggleFacing}>
          <Ionicons name="camera-reverse-outline" size={32} color={"white"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  closeBtn: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
  },
  camera: { flex: 1 },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
    paddingTop: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sideButton: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "white",
  },
});
