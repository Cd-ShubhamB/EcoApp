import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";

export default function Order() {
  const router = useRouter();
  const { username: paramUsername, cartItems: paramCart } = useLocalSearchParams();
   const scheme = useColorScheme();

  const [username, setUsername] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate grand total
  const grandTotal = cartItems.reduce((acc, item) => acc + (item.TOTAL || 0), 0);

  // Load order data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (paramUsername && paramCart) {
          const parsedCart = JSON.parse(paramCart as string);
          setUsername(paramUsername as string);
          setCartItems(parsedCart);
          await AsyncStorage.setItem(
            "orderData",
            JSON.stringify({ username: paramUsername, cartItems: parsedCart })
          );
        } else {
          const savedData = await AsyncStorage.getItem("orderData");
          if (savedData) {
            const parsed = JSON.parse(savedData);
            setUsername(parsed.username);
            setCartItems(parsed.cartItems);
          } else {
            Alert.alert("Session expired", "Redirecting to checkout...");
            router.replace("./Checkout");
          }
        }
      } catch (err) {
        console.error("Error loading order data:", err);
        Alert.alert("Error", "Failed to load order data");
      }
    };
    loadData();
  }, [paramUsername, paramCart]);

const handleSubmit = async () => {
  if (!email) return Alert.alert("Validation", "Please enter your email.");

  setIsSubmitting(true);

  try {
    await axios.post("https://shreenathmobis.in/api1/order/appMail", {
      username,
      email,
      cartData: cartItems, // <-- use cartItems here
    });

    Alert.alert("Success", "Order placed and email sent!");
    await AsyncStorage.removeItem("orderData");
    setCartItems([]);
    router.replace("./Dashboard");
  } catch (error: any) {
    console.error(error);
    Alert.alert("Error", "Failed to send order. Try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
     <SafeAreaView className={`flex-1 ${scheme === "dark" ? "bg-black" : "bg-gray-100"}`}>
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-indigo-600 px-4 py-3 shadow-md">
        <Image
          source={require("../assets/logo1.png")}
          className="h-16 w-16"
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-white">Place Order</Text>
        <TouchableOpacity
          onPress={() => router.push("./Checkout")}
          className="bg-white/20 px-3 py-2 rounded"
        >
          <Text className="text-white text-sm">← Checkout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        className="p-4 flex-grow"
      >
        {/* Username */}
        <View className="mb-4">
          <Text className="text-base font-medium mb-1">Username</Text>
          <TextInput
            value={username}
            editable={false}
            className="border p-3 rounded bg-gray-100 text-base"
          />
        </View>

        {/* Email */}
        <View className="mb-6">
          <Text className="text-base font-medium mb-1">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Enter your email"
            className="border p-3 rounded text-base"
          />
        </View>

        {/* Cart Summary */}
        <View className="mb-6 bg-white shadow rounded p-4">
          <Text className="text-lg font-semibold mb-2">Cart Summary</Text>
          {cartItems.map((item, idx) => (
            <View
              key={idx}
              className="flex-row justify-between border-b border-gray-200 py-2"
            >
              <Text className="text-gray-700">{item.PART_NAME} x {item.QUANTITY}</Text>
              <Text className="text-gray-800 font-semibold">₹{item.TOTAL}</Text>
            </View>
          ))}
          <View className="flex-row justify-between mt-3 pt-2 border-t border-gray-300">
            <Text className="text-lg font-bold">Grand Total:</Text>
            <Text className="text-lg font-bold text-green-600">₹{grandTotal}</Text>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-xl ${
            isSubmitting ? "bg-gray-400" : "bg-green-600"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-center text-base">
              Submit & Send Mail
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}
