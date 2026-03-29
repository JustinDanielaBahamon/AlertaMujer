import { View , Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Index(){
  return(
   <View style={{
    backgroundColor : "black" , 
    display : 'flex' , 
    flex: 1 ,  
    justifyContent : 'center' ,
    alignItems:'center'
    }}>

    <Text style={{color : 'white'}}>Bienvenido</Text>
   
        <TouchableOpacity onPress={()=> router.replace("/(tabs)/inicio")}>
      
          <Text style={{color : 'white', marginTop: 30 , borderRadius: 20 , borderColor:'white', borderWidth:3 , padding : 10, backgroundColor:'purple'}}>Presiona para ir</Text>

        </TouchableOpacity> 

  
   </View> 
  );
}