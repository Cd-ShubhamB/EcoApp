import axios from "axios";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { Stack } from "expo-router";
import * as XLSX from "xlsx";
import NavBar from "../components/NavBar";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";  // ✅ use expo-file-system
import { readAsStringAsync } from "expo-file-system/legacy";



export default function ExcelOrder() {
  const [excelFile, setExcelFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
   const scheme = useColorScheme();

 const pickExcelFile = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    copyToCacheDirectory: true,
  });

  if (result.canceled) return;

  const file = result.assets[0];
  setExcelFile(file);

  try {
    // ✅ Read file as base64 with expo-file-system
    const fileData = await readAsStringAsync(file.uri, { encoding: "base64" });


    const workbook = XLSX.read(fileData, { type: "base64" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);
    setPreviewData(jsonData);
  } catch (err) {
    console.error("Excel preview error:", err);
    Alert.alert("Error", "Failed to preview Excel file");
  }
};

  const handleExcelUpload = async () => {
    if (!excelFile) return Alert.alert("No file", "Please select an Excel file");
    if (!userEmail) return Alert.alert("Missing Email", "Please enter your email");

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("file", {
      uri: excelFile.uri,
      name: excelFile.name,
      type: excelFile.mimeType || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    } as any);
    formData.append("email", userEmail);

    try {
      await axios.post("https://shreenathmobis.in/api1/order/appMail", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Alert.alert("Success ✅", "Excel order placed successfully");
      setExcelFile(null);
      setUserEmail("");
      setPreviewData([]);
    } catch (err) {
      console.error("Excel upload error:", err);
      Alert.alert("Error ❌", "Failed to upload Excel order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <SafeAreaView className={`flex-1 ${scheme === "dark" ? "bg-black" : "bg-gray-100"}`}>
     {/* Hide the default header */}
      <Stack.Screen options={{ headerShown: false }} />
      {/* Your screen content */}
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="p-6">
        {/* File Picker */}
        <TouchableOpacity
          onPress={pickExcelFile}
          className="border-2 border-dashed border-blue-300 p-5 rounded-xl mb-4 items-center justify-center bg-white shadow"
        >
          <Text className="text-gray-700 text-center">
            {excelFile ? `📄 ${excelFile.name}` : "📂 Select Excel File"}
          </Text>
        </TouchableOpacity>

        {/* Email Input */}
        <TextInput
          placeholder="Enter your email"
          value={userEmail}
          onChangeText={setUserEmail}
          keyboardType="email-address"
          className="border rounded-xl p-4 mb-4 bg-white shadow text-base"
        />

        {/* Excel Preview */}
{previewData.length > 0 && (
  <View className="mb-4 bg-white shadow rounded-xl overflow-hidden">
    <Text className="text-lg font-semibold px-4 py-3 border-b border-gray-200 bg-gray-50">
      Preview
    </Text>

    {/* Table Header */}
    <ScrollView horizontal>
      <View>
        {/* Headers */}
        <View className="flex-row bg-blue-50 border-b border-gray-200">
          {Object.keys(previewData[0]).map((key, i) => (
            <Text
              key={i}
              className="px-3 py-2 font-semibold text-gray-800 text-sm min-w-[120px] border-r border-gray-200"
            >
              {key}
            </Text>
          ))}
        </View>

        {/* Rows */}
        {previewData.slice(0, 10).map((row, idx) => (
          <View
            key={idx}
            className={`flex-row ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
          >
            {Object.values(row).map((val, i) => (
              <Text
                key={i}
                className="px-3 py-2 text-gray-700 text-sm min-w-[120px] border-r border-gray-100"
              >
                {val !== null && val !== undefined ? String(val) : ""}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>

    {/* Footer Note */}
    {previewData.length > 10 && (
      <Text className="text-gray-500 text-sm px-4 py-2">
        Showing first 10 rows...
      </Text>
    )}
  </View>
)}


        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleExcelUpload}
          disabled={isSubmitting}
          className={`p-4 rounded-xl shadow ${isSubmitting ? "bg-gray-400" : "bg-green-600"}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Upload & Place Order
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <NavBar />
    </View>
    </SafeAreaView>
  );
}
