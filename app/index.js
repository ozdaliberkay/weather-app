import { StyleSheet } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "../screens/MainScreen";
import CityWeather from "../screens/CityWeather";

const Stack = createNativeStackNavigator();

export default function index() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerTitle: "Weather" }}>
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="Cityweather" component={CityWeather} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
