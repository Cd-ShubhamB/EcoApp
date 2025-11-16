import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";
import ProtectedRoute from "../components/ProtectedRoute";

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* All routes are protected except login/register */}
      <Stack>
        {/* Public routes */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="Register" options={{ headerShown: false }} />

        {/* Protected routes */}
        <Stack.Screen
          name="Dashboard"
          options={{ headerShown: false }}
          redirect={false}
        />
        <Stack.Screen
          name="History"
          options={{ headerShown: false }}
          redirect={false}
        />
      </Stack>
    </AuthProvider>
  );
}


// import { Stack } from "expo-router";
// import { AuthProvider } from "../context/AuthContext";
// import "./globals.css";

// export default function RootLayout() {
//    return (
//     <AuthProvider>
//     <Stack
//       screenOptions={{
//         headerStyle: { backgroundColor: "#1E3A8A" }, // blue
//         headerTintColor: "#fff",
//         headerTitleStyle: { fontWeight: "bold" },
//       }}
//     />
//     </AuthProvider>
//   );
// }
