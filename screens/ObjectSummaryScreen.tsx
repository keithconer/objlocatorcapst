import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
  Pressable,
  BackHandler,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BleManager, Device } from "react-native-ble-plx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useObjects, ObjectItem } from "../context/ObjectContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

type ObjectSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ObjectSummary"
>;

const ObjectSummaryScreen = ({
  route,
  navigation,
}: ObjectSummaryScreenProps) => {
  const { objects } = useObjects();
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingObject, setEditingObject] = useState<ObjectItem | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // BLE state
  const [manager] = useState(() => new BleManager());
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [successModalVisible, setSuccessModalVisible] =
    useState<boolean>(false);
  const [disconnectModalVisible, setDisconnectModalVisible] =
    useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);

  // Disable the hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert(
          "Action Restricted",
          "You cannot go back from this screen.",
          [{ text: "OK", onPress: () => {} }]
        );
        return true;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleOpenEditModal = (object: ObjectItem) => {
    setEditingObject(object);
    setNewName(object.name);
    setNewDescription(object.description);
    setIsEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    if (!editingObject || !newName.trim() || !newDescription.trim()) {
      alert("Please fill in both name and description.");
      return;
    }

    // Update object logic could go here
    setIsEditModalVisible(false);
  };

  // Bluetooth pairing functions
  const handleScan = async () => {
    if (!selectedObject) {
      Alert.alert("Error", "Please select an object first");
      return;
    }

    console.log("Starting BLE scan...");

    if (!isScanning) {
      setIsScanning(true);
      setModalVisible(true);

      if (Platform.OS === "android" && Platform.Version >= 23) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);

        if (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !==
            PermissionsAndroid.RESULTS.GRANTED ||
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !==
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("Permissions denied");
          setIsScanning(false);
          setModalVisible(false);
          return;
        }
      }

      console.log("Permissions granted, scanning for ESP32...");

      manager.startDeviceScan(null, null, async (error, device) => {
        if (error) {
          console.error("Scan Error:", error);
          setIsScanning(false);
          setModalVisible(false);
          return;
        }

        if (device?.name) console.log(`Found device: ${device.name}`);

        if (device?.name === "ESP32-Locator") {
          console.log("ESP32-Locator found, attempting to connect...");
          manager.stopDeviceScan();

          try {
            const connectedDevice = await device.connect();
            console.log("Connected to ESP32!");

            await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log("Services discovered!");

            setConnectedDevice(connectedDevice);
            setModalVisible(false);
            setSuccessModalVisible(true);

            // Listen for disconnection
            device.onDisconnected(() => {
              console.log("ESP32 Disconnected!");
              handleDisconnect();
            });
          } catch (err) {
            console.error("Connection Failed:", err);
            setIsScanning(false);
            setModalVisible(false);
          }
        }
      });

      setTimeout(() => {
        console.log("Scan timed out, stopping scan.");
        manager.stopDeviceScan();
        setIsScanning(false);
        setModalVisible(false);
      }, 10000);
    }
  };

  const handleDisconnect = () => {
    setSuccessModalVisible(false);
    setDisconnectModalVisible(true);
    setConnectedDevice(null);
  };

  const handleCancel = () => {
    setIsScanning(false);
    setModalVisible(false);
  };

  const handleSuccess = () => {
    setSuccessModalVisible(false);
    navigation.navigate("SearchActions", {
      connectedDevice,
      objectName: selectedObject?.name || "object",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image source={require("../assets/imgs/logo.png")} style={styles.logo} />
      <Text style={styles.searchItHeader}>search it.</Text>

      {/* Title */}
      <Text style={styles.title}>Select Object</Text>

      {/* Object List */}
      {objects.map((object) => (
        <View key={object.id} style={styles.objectRow}>
          <Pressable
            style={({ pressed }) => [
              styles.objectItem,
              pressed && styles.objectItemHover,
            ]}
            onPress={() => setSelectedObject(object)}
          >
            <Text
              style={[
                styles.objectName,
                selectedObject?.id === object.id && styles.objectNameHover,
              ]}
            >
              {object.name}
            </Text>
            <Text style={styles.objectDescription}>{object.description}</Text>
          </Pressable>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => handleOpenEditModal(object)}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Pair Device Button */}
      {selectedObject && (
        <TouchableOpacity
          style={[styles.pairButton, isScanning && styles.buttonDisabled]}
          onPress={handleScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons
                name="bluetooth"
                size={20}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.pairButtonText}>Pair Device</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Footer */}
      <Text style={styles.footerText}>
        Search It, 2025. All Rights Reserved.
      </Text>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Edit Object</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new object name"
            />
            <TextInput
              style={styles.input}
              value={newDescription}
              onChangeText={setNewDescription}
              placeholder="Enter new object description"
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveChanges}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scanning Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.signalIcon}>
              <Ionicons name="cellular" size={40} color="#1E88E5" />
            </View>
            <Text style={styles.modalTitle}>Scanning</Text>
            <Text style={styles.modalText}>
              for the microcontroller broadcast signal, please wait{"\n"}until
              the scanning is done.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleCancel}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={handleSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={50} color="#1E88E5" />
            </View>
            <Text style={[styles.modalTitle, styles.successTitle]}>
              Paired Successfully
            </Text>
            <Text style={styles.modalText}>
              You are now connected to the{"\n"}microcontroller. You may now
              {"\n"}be able perform search actions.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccess}
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
    padding: 20,
    backgroundColor: "#fff",
  },
  searchItHeader: {
    fontSize: 26, // Matches the home screen size
    fontWeight: "bold",
    color: "#1E88E5", // Blue color
    textAlign: "center",
    marginTop: 8,
  },
  logo: {
    width: 60, // Matches the home screen size
    height: 60,
    alignSelf: "center",
    marginBottom: 10, // Proper spacing below the logo
    resizeMode: "contain", // Ensures the logo is not cut off
  },
  title: {
    fontSize: 14, // Slightly increased size for "Select Object"
    fontWeight: "400",
    color: "#888", // Gray color
    textAlign: "left",
    marginBottom: 8, // Closer to the object list
    marginTop: 16, // Adds space below the "search it." text
  },
  objectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  objectItem: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  objectItemHover: {
    backgroundColor: "#e6f5ff", // Light blue background on hover
  },
  objectName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888", // Default gray color
  },
  objectNameHover: {
    color: "#1E88E5", // Blue color on hover
  },
  objectDescription: {
    fontSize: 14,
    color: "#888",
  },
  editIcon: {
    marginLeft: 10,
  },
  pairButton: {
    marginTop: 20,
    backgroundColor: "#1E88E5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#90CAF9",
  },
  icon: {
    marginRight: 8,
  },
  pairButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  editModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#1E88E5",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: "#1E88E5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Bluetooth modal styles
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "80%",
    maxWidth: 320,
  },
  signalIcon: {
    marginBottom: 16,
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
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
  },
});

export default ObjectSummaryScreen;
