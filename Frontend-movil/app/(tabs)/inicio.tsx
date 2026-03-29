import { View , Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";


export default function Saludo(){
  return(
    <View>
      <Text>Hola querer</Text>
      <TouchableOpacity onPress={()=> router.replace("/login")}>
          
        <Text style={{color : 'white', marginTop: 100 , borderRadius: 20 , borderColor:'white', borderWidth:3 , padding : 10, backgroundColor:'purple'}}>Presiona para ir login</Text>
    
      </TouchableOpacity> 
    </View>
     
  );
}