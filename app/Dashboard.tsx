

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { ShoppingCart as CartIcon, Package, PackageX, Search } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NavBar from "../components/NavBar";
import { sendNotification } from "../notifications";

/* ---------------------------
  Types
----------------------------*/
type Product = {
  _id: string;
  ID?: string;
  HSN_CODE?: string | number;
  PART_NAME: string;
  PART_NO: string;
  MODEL_CODE?: string;
  MRP: number;
};

type CartResponseItem = {
  _id: string;
  TOTAL?: number;
  QUANTITY?: number;
};

/* ---------------------------
  Config & Helpers
----------------------------*/
const PRODUCTS_API = "https://shreenathmobis.in/api1/products";
const CART_ITEMS_API = "https://shreenathmobis.in/api1/cart/items";
const CART_ADD_API = "https://shreenathmobis.in/api1/cart/add";

/* snackbar */
function useSnackbar() {
  const translate = useRef(new Animated.Value(80)).current;
  const [msg, setMsg] = useState<string | null>(null);

  const show = (text: string, duration = 2200) => {
    setMsg(text);
    Animated.timing(translate, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(translate, {
          toValue: 80,
          duration: 220,
          useNativeDriver: true,
        }).start(() => setMsg(null));
      }, duration);
    });
  };

  const Snackbar = () =>
    msg ? (
      <Animated.View
        style={{
          transform: [{ translateY: translate }],
        }}
        className="absolute left-4 right-4 bottom-28 rounded-lg bg-black/90 p-3"
      >
        <Text className="text-white text-center">{msg}</Text>
      </Animated.View>
    ) : null;

  return { show, Snackbar };
}

