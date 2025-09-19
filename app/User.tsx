import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import UserNavBar from "../components/UserNavBar";
import { Stack } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 6;

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedSection(expandedSection === section ? null : section);
  };

  const [addForm, setAddForm] = useState({
    name: "",
    company: "",
    address: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "user",
  });

  type UpdateForm = {
    username: string;
    name: string;
    company: string;
    address: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  };

  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    username: "",
    name: "",
    company: "",
    address: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const [deleteUsername, setDeleteUsername] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://shreenathmobis.in/api1/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddChange = (key: string, value: string) =>
    setAddForm({ ...addForm, [key]: value });

  const handleUpdateChange = (key: string, value: string) =>
    setUpdateForm({ ...updateForm, [key]: value });

  const handleAddUser = async () => {
    await axios.post("https://shreenathmobis.in/api1/users", addForm);
    Alert.alert("Success", "User added successfully ✅");
    setAddForm({
      name: "",
      company: "",
      address: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      role: "user",
    });
    fetchUsers();
  };

  const handleUpdateUser = async () => {
    const { username, ...fields } = updateForm;
    const filteredUpdate: Record<string, string> = {};
    Object.entries(fields).forEach(([key, value]) => {
      if (value.trim() !== "") {
        filteredUpdate[key] = value;
      }
    });

    try {
      await axios.put(
        `https://shreenathmobis.in/api1/users/${username}`,
        filteredUpdate
      );
      Alert.alert("Success", "User updated successfully ✏️");
      setUpdateForm({
        username: "",
        name: "",
        company: "",
        address: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
      });
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", "Failed to update user ❌");
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(
        `https://shreenathmobis.in/api1/users/${deleteUsername}`
      );
      Alert.alert("Success", "User deleted successfully 🗑️");
      setDeleteUsername("");
      fetchUsers();
    } catch (err) {
      Alert.alert("Error", "Failed to delete user ❌");
      console.error(err);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      {/* Your screen content */}
      <FlatList
        ListHeaderComponent={
          <View className="p-4">
            {/* Header */}
            <View className="items-center mb-6">
              <Image
                source={{ uri: "/logo1.png" }}
                className="h-20 w-20 rounded-full"
              />
              <Text className="text-2xl font-extrabold text-gray-800 mt-2">
                User Management
              </Text>
            </View>

            {/* Collapsible Add User */}
            <TouchableOpacity
              onPress={() => toggleSection("add")}
              className="flex-row justify-between items-center bg-white p-4 rounded-xl shadow mb-2"
            >
              <Text className="text-lg font-semibold">
                <Ionicons name="person-add" size={18} color="green" /> Add User
              </Text>
              <Ionicons
                name={expandedSection === "add" ? "chevron-up" : "chevron-down"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            {expandedSection === "add" && (
              <View className="bg-white p-4 rounded-xl shadow mb-4">
                {Object.entries(addForm).map(
                  ([key, value]) =>
                    key !== "role" && (
                      <TextInput
                        key={key}
                        placeholder={`Enter ${key}`}
                        secureTextEntry={key === "password"}
                        value={value}
                        onChangeText={(text) => handleAddChange(key, text)}
                        className="border border-gray-300 p-2 rounded-lg mb-2"
                      />
                    )
                )}
                <TouchableOpacity
                  onPress={handleAddUser}
                  className="bg-green-600 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    ➕ Add User
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Collapsible Update User */}
            <TouchableOpacity
              onPress={() => toggleSection("update")}
              className="flex-row justify-between items-center bg-white p-4 rounded-xl shadow mb-2"
            >
              <Text className="text-lg font-semibold">
                <MaterialIcons name="update" size={18} color="blue" /> Update
                User
              </Text>
              <Ionicons
                name={
                  expandedSection === "update" ? "chevron-up" : "chevron-down"
                }
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            {expandedSection === "update" && (
              <View className="bg-white p-4 rounded-xl shadow mb-4">
                <TextInput
                  placeholder="Username (required)"
                  value={updateForm.username}
                  onChangeText={(text) => handleUpdateChange("username", text)}
                  className="border border-gray-300 p-2 rounded-lg mb-2"
                />
                <TextInput
                  placeholder="Password (optional)"
                  secureTextEntry
                  value={updateForm.password}
                  onChangeText={(text) => handleUpdateChange("password", text)}
                  className="border border-gray-300 p-2 rounded-lg mb-2"
                />
                <TouchableOpacity
                  onPress={handleUpdateUser}
                  className="bg-blue-600 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    ✏️ Update User
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Collapsible Delete User */}
            <TouchableOpacity
              onPress={() => toggleSection("delete")}
              className="flex-row justify-between items-center bg-white p-4 rounded-xl shadow mb-2"
            >
              <Text className="text-lg font-semibold">
                <Ionicons name="trash" size={18} color="red" /> Delete User
              </Text>
              <Ionicons
                name={
                  expandedSection === "delete" ? "chevron-up" : "chevron-down"
                }
                size={20}
                color="gray"
              />
            </TouchableOpacity>
            {expandedSection === "delete" && (
              <View className="bg-white p-4 rounded-xl shadow mb-4">
                <TextInput
                  placeholder="Enter Username"
                  value={deleteUsername}
                  onChangeText={setDeleteUsername}
                  className="border border-gray-300 p-2 rounded-lg mb-2"
                />
                <TouchableOpacity
                  onPress={handleDeleteUser}
                  className="bg-red-600 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    🗑️ Delete User
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Search */}
            <TextInput
              placeholder="🔍 Search by name or username"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="border border-gray-300 p-2 rounded-lg mb-4 bg-white"
            />

            {/* Title */}
            <Text className="text-lg font-semibold mb-2">All Users</Text>
          </View>
        }
        data={paginatedUsers}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="bg-white mx-4 mb-3 p-4 rounded-xl shadow flex-row justify-between items-center">
            <View>
              <Text className="font-semibold text-lg">{item.name}</Text>
              <Text className="text-gray-600">@{item.username}</Text>
              <Text className="text-gray-500">{item.email}</Text>
              <Text className="text-gray-500">{item.phone}</Text>
            </View>
            <Ionicons name="person-circle" size={40} color="#4F46E5" />
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : (
            <View className="flex-row justify-center items-center my-4">
              <TouchableOpacity
                disabled={page === 1}
                onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
                className={`px-4 py-2 mx-2 rounded-lg ${
                  page === 1 ? "bg-gray-300" : "bg-blue-600"
                }`}
              >
                <Text className="text-white font-semibold">Prev</Text>
              </TouchableOpacity>

              <Text className="text-gray-700">
                Page {page} of {totalPages}
              </Text>

              <TouchableOpacity
                disabled={page === totalPages}
                onPress={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                className={`px-4 py-2 mx-2 rounded-lg ${
                  page === totalPages ? "bg-gray-300" : "bg-blue-600"
                }`}
              >
                <Text className="text-white font-semibold">Next</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
      <UserNavBar />
    </SafeAreaView>
  );
};

export default Users;
