import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useObjects } from "../context/ObjectContext";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { getObjectCount, MAX_OBJECTS } = useObjects();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Image
          source={require("../assets/imgs/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>search it.</Text>

        <Text style={styles.description}>
          You can add {MAX_OBJECTS} specific objects to monitor
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddObject" as never)}
          disabled={getObjectCount() >= MAX_OBJECTS}
        >
          <Text style={styles.addButtonText}>
            <Text style={styles.plusIcon}>+</Text> Add Object
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Search It, 2025. All Rights Reserved.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1E88E5",
    marginBottom: 30,
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    marginBottom: 40,
    maxWidth: "80%",
  },
  addButton: {
    backgroundColor: "#1E88E5",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  plusIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginBottom: 20,
  },
});