/* ---------------------------
  Component
----------------------------*/
export default function Dashboard() {
  const scheme = useColorScheme();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [filters, setFilters] = useState({
    partNo: "",
    partName: "",
    hsn: "",
  });

  const FILTERS_KEY = "@app:filters_v2";
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [cartCount, setCartCount] = useState(0);
  const { show, Snackbar } = useSnackbar();

  /* ---------------------------
     Filtering
  ----------------------------*/
  const filtered = useMemo(() => {
    const fpartNo = filters.partNo.trim().toLowerCase();
    const fname = filters.partName.trim().toLowerCase();
    const fhsn = filters.hsn.trim().toLowerCase();

    return products.filter((p) => {
      const name = (p.PART_NAME || "").toString().toLowerCase();
      const partno = (p.PART_NO || "").toString().toLowerCase();
      const hsn = (p.HSN_CODE || "").toString().toLowerCase();

      const matchNo = !fpartNo || partno.includes(fpartNo);
      const matchName = !fname || name.includes(fname);
      const matchHSN = !fhsn || hsn.includes(fhsn);

      return matchNo && matchName && matchHSN;
    });
  }, [products, filters]);

  const visibleList = useMemo(() => filtered.slice(0, pageSize), [filtered, pageSize]);

  /* ---------------------------
     Data load
  ----------------------------*/
  useEffect(() => {
    (async () => {
      try {
        const s = await AsyncStorage.getItem(FILTERS_KEY);
        if (s) setFilters(JSON.parse(s));
      } catch {}
    })();
  }, []);

  


  useEffect(() => {
    const t = setTimeout(() => {
      AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(filters)).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [filters]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(PRODUCTS_API);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        Alert.alert("Error", "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      if (!token || !storedUser) return setCartCount(0);

      const user = JSON.parse(storedUser);
      const res = await axios.get(`${CART_ITEMS_API}?client=${encodeURIComponent(user.name)}`);
      setCartCount(Array.isArray(res.data) ? res.data.length : 0);
    } catch {
      setCartCount(0);
    }
  };

  /* ---------------------------
    Actions
  ----------------------------*/
const handleAddToCart = async (product: Product) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const storedUser = await AsyncStorage.getItem("user");
    if (!token || !storedUser) {
      Alert.alert("Login required", "Please login to add items");
      return;
    }

    const user = JSON.parse(storedUser);
    const qty = parseInt(quantities[product._id]) || 0;
    if (qty <= 0) return show("Enter valid qty");

    const payload = {
      ID: product.ID,
      CLIENT_NAME: user.name,
      HSN_CODE: product.HSN_CODE,
      PART_NAME: product.PART_NAME,
      PART_NUM: product.PART_NO,
      MRP: product.MRP,
      QUANTITY: qty,
    };

    await axios.post(CART_ADD_API, payload);
    show("Added ✅");
    setQuantities((s) => ({ ...s, [product._id]: "" }));
    fetchCartCount();

    // ✅ Stylish local notification
    sendNotification(
      "🛒 Item Added!",
      `${product.PART_NAME} (${qty} pcs) added to your cart`
    );
  } catch {
    show("Failed ❌");
  }
};



  const loadMore = () => {
    if (isLoadingMore) return;
    if (visibleList.length >= filtered.length) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPageSize((s) => s + 20);
      setIsLoadingMore(false);
    }, 500);
  };

  /* ---------------------------
    Render
  ----------------------------*/
  return (
    <SafeAreaView className={`flex-1 ${scheme === "dark" ? "bg-black" : "bg-gray-100"}`}>
      {/* Filters header */}
<View className="px-4 pt-3 pb-3 bg-white shadow-md z-10">
  <View className="flex-row space-x-3">
    {/* Part No Filter */}
    <View
      className={`flex-row items-center flex-1 px-3 py-2 rounded-full border ${
        filters.partNo ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-100"
      }`}
    >
      <Search size={18} color={filters.partNo ? "#2563EB" : "#6B7280"} />
      <TextInput
        placeholder="Part No"
        value={filters.partNo}
        onChangeText={(t) => setFilters((s) => ({ ...s, partNo: t }))}
        className="ml-2 flex-1 py-1 text-sm"
      />
    </View>

    {/* Part Name Filter */}
    <View
      className={`flex-row items-center flex-1 px-3 py-2 rounded-full border ${
        filters.partName ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-100"
      }`}
    >
      <Package size={18} color={filters.partName ? "#2563EB" : "#6B7280"} />
      <TextInput
        placeholder="Part Name"
        value={filters.partName}
        onChangeText={(t) => setFilters((s) => ({ ...s, partName: t }))}
        className="ml-2 flex-1 py-1 text-sm"
      />
    </View>

    {/* HSN Filter */}
    <View
      className={`flex-row items-center w-24 px-3 py-2 rounded-full border ${
        filters.hsn ? "border-blue-600 bg-blue-50" : "border-gray-300 bg-gray-100"
      }`}
    >
      <PackageX size={18} color={filters.hsn ? "#2563EB" : "#6B7280"} />
      <TextInput
        placeholder="HSN"
        value={filters.hsn}
        onChangeText={(t) => setFilters((s) => ({ ...s, hsn: t }))}
        className="ml-2 flex-1 py-1 text-sm text-center"
      />
    </View>
  </View>
</View>


      {/* List */}
      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : visibleList.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <PackageX size={96} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2">No products</Text>
          </View>
        ) : (
          <FlatList
            data={visibleList}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <View className="bg-white rounded-2xl p-4 mb-4 shadow">
                <View className="flex-row">
                  <View className="w-[72px] h-[72px] items-center justify-center bg-gray-100 rounded-lg">
                    <Package size={40} color="#9CA3AF" strokeWidth={1.8} />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-lg">{item.PART_NAME}</Text>
                    <Text className="text-sm text-gray-500">Part No: {item.PART_NO}</Text>
                    <Text className="text-sm text-gray-500">HSN: {item.HSN_CODE}</Text>
                    <Text className="text-sm text-gray-500">Model: {item.MODEL_CODE || "-"}</Text>
                    <View className="flex-row items-center justify-between mt-3">
                      <Text className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 font-bold">
                        ₹{item.MRP}
                      </Text>
                      <View className="flex-row items-center">
                        <TextInput
                          keyboardType="numeric"
                          placeholder="Qty"
                          value={quantities[item._id] || ""}
                          onChangeText={(t) => setQuantities((s) => ({ ...s, [item._id]: t }))}
                          className="border rounded-lg px-3 py-2 w-20 text-center mr-3"
                        />
                        <TouchableOpacity
                          onPress={() => handleAddToCart(item)}
                          className="bg-indigo-600 px-4 py-2 rounded-lg"
                        >
                          <Text className="text-white font-semibold">Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Floating cart */}
      <TouchableOpacity
        onPress={() => router.push("/Checkout")}
        className="absolute bottom-24 right-6 bg-indigo-600 p-4 rounded-full shadow-lg"
      >
        <CartIcon size={20} color="#fff" />
        {cartCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full px-2">
            <Text className="text-xs text-white font-bold">{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Snackbar />
      <NavBar />
    </SafeAreaView>
  );
}
