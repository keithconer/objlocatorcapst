import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import AddObjectScreen from "./screens/AddObjectScreen";
import ObjectSummaryScreen from "./screens/ObjectSummaryScreen";
import { ObjectProvider } from "./context/ObjectContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ObjectProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddObject" component={AddObjectScreen} />
          <Stack.Screen name="ObjectSummary" component={ObjectSummaryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ObjectProvider>
  );
}
