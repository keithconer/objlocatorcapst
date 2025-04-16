"use client";

import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useObjects } from "../context/ObjectContext";
import { Ionicons } from "@expo/vector-icons";

export default function AddObjectScreen() {
  const navigation = useNavigation();
  const { addObject, getObjectCount, MAX_OBJECTS } = useObjects();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!name.trim()) {
      alert("Please enter an object name");
      return;
    }

    setIsLoading(true);

    try {
      await addObject({
        name: name.trim(),
        description: description.trim(),
      });

      // Simulate a brief loading period
      setTimeout(() => {
        setIsLoading(false);
        setIsModalVisible(true);
      }, 500);
    } catch (error) {
      setIsLoading(false);
      alert(error instanceof Error ? error.message : "Failed to add object");
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);

    // Automatically navigate to the object list screen when the limit is reached
    if (getObjectCount() === MAX_OBJECTS) {
      navigation.navigate("ObjectSummary" as never);
    }
  };

  const currentStep = getObjectCount(); // Start counting from 1/3

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1E88E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Object</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Object name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter object name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Write a very short description where you usually place this object."
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.confirmButtonText}>Confirm Object</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={30} color="#fff" />
            </View>

            <Text style={styles.modalTitle}>Added Successfully</Text>

            <Text style={styles.modalDescription}>
              You may now be able to perform search actions on this specific
              object you've added.
            </Text>

            <Text style={styles.stepIndicator}>
              {currentStep}/{MAX_OBJECTS}
            </Text>

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.footer}>Search It, 2025. All Rights Reserved.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: "#1E88E5",
    marginRight: 30, // To offset the back button and center the title
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  confirmButton: {
    backgroundColor: "#1E88E5",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  checkCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1E88E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E88E5",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  stepIndicator: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E88E5",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#1E88E5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginBottom: 20,
  },
});
