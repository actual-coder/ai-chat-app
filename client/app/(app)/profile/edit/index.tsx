import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/providers/theme-provider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authClient, useSession } from "@/lib/auth";
import { Feather } from "@expo/vector-icons";
import { Controller, useForm } from "react-hook-form";
import type { ProfileFormData } from "@/lib/zod";
import { profileSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { changePhoto, updateProfile } from "@/api/users";
import { toast } from "sonner-native";
import { bucketUrl } from "@/constants/server";
import { fetch } from "expo/fetch";
import { File } from "expo-file-system";

export default function Edit() {
  const { colors } = useTheme();

  const params = useLocalSearchParams();

  const { data: sessionData } = useSession();

  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
    },
  });

  const user = sessionData?.user;
  const token = sessionData?.session.token;
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationKey: ["edit-profile"],
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (!data.success) return;
      const updatedUser = data.user;
      authClient.updateUser({ name: updatedUser.name });
      router.back();
    },
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  const { mutateAsync: mutateChangePhoto } = useMutation({
    mutationKey: ["change-photo"],
    mutationFn: changePhoto,
    onSuccess: (data) => {
      if (!data.success) return;
      authClient.updateUser({ image: data.key });
    },
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  const handleSave = handleSubmit((payload) => {
    mutate({ payload, token });
  });

  const changePhotoHandler = async () => {
    try {
      setIsUploading(true);
      if (!image) return toast.error("No Image selected");

      const file = new File(image);

      const ext = file.extension;
      const type = file.type;

      const { url: presignedUrl } = await mutateChangePhoto({
        token,
        ext,
        type,
      });

      const response = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Uploading failed");
      }

      toast.success("Updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email });
  }, [user]);

  useEffect(() => {
    if (params.imageUri) setImage(params.imageUri as string);
  }, [params.imageUri]);

  if (!user) return null;

  const Header = (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.headerButton}
        activeOpacity={0.7}
        onPress={() => router.replace("/profile")}
      >
        <Text
          style={[
            styles.cancelText,
            {
              color: colors.textDim,
            },
          ]}
        >
          Cancel
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.headerTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Edit Profile
      </Text>

      <TouchableOpacity
        style={styles.headerButton}
        activeOpacity={0.7}
        onPress={handleSave}
        disabled={isPending}
      >
        <Text
          style={[
            styles.saveText,
            {
              color: colors.primary,
            },
          ]}
        >
          {isPending ? "Saving" : "Save"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const Body = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image
            style={[styles.avatar, { borderColor: colors.surface }]}
            source={{
              uri: image || bucketUrl.public(user.image),
            }}
          />
          <TouchableOpacity
            style={[
              styles.cameraButton,
              {
                borderColor: colors.bg,
                backgroundColor: colors.primary,
              },
            ]}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/camera",
                params: { callbackUrl: "/profile/edit" },
              })
            }
          >
            <Feather name="camera" size={16} color={"black"} />
          </TouchableOpacity>
        </View>
        {image && (
          <TouchableOpacity
            style={[
              styles.changeButton,
              {
                backgroundColor: colors.border,
              },
            ]}
            onPress={changePhotoHandler}
            disabled={isUploading}
          >
            <Text style={[styles.changeButtonText, { color: colors.text }]}>
              {isUploading ? "Uploading" : "Change Photo"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form */}

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textDim }]}>Name</Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: errors.name ? "red" : colors.border,
              },
            ]}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textDim}
                  selectionColor={colors.primary}
                />
              )}
            />
          </View>

          {errors.name && (
            <Text style={{ color: "red", marginTop: 4 }}>
              {errors.name.message}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textDim }]}>Email</Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: errors.email ? "red" : colors.border,
              },
            ]}
          >
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  value={value}
                  readOnly
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textDim}
                  selectionColor={colors.primary}
                />
              )}
            />
          </View>

          {errors.email && (
            <Text style={{ color: "red", marginTop: 4 }}>
              {errors.email.message}
            </Text>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textDim }]}>Bio</Text>

          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: colors.surface,
                borderColor: errors.bio ? "red" : colors.border,
              },
            ]}
          >
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { color: colors.text },
                  ]}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="Tell us about yourself"
                  placeholderTextColor={colors.textDim}
                  multiline
                  textAlignVertical="top"
                  selectionColor={colors.primary}
                />
              )}
            />
          </View>

          {errors.bio && (
            <Text style={{ color: "red", marginTop: 4 }}>
              {errors.bio.message}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {Header}

        {Body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Avatar Section
  avatarSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 32,
  },

  changeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  changeButtonText: { fontSize: 13, fontWeight: "500" },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },

  // Form Section
  formSection: {
    gap: 20,
  },
  inputGroup: {
    flexDirection: "column",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textAreaWrapper: {
    minHeight: 100,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14, // Ensures multiline text isn't flush with the top on iOS
  },
});
