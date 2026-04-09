import { View , Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Index(){
  const navigation = useNavigation<any>();
  return(
   <View style={{
      backgroundColor : "black" , 
      display : 'flex' , 
      flex: 1 ,  
      justifyContent : 'center' ,
      alignItems:'center'
    }}>

    <Text style={{color : 'white'}}>Bienvenido</Text>
   
        <TouchableOpacity onPress={() => navigation.replace("DrawerHome")}>
      
          <Text style={{color : 'white', marginTop: 30 , borderRadius: 20 , borderColor:'white', borderWidth:3 , padding : 10, backgroundColor:'purple'}}>Presiona para ir menu</Text>

        </TouchableOpacity> 

        <TouchableOpacity onPress={() => navigation.replace("Login")}>
      
          <Text style={{color : 'white', marginTop: 30 , borderRadius: 20 , borderColor:'white', borderWidth:3 , padding : 10, backgroundColor:'purple'}}>Presiona para ir login</Text>

        </TouchableOpacity> 
   </View> 
  );
}