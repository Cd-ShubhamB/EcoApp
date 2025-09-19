import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack } from "expo-router";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { Minus, Package, Plus, ShoppingCart, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Platform, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as XLSX from "xlsx";
import NavBar from "../components/NavBar";


type CartItem = {
  _id: string;
  ID?: string;
  CLIENT_NAME?: string;
  HSN_CODE?: string;
  PART_NAME: string;
  PART_NUM: string;
  MRP: number;
  QUANTITY: number;
  TOTAL: number;
  ORDER?: string;
};

declare module "expo-file-system" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
}


export default function Checkout() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [username, setUsername] = useState("");
  const itemsPerPage = 20;
  const router = useRouter();
   const scheme = useColorScheme();

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");

      if (token && storedUser) {
        const user = JSON.parse(storedUser);
        setUsername(user.name);

        try {
          const res = await axios.get(
            `https://shreenathmobis.in/api1/cart/items?client=${encodeURIComponent(
              user.name
            )}`
          );
          setCartItems(res.data);
        } catch (err) {
          console.error("API Error:", err);
          Alert.alert("Error", "Failed to fetch cart items. Please login again.");
        }
      } else {
        Alert.alert("Login Required", "Please login to view the cart.");
        await AsyncStorage.removeItem("token");
        router.push("/");
      }
    };
    fetchData();
  }, []);

  const updateQuantity = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    try {
      const updatedItem = { ...item, QUANTITY: newQty, TOTAL: item.MRP * newQty };
      await axios.put(`https://shreenathmobis.in/api1/cart/update/${item._id}`, {
        QUANTITY: newQty,
      });
      setCartItems((prev) =>
        prev.map((ci) => (ci._id === item._id ? updatedItem : ci))
      );
    } catch (err) {
      console.error("Error updating qty:", err);
      Alert.alert("Error", "Failed to update quantity.");
    }
  };

  const handlePlaceOrder = async () => {
    await AsyncStorage.setItem(
      "orderData",
      JSON.stringify({ username, cartItems })
    );
    router.push({
      pathname: "./Order",
      params: { username, cartItems: JSON.stringify(cartItems) },
    });
  };

const exportToExcel = async (cartItems: CartItem[]) => {
  try {
    const ws = XLSX.utils.json_to_sheet(cartItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cart");

    if (Platform.OS === "web") {
      const blob = new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], {
        type: "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cart.xlsx";
      a.click();
      URL.revokeObjectURL(url);
      Alert.alert("Excel Exported", "Downloaded in browser");
      return;
    }

    // Mobile (Android/iOS)
    const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    // ✅ use correct directories
const dir =
  (FileSystem.documentDirectory as string | null) ??
  (FileSystem.cacheDirectory as string | null) ??
  "";



    if (!dir) {
      Alert.alert("Error", "No directory available for saving files");
      return;
    }

    const fileUri = dir + "cart.xlsx";
    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: "base64", // ✅ fixed
    });

    Alert.alert("Excel Exported", `Saved to: ${fileUri}`);
  } catch (error) {
    console.error("Error exporting Excel:", error);
    Alert.alert("Error", "Failed to export Excel file.");
  }
};


  const handleRemoveItem = async (itemId: string) => {
    try {
      await axios.delete(`https://shreenathmobis.in/api1/cart/delete/${itemId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (err) {
      console.error("Error removing item:", err);
      Alert.alert("Error", "Failed to remove item from cart.");
    }
  };

  const totalPages = Math.ceil(cartItems.length / itemsPerPage);
  const grandTotal = cartItems.reduce((acc, item) => acc + (item.TOTAL || 0), 0);

  return (
     <SafeAreaView className={`flex-1 ${scheme === "dark" ? "bg-black" : "bg-gray-100"}`}>
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      {/* Your screen content */}
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-600 px-6 py-5 rounded-b-3xl shadow-md">
        <Text className="text-lg font-semibold text-white text-center">
          Welcome, {username}
        </Text>
        <Text className="text-2xl font-bold text-white text-center">Checkout</Text>
      </View>

      {/* Cart List */}
      {cartItems.length > 0 ? (
        <FlatList
          data={cartItems.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 160 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center border border-gray-200 rounded-xl p-4 m-3 bg-white shadow-md">
              {/* Icon */}
              <View className="w-16 h-16 items-center justify-center bg-gray-100 rounded-lg mr-3">
                <Package size={32} color="#6B7280" strokeWidth={2} />
              </View>

              {/* Details */}
              <View className="flex-1">
                <Text className="font-bold text-lg text-gray-800">{item.PART_NAME}</Text>
                <Text className="text-gray-600">Part No: {item.PART_NUM}</Text>
                <Text className="text-gray-600">MRP: ₹{item.MRP}</Text>
                <Text className="text-green-700 font-semibold mt-1">
                  Total: ₹{item.TOTAL}
                </Text>

                {/* Quantity Controls */}
                <View className="flex-row items-center mt-2">
                  <TouchableOpacity
                    className="bg-gray-200 rounded-full p-2"
                    onPress={() => updateQuantity(item, item.QUANTITY - 1)}
                  >
                    <Minus size={18} color="#374151" />
                  </TouchableOpacity>
                  <Text className="mx-3 font-semibold text-lg">{item.QUANTITY}</Text>
                  <TouchableOpacity
                    className="bg-gray-200 rounded-full p-2"
                    onPress={() => updateQuantity(item, item.QUANTITY + 1)}
                  >
                    <Plus size={18} color="#374151" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remove Btn */}
              <TouchableOpacity
                className="ml-2 bg-red-500 rounded-full p-2"
                onPress={() => handleRemoveItem(item._id)}
              >
                <Trash2 size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <ShoppingCart size={72} color="#9CA3AF" strokeWidth={1.5} />
          <Text className="text-lg font-semibold text-gray-700 mt-3">Your cart is empty</Text>
          <Text className="text-sm text-gray-500 mt-1">
            Start adding products to proceed.
          </Text>
        </View>
      )}

      {/* Footer */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-16 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          {/* Grand Total */}
          <Text className="text-center text-xl font-bold text-green-700 mb-3">
            Grand Total: ₹{grandTotal.toLocaleString()}
          </Text>

          {/* Actions */}
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className="flex-1 bg-green-600 p-4 rounded-xl shadow-md"
              onPress={() => exportToExcel(cartItems)}
            >
              <Text className="text-white text-center">Export</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 bg-indigo-700 p-4 rounded-xl shadow-md"
              onPress={handlePlaceOrder}
            >
              <Text className="text-white text-center font-bold text-lg">
                ✅ Place Order
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bottom Nav */}
      <NavBar />
    </View>
    </SafeAreaView>
  );
}
