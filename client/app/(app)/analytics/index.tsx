import { fetchAnalytics } from "@/api/users";
import { useSession } from "@/lib/auth";
import { useTheme } from "@/providers/theme-provider";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { lineDataItem } from "react-native-gifted-charts";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenWidth = Dimensions.get("window").width;
const chartWidth = ScreenWidth * 0.72;

export default function Analytics() {
  const { colors } = useTheme();
  const { data: sessionData } = useSession();

  const router = useRouter();

  const { isPending, data, isError, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => fetchAnalytics(sessionData?.session.token),
  });

  const [activeTab, setActiveTab] = useState<"tokens" | "cost">("tokens");

  const summary = data?.data.summary;
  const chartData = data?.data.chartData;

  const usageByModels = data?.data.usageByModels;

  const formattedChartData: lineDataItem[] =
    (activeTab === "tokens"
      ? chartData?.map((d) => ({
          label: d.dayName,
          value: d.tokens,
        }))
      : chartData?.map((d) => ({
          label: d.dayName,
          value: d.cost,
        }))) || [];

  const dynamicSpacing = (chartWidth + 30) / formattedChartData.length - 1;

  const Header = (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text
        style={[
          styles.headerTitle,
          {
            color: colors.text,
          },
        ]}
      >
        Usage & Analytics
      </Text>
      <View style={{ width: 24 }} />
    </View>
  );

  const Body = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatsCard
          label="Total Tokens"
          value={summary?.totalTokens}
          icon="cpu"
          iconWrapperBgColor="rgba(88, 166, 255, 0.15)"
          iconColor={colors.primary}
        />
        <StatsCard
          label="Est. Cost"
          value={summary?.totalCost}
          icon="dollar-sign"
          iconColor="#2ea043"
          iconWrapperBgColor="rgba(46, 160, 67, 0.15)"
        />
      </View>
      <View style={styles.statsRow}>
        <StatsCard
          label=" Avg Latency"
          value={summary?.avgLatencyMs}
          icon="zap"
          iconColor="#d29922"
          iconWrapperBgColor="rgba(210, 153, 34, 0.15)"
        />
        <StatsCard
          label="Conversations"
          value={summary?.totalConversations}
          icon="message-square"
          iconColor={colors.textDim}
          iconWrapperBgColor="rgba(139, 148, 158, 0.15)"
        />
      </View>

      {/* Chart section */}

      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Last 7 Days
          </Text>

          <View
            style={[
              styles.tabContainer,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "tokens" && { backgroundColor: colors.border },
              ]}
              onPress={() => setActiveTab("tokens")}
            >
              <Text
                style={{
                  color: activeTab === "tokens" ? colors.text : colors.textDim,
                }}
              >
                Tokens
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "cost" && { backgroundColor: colors.border },
              ]}
              onPress={() => setActiveTab("cost")}
            >
              <Text
                style={{
                  color: activeTab === "cost" ? colors.text : colors.textDim,
                }}
              >
                Cost
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            styles.chartContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <LineChart
            data={formattedChartData}
            width={chartWidth}
            spacing={dynamicSpacing}
            height={180}
            thickness={1.5}
            color={colors.primary}
            hideDataPoints
            hideRules
            areaChart
            yAxisTextStyle={{ color: colors.textDim, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.textDim, fontSize: 10 }}
            startFillColor={colors.primary}
            endFillColor={colors.primaryLight}
            startOpacity={0.1}
            endOpacity={0.1}
            initialSpacing={10}
            noOfSections={4}
            formatYLabel={(label) => `${(Number(label) / 1000).toFixed(0)}k`}
          />
        </View>
      </View>

      {/*Usage by Models  */}
      <View style={styles.modelsSection}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Usage by Model
        </Text>
        <View
          style={[
            styles.modelsContainer,
            {
              borderColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {usageByModels?.map((item, index, arr) => {
            const hue = (index / arr.length) * 360;

            return (
              <View key={item.model}>
                <View style={styles.modelRow}>
                  <View style={styles.modelRowLeft}>
                    <View
                      style={[
                        styles.modelDot,
                        {
                          backgroundColor: `hsl(${hue}, 70%, 55%)`,
                        },
                      ]}
                    />

                    <View>
                      <Text style={[styles.modelName, { color: colors.text }]}>
                        {item.model}
                      </Text>
                      <Text
                        style={[
                          styles.modelProvider,
                          { color: colors.textDim },
                        ]}
                      >
                        {item.provider}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modelRowRight}>
                    <Text style={[styles.modelTokens, { color: colors.text }]}>
                      {item.totalTokens} tokens
                    </Text>
                    <Text style={[styles.modelCost, { color: colors.textDim }]}>
                      ${item.totalCost}
                    </Text>
                  </View>
                </View>

                {index < arr.length - 1 && (
                  <View
                    style={[styles.divider, { backgroundColor: colors.border }]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {isPending ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size={"large"} color={colors.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: colors.text }}>
            {error.message || "Something went wrong"}
          </Text>
        </View>
      ) : (
        <>
          {Header}
          {Body}
        </>
      )}
    </SafeAreaView>
  );
}

type FeatherIconName = keyof typeof Feather.glyphMap;

const StatsCard = ({
  label,
  value,
  icon,
  iconWrapperBgColor,
  iconColor,
}: {
  label: string;
  value?: number;
  icon: FeatherIconName;
  iconWrapperBgColor: string;
  iconColor: string;
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.statCard,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      <View
        style={[
          styles.statIconWrapper,
          {
            backgroundColor: iconWrapperBgColor,
          },
        ]}
      >
        <Feather name={icon} size={18} color={iconColor} />
      </View>

      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textDim }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Overview Cards
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  statIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Chart Section
  chartSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },

  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },

  chartContainer: {
    paddingVertical: 24,
    paddingLeft: 10,
    paddingRight: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
  },

  // Model Breakdown
  modelsSection: {
    marginBottom: 20,
  },
  modelsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  modelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  modelRowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  modelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  modelName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  modelProvider: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  modelRowRight: {
    alignItems: "flex-end",
  },
  modelTokens: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  modelCost: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginLeft: 44,
  },
});
