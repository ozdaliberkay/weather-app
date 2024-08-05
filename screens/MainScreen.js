import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from "react-native";
import cities from "../cities";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const screenWidth = Dimensions.get("window").width;
const itemWidth = (screenWidth - 60) / 2;

export default function MainScreen() {
  const navigation = useNavigation();
  const [searchCity, setSearchCity] = useState("");
  const [navlat, setNavlat] = useState(null);
  const [navlong, setNavlong] = useState(null);
  const [navcity, setNavcity] = useState(null);
  const [locdeny, setLocdeny] = useState(true);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState("");
  const [errorMsg, setErrorMsg] = useState(null);

  const goByCity = (i) => {
    navigation.navigate("Cityweather", {
      lat: i.latitude,
      long: i.longitude,
      cname: i.city,
    });
    setSearchCity("");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => goByCity(item)}
    >
      <Text style={styles.cityId}>{item.id}</Text>
      <Text style={styles.cityName}>{item.city}</Text>
    </TouchableOpacity>
  );

  const gobyLocation = () => {
    navigation.navigate("Cityweather", {
      lat: navlat,
      long: navlong,
      cname: navcity,
    });
  };

  useEffect(() => {
    if (!locdeny) {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permission to access location was denied");
          setLocdeny(true);
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation(location.coords);
          setLocdeny(false);
          const { latitude, longitude } = location.coords;
          fetchCityFromCoordinates(latitude, longitude);
        } catch (error) {
          console.error("Error getting location:", error);
          setErrorMsg(`Error getting location: ${error.message}`);
        }
      })();
    }
  }, [locdeny]);

  const fetchCityFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        setCity(data.results[0].components.city || "City not found");
        if (data.results[0].components.city) {
          setNavcity(data.results[0].components.city);
          setNavlat(latitude);
          setNavlong(longitude);
        }
      }
    } catch (error) {
      console.error("Error fetching city:", error);
    }
  };

  return (
    <View style={styles.container}>
      {navlat && navlong && navcity ? (
        <TouchableOpacity
          style={styles.locationBand}
          onPress={() => gobyLocation()}
        >
          <Text style={styles.locationText}>
            <Entypo name="location" size={20} color="#ff6f61" /> Weather for
            Current Location
          </Text>
        </TouchableOpacity>
      ) : locdeny ? (
        <TouchableOpacity
          style={styles.locationBand}
          onPress={() => setLocdeny(false)}
        >
          <Text style={styles.locationText}>Allow location access</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.locationBand}>
          <Text style={styles.locationText}>
            <FontAwesome name="spinner" size={30} color="#ff6f61" /> Location
            data is being awaited...
          </Text>
        </TouchableOpacity>
      )}

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      <TextInput
        style={styles.searchInput}
        value={searchCity}
        onChangeText={setSearchCity}
        placeholder="Search cities"
        placeholderTextColor="#b0bec5"
        autoCapitalize="none"
        keyboardType="default"
      />
      <FlatList
        data={cities.filter((c) =>
          c.city
            .toLocaleLowerCase("tr-TR")
            .includes(searchCity.toLocaleLowerCase("tr-TR"))
        )}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f3f4f6",
  },
  searchInput: {
    height: 45,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    fontSize: 16,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  itemContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 15,
    margin: 8,
    alignItems: "center",
    width: itemWidth,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cityId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6f61",
  },
  cityName: {
    fontSize: 16,
    color: "#607d8b",
  },
  locationBand: {
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 12,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationText: {
    fontSize: 18,
    color: "#607d8b",
  },
  error: {
    fontSize: 16,
    color: "red",
    marginVertical: 10,
  },
});
