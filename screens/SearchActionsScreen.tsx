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
  const opacity = useRef(new Animated.Value(1)).current; // For blinking effect

  // Modal states
  const [disconnectModalVisible, setDisconnectModalVisible] =
    useState<boolean>(false);

  // Function to determine proximity from RSSI
  const getProximityLabel = (rssiValue: number): string => {
    if (rssiValue >= -50) return "Very Near";
    if (rssiValue >= -63) return "Near";
    if (rssiValue >= -75) return "Far";
    return "Very Far";
  };

  // Real-time RSSI updates
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
      } catch (err) {
        console.error("Error reading RSSI:", err);
      }
    };

    const interval = setInterval(updateRSSI, 500); // Updated every 500ms for real-time updates

    // Listen for disconnection
    const disconnectSubscription = connectedDevice.onDisconnected(() => {
      console.log("Device Disconnected!");
      handleDisconnect();
    });

    return () => {
      clearInterval(interval);
      disconnectSubscription.remove();
    };
  }, [connectedDevice]);

  // Radar blinking effect
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

    return () => animation.stop(); // Stop animation on unmount
  }, [opacity]);

  // Handle disconnect
  const handleDisconnect = () => {
    setDisconnectModalVisible(true);
    // Immediately navigate back
    navigation.goBack();
  };

  // Placeholder functions for buzzer and light
  const handleBuzzer = () => {
    console.log("Buzzer button pressed");
    // Implement BLE write commands here
  };

  const handleLight = () => {
    console.log("Light button pressed");
    // Implement BLE write commands here
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo and Header */}
      <Image source={require("../assets/imgs/logo.png")} style={styles.logo} />
      <Text style={styles.searchItHeader}>search it.</Text>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1E88E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Ionicons
          name="search"
          size={40}
          color="#1E88E5"
          style={styles.searchIcon}
        />
        <Text style={styles.title}>search it.</Text>
        <Text style={styles.description}>
          You may now perform search actions.
        </Text>

        {/* RSSI Display with updated format */}
        <Animated.View style={[styles.rssiContainer, { opacity }]}>
          <Text style={styles.rssiLabel}>
            Your <Text style={styles.cardText}>{objectName}</Text>
          </Text>
          <Text style={styles.rssiValue}>
            {rssi !== null
              ? `is ${proximity} away from you`
              : "is searching for signal..."}
          </Text>
        </Animated.View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleBuzzer}>
          <Ionicons name="volume-high" size={24} color="#1E88E5" />
          <Text style={styles.actionText}>Buzzer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLight}>
          <Ionicons name="flash" size={24} color="#1E88E5" />
          <Text style={styles.actionText}>Light</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Search It, 2025. All Rights Reserved.
      </Text>

      {/* Disconnection Modal */}
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
              You have been disconnected due to distance limitations, ensure you
              are within the 10-15 meters distance away from the microcontroller
              and keep the bluetooth on.
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
    width: 60,
    height: 60,
    alignSelf: "center",
    marginBottom: 10,
    resizeMode: "contain",
  },
  searchItHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E88E5",
    textAlign: "center",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  backButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  searchIcon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1E88E5",
    marginBottom: 24,
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
  rssiValue: {
    fontSize: 16,
    color: "#666666",
    marginTop: 5,
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
  // Modal styles
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
