import BottomSheet, {
  BottomSheetRefProps,
} from "@/components/BottomSheet/BottomSheet";
import HistoryWorkoutCard from "@/components/Cards/HistoryWorkoutCard/HistoryWorkoutCard";
import { LabeledTextInput } from "@/components/LabeledTextInput/LabeledTextInput";
import { PageWrapper } from "@/components/PageWrapper/PageWrapper";
import { Separator } from "@/components/Separator/Separator";
import { CompletedWorkout } from "@/database/types";
import { useWorkoutDatabase } from "@/database/useWorkoutDatabase";
import { NavigationPageProps } from "@/types/navigation";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Button,
  Modal as NativeModal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { filterCompletedWorkouts } from "./utils/filters";

export function History({ navigation }: NavigationPageProps) {
  const { getWorkoutHistory } = useWorkoutDatabase();

  const filtersRef = useRef<BottomSheetRefProps>(null);
  const cardRef = useRef<BottomSheetRefProps>(null);

  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [detailedWorkout, setDetailedWorkout] =
    useState<CompletedWorkout | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [filtersActive, setFiltersActive] = useState(false);
  const [cardActive, setCardActive] = useState(false);

  const filteredWorkouts = useMemo(
    () => filterCompletedWorkouts(workouts, { searchTerm, startDate, endDate }),
    [workouts, searchTerm, startDate, endDate],
  );

  const hasBottomSheet = useMemo(() => {
    return !!filtersActive || !!cardActive;
  }, [cardActive, filtersActive]);

  const onPress = useCallback(() => {
    const isActive = filtersRef?.current?.isActive();
    if (isActive) {
      filtersRef?.current?.scrollTo(0);
      setFiltersActive(false);
    } else {
      filtersRef?.current?.scrollTo(-500);
      setFiltersActive(true);
    }
  }, []);

  const handleGetWorkoutHistory = useCallback(async () => {
    setLoading(true);
    const result = await getWorkoutHistory();
    setWorkouts(result);
    setLoading(false);
  }, [getWorkoutHistory]);

  const handleSetDetailedWorkout = useCallback((workout: CompletedWorkout) => {
    setDetailedWorkout(workout);
    const isActive = cardRef?.current?.isActive();
    if (isActive) {
      cardRef?.current?.scrollTo(0);
      setCardActive(false);
    } else {
      cardRef?.current?.scrollTo(-500);
      setCardActive(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!loading && workouts.length === 0) {
        handleGetWorkoutHistory();
      }
    }, [handleGetWorkoutHistory, loading, workouts]),
  );

  return (
    <PageWrapper
      navigate={navigation}
      selectedButton="History"
      headerProps={{
        showAddButton: false,
        showSearchButton: false,
        customButton: "tune",
        customButtonOnPress: onPress,
      }}
      hasBottomSheet={hasBottomSheet}
      closeBackdrop={() => {
        setFiltersActive(false);
        setCardActive(false);
        filtersRef?.current?.scrollTo(0);
        cardRef?.current?.scrollTo(0);
      }}
    >
      <ScrollView>
        <Separator text="History" />

        {loading && <Text>Loading...</Text>}
        {!loading && (
          <HistoryWorkoutCard
            completedWorkouts={filteredWorkouts}
            onPress={handleSetDetailedWorkout}
          />
        )}
      </ScrollView>

      <NativeModal
        visible={showStartPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStartPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStartPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  themeVariant="light"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setStartDate(selectedDate);
                    setShowStartPicker(false);
                  }}
                />
                <Button
                  title="Fechar"
                  onPress={() => setShowStartPicker(false)}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </NativeModal>

      <NativeModal
        visible={showEndPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEndPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  themeVariant="light"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setEndDate(selectedDate);
                    setShowEndPicker(false);
                  }}
                />
                <Button
                  title="Fechar"
                  onPress={() => setShowEndPicker(false)}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </NativeModal>

      <BottomSheet ref={cardRef} closeBackdrop={() => setCardActive(false)}>
        <ScrollView>
          {detailedWorkout &&
            detailedWorkout.completed_exercises.map((exercise, index) => (
              <View key={index}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {exercise.name} - {exercise.completed_sets.length} Sets
                </Text>
                {exercise.completed_sets.map((set, setIndex) => (
                  <View key={setIndex} style={{ marginLeft: 10 }}>
                    <Text>
                      Set {set.set_number}: {set.repetitions} reps at{" "}
                      {set.weight} kg
                    </Text>
                  </View>
                ))}
              </View>
            ))}
        </ScrollView>
      </BottomSheet>
      <BottomSheet
        ref={filtersRef}
        closeBackdrop={() => setFiltersActive(false)}
      >
        <ScrollView style={{ marginTop: 20 }}>
          <LabeledTextInput
            label="Nome do treino:"
            placeholder="Buscar por nome do treino..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ marginHorizontal: 20 }}
            onPress={() => {
              const isActive = filtersRef?.current?.isActive();
              if (isActive) {
                filtersRef?.current?.scrollTo(-700);
              }
            }}
            onSubmitEditing={() => {
              const isActive = filtersRef?.current?.isActive();
              if (isActive) {
                filtersRef?.current?.scrollTo(-500);
              }
            }}
          />
          <View style={styles.dateFilters}>
            <View style={styles.container}>
              <Text style={styles.dateInputLabel}>Data de início:</Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={styles.dateInput}
              >
                <Text style={{ color: startDate ? "#000" : "#888" }}>
                  {startDate
                    ? startDate.toLocaleDateString("pt-BR")
                    : "Selecionar data de início"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Text style={styles.dateInputLabel}>Data de fim:</Text>
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={styles.dateInput}
              >
                <Text style={{ color: endDate ? "#000" : "#888" }}>
                  {endDate
                    ? endDate.toLocaleDateString("pt-BR")
                    : "Selecionar data de fim"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </BottomSheet>
    </PageWrapper>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateFilters: {
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dateInput: {
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    height: 40,
  },
  dateInputLabel: {
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "100%",
  },
});
