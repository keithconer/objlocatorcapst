import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage for persistent storage
import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal,
  TextInput,
  BackHandler,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

interface ObjectItem {
  id: string;
  name: string;
  description: string;
}

export default function ObjectSummaryScreen() {
  const navigation = useNavigation();
  const [objects, setObjects] = useState<ObjectItem[]>([]);
  const [selectedObject, setSelectedObject] = useState<ObjectItem | null>(null);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [renamingObject, setRenamingObject] = useState<ObjectItem | null>(null);
  const [newName, setNewName] = useState("");
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  // Load objects from storage when the app starts
  useEffect(() => {
    const loadObjects = async () => {
      try {
        const storedObjects = await AsyncStorage.getItem("objects");
        if (storedObjects) {
          setObjects(JSON.parse(storedObjects));
        } else {
          // If no objects are found in storage, initialize with default data
          const defaultObjects = [
            { id: "1", name: "Object 1", description: "Description 1" },
            { id: "2", name: "Object 2", description: "Description 2" },
            { id: "3", name: "Object 3", description: "Description 3" },
          ];
          setObjects(defaultObjects);
        }
      } catch (error) {
        console.error("Failed to load objects:", error);
      }
    };

    loadObjects();
  }, []);

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
        return true; // Prevent default behavior
      }
    );

    return () => {
      backHandler.remove(); // Cleanup listener
    };
  }, []);

  const handleSelectObject = (object: ObjectItem) => {
    setSelectedObject(object);
  };

  const handleOpenRenameModal = (object: ObjectItem) => {
    setRenamingObject(object);
    setNewName(object.name); // Pre-fill the current name in the input
    setIsRenameModalVisible(true);
  };

  const handleRenameObject = async () => {
    if (!renamingObject || !newName.trim()) {
      alert("Please enter a valid name.");
      return;
    }

    const updatedObjects = objects.map((obj) =>
      obj.id === renamingObject.id ? { ...obj, name: newName.trim() } : obj
    );

    setObjects(updatedObjects); // Update the state

    try {
      await AsyncStorage.setItem("objects", JSON.stringify(updatedObjects)); // Save to persistent storage
      setIsRenameModalVisible(false); // Close the rename modal
      setIsSuccessModalVisible(true); // Show the success modal
    } catch (error) {
      console.error("Failed to save renamed object:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Object</Text>
      {objects.map((object) => (
        <View key={object.id} style={styles.objectRow}>
          <TouchableOpacity
            style={[
              styles.objectItem,
              selectedObject?.id === object.id && styles.selectedObject,
            ]}
            onPress={() => handleSelectObject(object)}
          >
            <Text
              style={[
                styles.objectName,
                selectedObject?.id === object.id && styles.highlightedName,
              ]}
            >
              {object.name}
            </Text>
            <Text style={styles.objectDescription}>{object.description}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editIcon}
            onPress={() => handleOpenRenameModal(object)}
          >
            <Ionicons name="pencil" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      ))}
      {selectedObject && (
        <TouchableOpacity style={styles.pairButton}>
          <Ionicons
            name="bluetooth"
            size={20}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.pairButtonText}>Pair Device</Text>
        </TouchableOpacity>
      )}

      {/* Rename Object Modal */}
      <Modal visible={isRenameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.renameModalContent}>
            <Text style={styles.modalTitle}>Rename Object</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new object name"
            />
            <TouchableOpacity
              style={styles.renameButton}
              onPress={handleRenameObject}
            >
              <Text style={styles.renameButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsRenameModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={isSuccessModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.modalTitle}>Details Updated</Text>
            <Text style={styles.successMessage}>
              This specific object has been renamed successfully.
            </Text>
            <TouchableOpacity
              style={styles.okButton}
              onPress={() => setIsSuccessModalVisible(false)}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  objectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  objectItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    flex: 1,
  },
  objectName: {
    fontSize: 16,
    fontWeight: "400",
    color: "#555",
  },
  objectDescription: {
    fontSize: 14,
    color: "#888",
  },
  selectedObject: {
    backgroundColor: "#e6f5ff",
  },
  highlightedName: {
    color: "#1E88E5",
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
  icon: {
    marginRight: 8,
  },
  pairButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  renameModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  successModalContent: {
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
    color: "#333",
  },
  successMessage: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
  },
  renameButton: {
    backgroundColor: "#1E88E5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  renameButtonText: {
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
  okButton: {
    backgroundColor: "#1E88E5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  okButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
