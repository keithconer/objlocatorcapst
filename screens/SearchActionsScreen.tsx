import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Image,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Device } from "react-native-ble-plx";
import { RootStackParamList } from "../App";

type SearchActionsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SearchActions"
>;

const SearchActionsScreen = ({
  route,
  navigation,
}: SearchActionsScreenProps) => {
  const { connectedDevice, objectName = "object" } = route.params || {};
  const [rssi, setRssi] = useState<number | null>(null);
  const [proximity, setProximity] = useState<string>("Unknown");
  const opacity = useRef(new Animated.Value(1)).current;

  // Modal states
  const [disconnectModalVisible, setDisconnectModalVisible] =
    useState<boolean>(false);

  // Determine proximity based on RSSI
  const getProximityLabel = (rssiValue: number): string => {
    if (rssiValue >= -50) return "Very Near";
    if (rssiValue >= -63) return "Near";
    if (rssiValue >= -75) return "Far";
    return "Very Far";
  };

  useEffect(() => {
    if (!connectedDevice) return;

    const updateRSSI = async () => {
      try {
        const updatedDevice = await connectedDevice.readRSSI();
        const rssiValue = updatedDevice.rssi;

        if (typeof rssiValue === "number") {
          setRssi(rssiValue);
          setProximity(getProximityLabel(rssiValue));
        }
      } catch (error) {
        console.error("Error reading RSSI:", error);
      }
    };

    const interval = setInterval(updateRSSI, 1000);

    return () => clearInterval(interval);
  }, [connectedDevice]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  // Reconnection logic
  const reconnectDevice = async () => {
    if (!connectedDevice) return;

    try {
      await connectedDevice.connect();
      console.log("Reconnected to ESP32 successfully.");
    } catch (error) {
      console.error("Error reconnecting to ESP32:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo and Header */}
      <Image source={require("../assets/imgs/logo.png")} style={styles.logo} />
      <Text style={styles.title}>search it.</Text>

      <View style={styles.content}>
        <Text style={styles.description}>
          You may now perform search actions.
        </Text>

        <Animated.View style={[styles.rssiContainer, { opacity }]}>
          <Text style={styles.rssiLabel}>
            Your <Text style={styles.cardText}>{objectName}</Text>{" "}
            {rssi !== null
              ? `${rssi} (${proximity})`
              : "is searching for signal..."}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={reconnectDevice}>
          <Ionicons name="refresh" size={24} color="#1E88E5" />
          <Text style={styles.actionText}>Reconnect</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        Search It, 2025. All Rights Reserved.
      </Text>

      <Modal
        animationType="fade"
        transparent={true}
        visible={disconnectModalVisible}
        onRequestClose={() => setDisconnectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={50} color="red" />
            <Text style={[styles.modalTitle, { color: "red" }]}>
              Connection Lost
            </Text>
            <Text style={styles.modalText}>
              You have been disconnected. Please ensure you are within range.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setDisconnectModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1E88E5",
    textAlign: "center",
    marginBottom: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginBottom: 40,
  },
  rssiContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#F0F8FF",
    borderRadius: 10,
    width: "100%",
  },
  rssiLabel: {
    fontSize: 18,
    color: "#333333",
  },
  cardText: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: "#1E88E5",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1E88E5",
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: "#333333",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: "100%",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default SearchActionsScreen;
