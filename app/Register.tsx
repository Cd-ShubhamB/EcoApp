import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Register() {
  const navigation = useNavigation<any>();
   const router = useRouter();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateFields = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name) newErrors.name = "Name is required";
    if (!company) newErrors.company = "Company Name is required";
    if (!address) newErrors.address = "Address is required";
    if (!email) newErrors.email = "Email is required";
    if (!phone) newErrors.phone = "Phone number is required";
    if (!username) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleRegister = async () => {
    const validationErrors = validateFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await axios.post("https://shreenathmobis.in/api1/auth/register", {
        name,
        address,
        company,
        email,
        phone,
        username,
        password,
      });

      Alert.alert("Success", "Registered successfully! Now Login!");
      navigation.navigate("Login");
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error);
      Alert.alert("Error", "Registration failed. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <Image
          source={require("../assets/logo1.png")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
          resizeMode="contain"
        />

        {/* Form Container */}
        <View
          style={{
            width: "100%",
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 16,
              color: "#1f2937",
            }}
          >
            Register
          </Text>

          {/* Input Fields */}
          {[
            { placeholder: "Name", value: name, setValue: setName, key: "name" },
            {
              placeholder: "Company Name",
              value: company,
              setValue: setCompany,
              key: "company",
            },
            {
              placeholder: "Address",
              value: address,
              setValue: setAddress,
              key: "address",
              multiline: true,
            },
            {
              placeholder: "Email",
              value: email,
              setValue: setEmail,
              key: "email",
              keyboardType: "email-address",
            },
            {
              placeholder: "Phone",
              value: phone,
              setValue: setPhone,
              key: "phone",
              keyboardType: "phone-pad",
            },
            {
              placeholder: "Username",
              value: username,
              setValue: setUsername,
              key: "username",
            },
            {
              placeholder: "Password",
              value: password,
              setValue: setPassword,
              key: "password",
              secureTextEntry: true,
            },
          ].map((field) => (
            <View key={field.key} style={{ marginBottom: 12 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: errors[field.key]
                    ? "#dc2626"
                    : "rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  backgroundColor: "#f9fafb",
                }}
                placeholder={field.placeholder}
                value={field.value}
                onChangeText={field.setValue}
                secureTextEntry={field.secureTextEntry}
                keyboardType={field.keyboardType as any}
                multiline={field.multiline}
              />
              {errors[field.key] && (
                <Text style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>
                  {errors[field.key]}
                </Text>
              )}
            </View>
          ))}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleRegister}
            style={{
              backgroundColor: "#7c3aed",
              paddingVertical: 14,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Register
            </Text>
          </TouchableOpacity>

         {/* Already have account */}
<Text className="mt-4 text-center text-sm">
  Already have an account?{" "}
  <Text
    className="text-blue-600 underline"
    onPress={() => router.push("/")}
  >
    Login
  </Text>
</Text>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
