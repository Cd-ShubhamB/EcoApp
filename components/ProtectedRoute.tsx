import React from "react";
import { Redirect, Slot } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // While loading stored token
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  // If no user -> redirect to login
  if (!user) {
    return <Redirect href="/" />;
  }

  // Otherwise show children
  return <Slot />;
}
