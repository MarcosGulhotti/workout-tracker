import { Text, View } from "react-native";

export function Separator({text}: {text: string}) {
    return (
        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginVertical: 10}}>
            <View style={{width: 45, height: 1, marginRight: 5, backgroundColor: '#c3c3c3'}} />
            <Text style={{marginHorizontal: 10, color: '#000'}}>{text}</Text>
            <View style={{flex: 1, height: 1, backgroundColor: '#c3c3c3'}} />
        </View>
    )
}

