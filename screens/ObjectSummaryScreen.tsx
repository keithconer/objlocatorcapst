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
  Image,
  Pressable,
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingObject, setEditingObject] = useState<ObjectItem | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Load objects from storage when the app starts
  useEffect(() => {
    const loadObjects = async () => {
      try {
        const storedObjects = await AsyncStorage.getItem("objects");
        if (storedObjects) {
          setObjects(JSON.parse(storedObjects));
        } else {
          setObjects([]);
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

    const updatedObjects = objects.map((obj) =>
      obj.id === editingObject.id
        ? { ...obj, name: newName.trim(), description: newDescription.trim() }
        : obj
    );

    setObjects(updatedObjects);

    try {
      await AsyncStorage.setItem("objects", JSON.stringify(updatedObjects));
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Failed to save changes:", error);
    }
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
    </SafeAreaView>
  );
}

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
    color: "#333",
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
});
