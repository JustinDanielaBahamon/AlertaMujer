import {View , Text, TouchableOpacity, ScrollView} from 'react-native';
import {styles} from './Asistencia.style'
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import { Linking } from 'react-native';
import { useLocale } from "../../../contexts/LocaleContext";

export default function Asistencia(){
    const { t } = useLocale();

    const llamar = (numero: string) => {
        Linking.openURL(`tel:${numero}`);
    };

    return(
        <ScrollView 
            contentContainerStyle={{ flexGrow: 1, backgroundColor: 'white' }}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.ContenedorPrincipal}>
                <View style={styles.ContenedorCabezera}>
                    <MaterialIcons style={{marginRight:8}} name="medical-services" size={24} color="purple" />
                    <Text style={styles.TextoCabezera}>{t.asistencia.titulo}</Text>
                </View>

                <View style={styles.ContenedorCuadros}>
                    {/* Seccion Emergencia */}
                    <LinearGradient
                        colors={["rgb(174, 46, 151)", "rgb(108, 33, 179)"]}
                        start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
                        style={{ borderRadius: 22, padding: 20 }}
                    >
                        <Text style={{color:'white', fontSize:21, fontWeight: '600' }}>{t.asistencia.emergencia_titulo}</Text>
                        <Text style={{color:'white', fontSize:42, fontWeight: 'bold', marginVertical: 2 }}>123</Text>
                        <Text style={{color:'white', fontSize:14, marginBottom: 15}}>{t.asistencia.emergencia_desc}</Text>

                        <TouchableOpacity onPress={()=>llamar('123')} style={styles.BotonPolicia}> 
                            <View style={styles.LlamarIcono}>
                                <Feather name="phone" size={20} color="white" />
                                <Text style={styles.llamarTexto}>{t.asistencia.llamar_ahora}</Text>
                            </View>
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Segunda Seccion: Dos Columnas */}
                    <View style={styles.SegundaSeccion}>
                        <LinearGradient
                            colors={["rgb(240, 87, 87)", "rgb(132, 0, 255)"]} 
                            start={{ x: 0, y: 1 }} end={{ x: 1, y: 1 }}
                            style={styles.ContenedorViolencia}
                        >
                            <View style={styles.iconoUser}>
                                <Feather name="user" size={24} color="white"/>   
                            </View>
                            <Text style={{color:'white', fontSize:14, fontWeight: 'bold'}}>{t.asistencia.violencia}</Text>
                            <Text style={{color:'white', fontSize:32, fontWeight: 'bold'}}>156</Text>   
                            <Text style={{color:'white', fontSize:12, marginBottom: 15, height: 40}}>
                                {t.asistencia.violencia_desc}
                            </Text>    
                            <TouchableOpacity onPress={()=>llamar('156')} style={styles.llamarViolencia}>
                                <Text style={styles.llamadaSegundaSeccion}>{t.asistencia.llamar}</Text>
                            </TouchableOpacity> 
                        </LinearGradient>

                        <LinearGradient
                            colors={["rgb(142, 189, 255)", "rgb(255, 0, 191)"]} 
                            start={{ x: 1, y: 0 }} end={{ x: 1, y: 2 }}
                            style={styles.ContenedorMental}
                        >
                            <View style={styles.iconoBombillo}>
                                <MaterialIcons name="lightbulb-outline" size={26} color="#1E1228" />
                            </View>
                            <Text style={{color:'white', fontSize:14, fontWeight: 'bold'}}>{t.asistencia.salud_mental}</Text>
                            <Text style={{color:'white', fontSize:32, fontWeight: 'bold'}}>106</Text>
                            <Text style={{textAlign:'right', color:'white', fontSize:12, marginBottom: 15, height: 40}}>
                                {t.asistencia.salud_desc}
                            </Text>
                            <TouchableOpacity onPress={()=>llamar('106')} style={styles.llamarMental}>
                                <Text style={styles.llamadaSegundaSeccion}>{t.asistencia.llamar}</Text>
                            </TouchableOpacity>  
                        </LinearGradient>
                    </View>

                    {/* Tercera Seccion */}
                    <View style={styles.TerceraSeccion}>
                        <LinearGradient
                            colors={["rgb(174, 46, 151)","rgb(108, 33, 179)"]}
                            start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }}
                            style={{ borderRadius: 22, padding: 15 }}
                        >
                             <View style={styles.ContenedorPueblo}>
                                <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                                    <View style={styles.iconoEstrella}>
                                        <Feather name="star" size={22} color="orange" />
                                    </View>
                                    <View>
                                        <Text style={{color:'white', fontSize:13, fontWeight: '600'}}>{t.asistencia.defensoria}</Text>
                                        <Text style={{color:'white', fontSize:13}}>01 8000 914814</Text>
                                    </View>
                                </View>
                                <TouchableOpacity 
                                    onPress={()=>llamar('018000914814')} 
                                    style={[styles.llamarMental, { width: 80 }]}
                                >
                                    <Text style={styles.llamadaSegundaSeccion}>{t.asistencia.llamar}</Text>
                                </TouchableOpacity>  
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}