import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Lock, Eye, EyeOff, LogIn } from "lucide-react-native";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") router.replace("/History");
      else router.replace("/Dashboard");
    }
  }, [loading, user]);

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "https://shreenathmobis.in/api1/auth/login",
        { username, password }
      );

      if (res.data.token && res.data.user) {
        await login(res.data.user, res.data.token);
        if (res.data.user.role === "admin") router.push("./History");
        else router.push("./Dashboard");
      }
    } catch (err: any) {
      if (err.response?.data?.error === "Invalid Credentials") {
        setPasswordError("Invalid username or password");
      } else {
        setPasswordError("Something went wrong. Please try again.");
      }
    }
  };

  const handleSubmit = () => {
    setUsernameError("");
    setPasswordError("");

    if (!username) return setUsernameError("Username is required");
    if (!password) return setPasswordError("Password is required");

    handleLogin();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 px-6 justify-center">
      {/* Logo */}
      <View className="items-center mb-6">
        <Image
          source={require("../assets/logo1.png")}
          className="w-56 h-auto"
          resizeMode="contain"
        />
      </View>

      {/* Card */}
      <View className="w-full bg-white p-6 rounded-2xl shadow-lg">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
          Welcome !!
        </Text>

        {/* Username Input */}
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-3 bg-gray-50">
          <User size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 py-3"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        {usernameError ? (
          <Text className="text-red-600 text-sm mb-2">{usernameError}</Text>
        ) : null}

        {/* Password Input */}
        <View className="flex-row items-center border border-gray-300 rounded-lg px-3 mb-3 bg-gray-50">
          <Lock size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 py-3"
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </Pressable>
        </View>
        {passwordError ? (
          <Text className="text-red-600 text-sm mb-2">{passwordError}</Text>
        ) : null}

        {/* Login Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center bg-blue-600 py-3 rounded-lg mt-4 shadow-md"
          onPress={handleSubmit}
        >
          <LogIn size={20} color="white" />
          <Text className="text-white text-base font-semibold ml-2">Login</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Text
            className="text-blue-600 font-semibold underline"
            onPress={() => router.push("./Register")}
          >
            Register
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}
