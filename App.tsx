import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import AddObjectScreen from "./screens/AddObjectScreen";
import ObjectSummaryScreen from "./screens/ObjectSummaryScreen";
import SearchActionsScreen from "./screens/SearchActionsScreen";
import { ObjectProvider } from "./context/ObjectContext";
import { Device } from "react-native-ble-plx";

export type RootStackParamList = {
  Home: undefined;
  AddObject: undefined;
  ObjectSummary: { objectId: string };
  SearchActions: {
    connectedDevice: Device | null;
    objectName?: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ObjectProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddObject" component={AddObjectScreen} />
          <Stack.Screen name="ObjectSummary" component={ObjectSummaryScreen} />
          <Stack.Screen
            name="SearchActions"
            component={SearchActionsScreen}
            options={{
              animation: "slide_from_right",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ObjectProvider>
  );
}
