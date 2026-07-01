import { Pressable } from "react-native"

export default function IconButton({icon, clickHandler}){
    return(
        <Pressable onPress={clickHandler}>
            {icon}
        </Pressable>
    )
}