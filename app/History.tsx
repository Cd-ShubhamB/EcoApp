import axios from "axios";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
  Upload,
  User
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserNavBar from "../components/UserNavBar";

export default function History() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [filters, setFilters] = useState({ clientName: "", date: "" });
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          "https://shreenathmobis.in/api1/order/history"
        );
        setOrders(res.data);
        setFilteredOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Failed to fetch orders.");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter whenever filters change
  useEffect(() => {
    const filtered = orders.filter((order) => {
      const isExcelOrder = order.isExcelOrder;

      const matchClient = filters.clientName
        ? isExcelOrder
          ? true
          : (order.cart || []).some((item: any) =>
              (item.CLIENT_NAME || "")
                .toLowerCase()
                .includes(filters.clientName.toLowerCase())
            )
        : true;

      const matchDate = filters.date
        ? order.createdAt &&
          !isNaN(new Date(order.createdAt).getTime()) &&
          new Date(order.createdAt).toISOString().split("T")[0] === filters.date
        : true;

      return matchClient && matchDate;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [filters, orders]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 p-4">
      {/* Header */}
      <View className="items-center mb-6">
        <Text className="text-3xl font-extrabold text-gray-900">
          📦 Order History
        </Text>
        <View className="h-1 w-16 bg-blue-500 rounded-full mt-2" />
      </View>

      {/* Filters - Collapsible */}
      <View className="bg-white rounded-xl shadow-sm mb-4">
        <TouchableOpacity
          onPress={() => setFiltersVisible(!filtersVisible)}
          className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200"
        >
          <View className="flex-row items-center">
            <Filter size={18} color="#2563eb" />
            <Text className="ml-2 font-semibold text-gray-800">Filters</Text>
          </View>
          {filtersVisible ? (
            <ChevronUp size={20} color="#555" />
          ) : (
            <ChevronDown size={20} color="#555" />
          )}
        </TouchableOpacity>

        {filtersVisible && (
          <View className="p-4 space-y-3">
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
              <User size={18} color="#555" />
              <TextInput
                placeholder="Client Name"
                value={filters.clientName}
                onChangeText={(val) => setFilters({ ...filters, clientName: val })}
                className="flex-1 ml-2 py-2"
              />
            </View>

            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 bg-gray-50">
              <Calendar size={18} color="#555" />
              <TextInput
                placeholder="YYYY-MM-DD"
                value={filters.date}
                onChangeText={(val) => setFilters({ ...filters, date: val })}
                className="flex-1 ml-2 py-2"
              />
            </View>
          </View>
        )}
      </View>

      {/* Floating User Management Shortcut */}
      <TouchableOpacity
        onPress={() => router.push("./User")}
        className="absolute top-5 right-5 bg-blue-600 p-3 rounded-full shadow-md"
      >
        <FileText size={20} color="white" />
      </TouchableOpacity>

      <Text className="text-gray-600 mb-3">
        Showing {currentOrders.length} of {filteredOrders.length}
      </Text>

      {/* Orders Section */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : error ? (
        <Text className="text-red-600">{error}</Text>
      ) : filteredOrders.length === 0 ? (
        <Text className="text-gray-600">No orders found.</Text>
      ) : (
        <FlatList
          data={currentOrders}
          keyExtractor={(item, index) => `${item.filename}-${index}`}
          renderItem={({ item }) => (
            <View className="mb-5 bg-white rounded-xl shadow-md p-4">
              {/* Order Header */}
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-gray-900">
                  {item.username}
                </Text>
                <Text className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>

              <Text className="text-sm text-gray-600 mb-2">
                ID: {item.filename}
              </Text>

              {/* Excel Badge */}
              {item.isExcelOrder ? (
                <View className="mt-1 px-3 py-1 rounded-full bg-green-100 self-start flex-row items-center">
                  <Upload size={16} color="#166534" />
                  <Text className="ml-1 text-green-700 font-semibold">
                    Excel Order
                  </Text>
                </View>
              ) : (
                <>
                  {/* Cart Table */}
                  <ScrollView horizontal className="mt-2">
                    <View>
                      <View className="flex-row bg-gray-100 rounded-md p-2">
                        <Text className="w-24 font-bold text-gray-700">
                          Client
                        </Text>
                        <Text className="w-20 font-bold text-gray-700">HSN</Text>
                        <Text className="w-36 font-bold text-gray-700">
                          Part Name
                        </Text>
                        <Text className="w-28 font-bold text-gray-700">
                          Part No
                        </Text>
                        <Text className="w-20 font-bold text-gray-700">MRP</Text>
                        <Text className="w-20 font-bold text-gray-700">Qty</Text>
                        <Text className="w-28 font-bold text-gray-700">
                          Total
                        </Text>
                      </View>
                      {item.cart.map((c: any, idx: number) => (
                        <View
                          key={idx}
                          className="flex-row p-2 border-b border-gray-200"
                        >
                          <Text className="w-24 text-gray-800">
                            {c.CLIENT_NAME}
                          </Text>
                          <Text className="w-20">{c.HSN_CODE}</Text>
                          <Text className="w-36">{c.PART_NAME}</Text>
                          <Text className="w-28">{c.PART_NUM}</Text>
                          <Text className="w-20">{c.MRP}</Text>
                          <Text className="w-20">{c.QUANTITY}</Text>
                          <Text className="w-28 font-medium">{c.TOTAL}</Text>
                        </View>
                      ))}
                    </View>
                  </ScrollView>

                  {/* Grand Total */}
                  <Text className="mt-3 text-right font-extrabold text-lg text-blue-600">
                    Grand Total: ₹{item.grandTotal}
                  </Text>
                </>
              )}
            </View>
          )}
        />
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <View className="flex-row justify-center items-center mt-6 space-x-3">
          <TouchableOpacity
            onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`flex-row items-center px-4 py-2 rounded-full shadow-md ${
              currentPage === 1 ? "bg-gray-300" : "bg-blue-500"
            }`}
          >
            <ArrowLeft size={16} color="white" />
            <Text className="text-white font-semibold ml-1">Prev</Text>
          </TouchableOpacity>

          <Text className="text-gray-700 font-medium">
            {currentPage}/{Math.ceil(filteredOrders.length / ordersPerPage)}
          </Text>

          <TouchableOpacity
            onPress={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(filteredOrders.length / ordersPerPage)
                  ? prev + 1
                  : prev
              )
            }
            disabled={
              currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
            }
            className={`flex-row items-center px-4 py-2 rounded-full shadow-md ${
              currentPage === Math.ceil(filteredOrders.length / ordersPerPage)
                ? "bg-gray-300"
                : "bg-blue-500"
            }`}
          >
            <Text className="text-white font-semibold mr-1">Next</Text>
            <ArrowRight size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}
      <UserNavBar />
    </SafeAreaView>
  );
}
