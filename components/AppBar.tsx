import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function AppBar({ left, center, right}:{ left?:ReactNode, center?:ReactNode, right?:ReactNode}){
    const insets = useSafeAreaInsets();
    return(
        <View style={[styles.container, {paddingTop: insets.top, paddingBottom: 0}]}>
            <View style={{height: 56, flexDirection: 'row', alignItems: 'center'}}>
                <View style={{ flex: 1, alignItems: 'flex-start' }}>{left}</View>
                <View style={{ flex: 1, alignItems: 'center' }}>{center}</View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>{right}</View>
            </View>
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16
        
    }


})