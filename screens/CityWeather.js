import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRoute } from "@react-navigation/native";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
  ImageBackground,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const screenWidth = Dimensions.get("window").width;

const formatLabels = (labels) => {
  return labels.filter((_, index) => index % 3 === 0);
};

export default function CityWeather() {
  const route = useRoute();
  const { lat, long, cname } = route.params;
  const [day, setDay] = useState(0);
  const [dtype, setDtype] = useState(1);
  const [allData, setallData] = useState([]);
  const [cTime, setcTime] = useState("");
  const [cTemp, setcTemp] = useState("");
  const [cPrep, setcPrep] = useState("");
  const [cCloud, setcCloud] = useState("");
  const [cWind, setcWind] = useState("");
  const [cWeather, setcWeather] = useState("");
  const [daynames, setdaynames] = useState([]);
  const [dailyData, setdailyData] = useState([]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo:
      dtype === 1
        ? "#ffcfb5"
        : dtype === 2
        ? "#b0d9f2"
        : dtype === 3
        ? "#d1e7d1"
        : "#d3d3d3",
    backgroundGradientFromOpacity: 1,
    backgroundGradientToOpacity: 1,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e3e3e3",
    },
  };

  const data = {
    labels: allData[day] ? formatLabels(allData[day][0]) : [],
    datasets: [
      {
        data: allData[day] ? allData[day][dtype] : [],
        color: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
        strokeWidth: 4,
      },
    ],
    legend:
      dtype === 1
        ? ["Temperature °C"]
        : dtype === 2
        ? ["Precipitation Probability %"]
        : dtype === 3
        ? ["Cloud Cover %"]
        : ["Wind Speed km/h"],
  };

  const imageSources = {
    cloud: require("../images/cloud.png"),
    sunny: require("../images/sunny.png"),
    rain: require("../images/rain.png"),
    snow: require("../images/snow.png"),
  };

  const getImageSource = (imageName) => {
    return imageSources[imageName] || imageSources.cloud;
  };

  const setWeatherData = (wdata) => {
    let dayData = wdata.daily.time;
    const days = dayData.map((date) => {
      const day = new Date(date).getDay();
      return daysOfWeek[day];
    });
    setdaynames(days);
    let tdd = [];
    for (let i = 0; i < 7; i++) {
      let temp = {
        day: days[i],
        dayTemp: wdata.daily.temperature_2m_max[i],
        dayRain: wdata.daily.rain_sum[i],
        daySnow: wdata.daily.snowfall_sum[i],
        dayPrep: wdata.daily.precipitation_probability_max[i],
      };
      if (temp.dayPrep > 20) {
        if (temp.dayPrep > 38) {
          if (temp.dayRain > temp.daySnow && temp.dayRain != 0) {
            temp.img = "rain";
          } else if (temp.daySnow != 0) {
            temp.img = "snow";
          } else {
            temp.img = "cloud";
          }
        } else {
          temp.img = "cloud";
        }
      } else {
        temp.img = "sunny";
      }
      tdd.push(temp);
    }

    if (wdata.current.precipitation > 20) {
      if (
        wdata.current.rain > wdata.current.snowfall &&
        wdata.current.rain > 0
      ) {
        setcWeather("rain");
      } else if (wdata.current.snowfall != 0) {
        setcWeather("snow");
      } else {
        if (wdata.current.is_day == 1) {
          setcWeather("cloud");
        } else {
          setcWeather("n-cloud");
        }
      }
    } else if (wdata.current.cloud_cover > 35) {
      if (wdata.current.is_day == 1) {
        setcWeather("cloud");
      } else {
        setcWeather("n-cloud");
      }
    } else {
      if (wdata.current.is_day == 1) {
        setcWeather("sunny");
      } else {
        setcWeather("n-sunny");
      }
    }

    setdailyData(tdd);
    setcTime(wdata.current.time);
    setcTemp(wdata.current.temperature_2m);
    setcWind(wdata.current.wind_speed_10m);
    setcPrep(wdata.current.precipitation);
    setcCloud(wdata.current.cloud_cover);

    let tt = wdata.current.time.slice(0, -2) + "00";
    let i1 = wdata.hourly.time.indexOf(tt);
    let todayTimex = wdata.hourly.time.slice(i1, i1 + 24);
    let todayTime = todayTimex.map((time) => time.slice(-5));
    let todayTemp = wdata.hourly.temperature_2m.slice(i1, i1 + 24);
    let todayPrecP = wdata.hourly.precipitation_probability.slice(i1, i1 + 24);
    let todayCloud = wdata.hourly.cloud_cover.slice(i1, i1 + 24);
    let todayWind = wdata.hourly.wind_speed_10m.slice(i1, i1 + 24);

    let fullData = [];
    fullData.push([todayTime, todayTemp, todayPrecP, todayCloud, todayWind]);

    for (let i = 1; i < 7; i++) {
      let t1 = 24 * i;
      let t2 = 24 * (i + 1) - 1;
      let Timex = wdata.hourly.time.slice(t1, t2);
      let Time = Timex.map((time) => time.slice(-5));
      let Temp = wdata.hourly.temperature_2m.slice(t1, t2);
      let PrecP = wdata.hourly.precipitation_probability.slice(t1, t2);
      let Cloud = wdata.hourly.cloud_cover.slice(t1, t2);
      let Wind = wdata.hourly.wind_speed_10m.slice(t1, t2);
      fullData.push([Time, Temp, PrecP, Cloud, Wind]);
    }
    setallData(fullData);
  };

  const getWeather = async (lat, long) => {
    try {
      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m,is_day,precipitation,rain,snowfall,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation_probability,cloud_cover,wind_speed_10m&daily=temperature_2m_max,rain_sum,snowfall_sum,precipitation_probability_max&timezone=Europe%2FMoscow`
      );
      setWeatherData(response.data);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    getWeather(lat, long);
  }, [lat, long]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{cname}</Text>
        <View style={styles.weatherInfoContainer}>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text
              style={[styles.weatherText, { fontSize: 26, letterSpacing: 1 }]}
            >
              {daynames[0]}{" "}
            </Text>
            <Text
              style={[styles.weatherText, { fontSize: 26, letterSpacing: 1 }]}
            >
              {cTime.slice(-5)}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={{ marginRight: 4 }}>
                {cWeather == "sunny" ? (
                  <Fontisto name="day-sunny" size={114} color="#ffa74f" />
                ) : cWeather == "cloud" ? (
                  <Fontisto name="day-cloudy" size={110} color="#c9e2ff" />
                ) : cWeather == "rain" ? (
                  <Ionicons name="rainy-outline" size={124} color="#6aaefc" />
                ) : cWeather == "snow" ? (
                  <MaterialCommunityIcons
                    name="weather-snowy-heavy"
                    size={124}
                    color="#c5d4e6"
                  />
                ) : cWeather == "n-sunny" ? (
                  <Fontisto name="night-clear" size={114} color="#333333" />
                ) : (
                  <Fontisto
                    name="night-alt-cloudy"
                    size={114}
                    color="#4d4d4d"
                  />
                )}
              </Text>
            </View>
            <View style={{ marginLeft: 16 }}>
              <Text
                style={[styles.weatherText, { fontSize: 44, letterSpacing: 1 }]}
              >
                {cTemp} °C
              </Text>
              <Text style={styles.weatherText}>Precipitation : {cPrep} %</Text>
              <Text style={styles.weatherText}>
                Wind Speed: {cWind}
                <Text style={{ fontSize: 15 }}> km/h</Text>
              </Text>
            </View>
          </View>
        </View>
        <FlatList
          data={dailyData}
          keyExtractor={(item) => item.day}
          renderItem={({ item, index }) => (
            <View style={styles.flatListContainer}>
              <ImageBackground
                source={getImageSource(item.img)}
                style={styles.flatListItem}
                imageStyle={styles.flatListItemImage}
              >
                <TouchableOpacity
                  style={styles.flatListItemContent}
                  onPress={() => setDay(index)}
                >
                  <Text style={styles.flatListItemText}>{item.day}</Text>
                  <Text>{item.dayTemp} °C</Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          )}
          horizontal
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setDtype(1)}>
            <Text style={styles.buttonText}>Temperature</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#b0d9f2" }]}
            onPress={() => setDtype(2)}
          >
            <Text style={styles.buttonText}>Precipitation Probability</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#d1e7d1" }]}
            onPress={() => setDtype(3)}
          >
            <Text style={styles.buttonText}>Cloud Cover</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#d3d3d3" }]}
            onPress={() => setDtype(4)}
          >
            <Text style={styles.buttonText}>Wind Speed</Text>
          </TouchableOpacity>
        </View>

        {allData.length > 0 && (
          <View style={styles.chartContainer}>
            <LineChart
              data={data}
              width={screenWidth}
              height={260}
              chartConfig={chartConfig}
              bezier
              withVerticalLabels={true}
              withDots={false}
              style={styles.chart}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f0f4f8",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#333",
    letterSpacing: 1,
  },
  weatherInfoContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  weatherText: {
    fontSize: 18,
    color: "#555",
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  button: {
    backgroundColor: "#ffb74d",
    borderRadius: 8,
    width: "23%",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    elevation: 3,
  },
  buttonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  chartContainer: {
    marginVertical: 25,
  },
  chart: {
    borderRadius: 12,
    marginRight: 30,
    width: "100%",
    paddingRight: 50,
  },
  flatListContainer: {
    marginVertical: 15,
  },
  flatListItem: {
    width: 150,
    height: 90,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 7,
    borderRadius: 12,
    overflow: "hidden",
  },
  flatListItemImage: {
    borderRadius: 12,
  },
  flatListItemContent: {
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  flatListItemText: {
    fontSize: 18,
    color: "#333",
    letterSpacing: 0.5,
  },
});
