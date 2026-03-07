import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  HomeScreen,
  DancesScreen,
  ActivitiesScreen,
  ProfileScreen,
  AboutScreen,
  CreditsScreen,
  BuyCreditsScreen,
  QRScannerScreen,
  AdminSessionScreen,
  AdminAttendanceScreen,
  EllaScreen,
  EllaKnutselenScreen,
  EllaRekenenScreen,
  EllaMaaltafelPuzzelScreen,
  EllaVariaScreen,
  EllaDinoQuizScreen,
  EllaPlanetPuzzelScreen,
  QuizJoinScreen,
  QuizPlayScreen,
} from "../screens/main";
import { MainTabParamList, MainStackParamList } from "./types";
import { colors, fontSize } from "../styles/theme";
import { Text } from "react-native";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
  );
}

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green[500],
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: "500",
          marginBottom: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dances"
        component={DancesScreen}
        options={{
          tabBarLabel: "Dansen",
          tabBarIcon: ({ focused }) => <TabIcon icon="💃" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          tabBarLabel: "Activiteiten",
          tabBarIcon: ({ focused }) => <TabIcon icon="🎉" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profiel",
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Credits"
        component={CreditsScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="BuyCredits"
        component={BuyCreditsScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="AdminSession"
        component={AdminSessionScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="AdminAttendance"
        component={AdminAttendanceScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Ella"
        component={EllaScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="EllaKnutselen"
        component={EllaKnutselenScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="EllaRekenen"
        component={EllaRekenenScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="EllaMaaltafelPuzzel"
        component={EllaMaaltafelPuzzelScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="EllaVaria"
        component={EllaVariaScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="EllaDinoQuiz"
        component={EllaDinoQuizScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="EllaPlanetPuzzel"
        component={EllaPlanetPuzzelScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="QuizJoin"
        component={QuizJoinScreen}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="QuizPlay"
        component={QuizPlayScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
}
