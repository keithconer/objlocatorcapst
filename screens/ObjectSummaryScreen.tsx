import { useNavigation } from "@react-navigation/native";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the Bluetooth icon
import { useObjects, ObjectItem } from "../context/ObjectContext"; // Import ObjectItem type

export default function ObjectSummaryScreen() {
  const navigation = useNavigation();
  const { objects, selectedObject, setSelectedObject } = useObjects();

  const handleSelectObject = (object: ObjectItem) => {
    // Define the type for `object`
    setSelectedObject(object);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Object</Text>
      {objects.map((object) => (
        <TouchableOpacity
          key={object.id}
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
  objectItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  objectName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  objectDescription: {
    fontSize: 14,
    color: "#666",
  },
  selectedObject: {
    backgroundColor: "#e6f5ff",
  },
  highlightedName: {
    color: "#1E88E5",
  },
  pairButton: {
    marginTop: 20,
    backgroundColor: "#1E88E5",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row", // Add flexDirection to align icon and text
    justifyContent: "center",
  },
  icon: {
    marginRight: 8, // Add margin to separate icon from text
  },
  pairButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
