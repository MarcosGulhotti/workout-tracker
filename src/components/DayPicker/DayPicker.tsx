import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type DayPickerProps = {
    selectedDay: number | null;
    handleDayPress: (day: number) => void;
}

const DayPicker = ({ handleDayPress, selectedDay }: DayPickerProps) => {
    return (
        <View style={styles.container}>
            {daysOfWeek.map((day, ind) => (
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.dayButton,
                        selectedDay === ind && styles.selectedDayButton,
                    ]}
                    onPress={() => handleDayPress(ind)}
                >
                    <Text
                        style={[
                            styles.dayText,
                            selectedDay === ind && styles.selectedDayText,
                        ]}
                    >
                        {day}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        padding: 10,
    },
    dayButton: {
        padding: 10,
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#ddd',
    },
    selectedDayButton: {
        backgroundColor: '#007BFF',
    },
    dayText: {
        color: '#000',
    },
    selectedDayText: {
        color: '#fff',
    },
});

export default DayPicker;