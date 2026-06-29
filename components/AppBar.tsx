import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

export default function AppBar({ left, center, right}:{ left?:ReactNode, center?:ReactNode, right?:ReactNode}){
    return(
        <View style={styles.container}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>{left}</View>
            <View style={{ flex: 1, alignItems: 'center' }}>{center}</View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>{right}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        height: 50, 
        backgroundColor: 'white', 
        justifyContent: 'space-between', 
        alignItems: 'center'
        
    }

})