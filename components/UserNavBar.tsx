import { usePathname, useRouter } from "expo-router";
import { History, User, LogOut } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";

type NavRoute = "/History" | "/User" | "/";

export default function UserNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const navItems: { route: NavRoute; icon: React.ElementType; label: string }[] = [
    { route: "/History", icon: History, label: "History" },
    { route: "/User", icon: User, label: "User" },
    { route: "/", icon: LogOut, label: "Logout" },
  ];

  const confirmLogout = async () => {
    await logout();
    setModalVisible(false);
    router.replace("/"); // Navigate back to index.tsx after logout
  };

  return (
    <>
      <View className="flex-row justify-around items-center bg-white/80 border-t border-gray-200 py-3 shadow-lg rounded-t-2xl backdrop-blur-md">
        {navItems.map(({ route, icon: Icon, label }, index) => {
          const isActive = pathname === route;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (route === "/") {
                  setModalVisible(true); // Open modal on logout
                } else {
                  router.push(route);
                }
              }}
              className="items-center"
            >
              <Icon
                size={24}
                strokeWidth={2.2}
                color={isActive ? "#2563EB" : "#6B7280"}
              />
              <Text
                className={`text-[10px] mt-1 ${
                  isActive ? "text-blue-600 font-semibold" : "text-gray-500"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modern Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white rounded-xl p-6 w-5/6 shadow-lg">
            <Text className="text-lg font-semibold text-center mb-4">
              Confirm Logout
            </Text>
            <Text className="text-center text-gray-600 mb-6">
              Are you sure you want to logout?
            </Text>

            <View className="flex-row justify-around">
              <Pressable
                onPress={() => setModalVisible(false)}
                className="bg-gray-300 px-6 py-2 rounded-lg"
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={confirmLogout}
                className="bg-red-600 px-6 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
