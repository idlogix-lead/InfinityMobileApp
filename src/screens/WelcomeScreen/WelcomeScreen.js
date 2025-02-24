import { StyleSheet, Text, View, Image, Dimensions, TextInput, TouchableOpacity, BackHandler, ScrollView, StatusBar } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const WelcomeScreen = ({ navigation }) => {
    const [selectedValue, setSelectedValue] = useState('Select a host');
    const [IpAddress, setIpAddress] = useState('');
    const [portNum, setPortNum] = useState('');
    const options = [
        { label: 'Select a Host', value: 'select a Host' },
        { label: 'http', value: 'http' },
        { label: 'https', value: 'https' },
    ];

    const handleBackButton = () => {
        BackHandler.exitApp();
        return true;
    }

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);

        return () => BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    }, []);


    const navigateToSignIn = async () => {
        if (selectedValue === 'select a Host') {
            alert('Please select host')
        } else if (IpAddress.trim() === '') {
            alert('Please enter your IP address')
        } else if (portNum.trim === '') {
            alert('Please enter your Port Number')
        } else {
            await AsyncStorage.setItem('protocol', selectedValue).then(async () => {
                await AsyncStorage.setItem('host', IpAddress).then(async () => {
                    await AsyncStorage.setItem('port', portNum).then(() => {
                        navigation.navigate('SignIn')
                    })
                })
            })
        }
    }

    return (
        <View style={{
            flex: 1,
            // backgroundColor:'#0050C0'
            backgroundColor: '#fff'
        }}>
            <StatusBar translucent={true} backgroundColor="white" />
            {/* First image */}
            <View style={[styles.imageCon,{backgroundColor:""}]}>
                <Image
                    // source={require('../../asserts/WelcomeSrn/icon-erp167.png')}
                    source={require('../../asserts/WelcomeSrn/icons...41.png')}
                    style={{ height: height / 2.5, width: width / 1.2, marginTop: '20%', }} />
            </View>

            <View style={styles.inputContainer}>
                {/* Txt View */}
                <View>
                    <Text style={styles.serverConfigurationTxt}>
                        Server Configuration
                    </Text>
                </View>
                {/* All center View */}
                <View style={styles.pickerStyle}>
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue, itemIndex) =>
                            setSelectedValue(itemValue)
                        }
                        style={styles.pickerItem}
                        dropdownIconColor={'black'}
                    >
                        {options.map(option => (
                            <Picker.Item
                                key={option.value}
                                label={option.label}
                                value={option.value}
                            />
                        ))}
                    </Picker>
                </View>

                <View style={{ marginTop: 12, alignContent:"center",  }}>
                    <TextInput
                        onChangeText={text => setIpAddress(text)}
                        value={IpAddress}
                        placeholder="Enter your Domain / IP Adress"
                        placeholderTextColor="black"
                        style={styles.input}
                    />
                </View>
                <View style={{ marginTop: 12 }}>
                    <TextInput
                        onChangeText={text => setPortNum(text)}
                        value={portNum}
                        placeholder="Enter your Port Number"
                        placeholderTextColor="black"
                        style={styles.input}
                    />
                </View>

                {/* Button */}
                <View style={styles.btnCotainer}>
                    <TouchableOpacity style={styles.btn} onPress={() => navigateToSignIn()}>
                        <Text style={styles.btnTxt}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    imageCon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 4.2,
        width: width,
    },
    middleContainer: {
        alignItems: 'center'
    },
    txt: {
        fontSize: 32,
        fontFamily: 'K2D-Bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    txt2: {
        fontSize: 32,
        fontFamily: 'K2D-Bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    topMiddleText: {
        flexDirection: 'row'
    },
    inputContainer: {
        marginTop: height / 8,
        // backgroundColor:"gray"
        backgroundColor: "#f1f1f1",
        width: "95%",
        alignSelf: "center",
        borderRadius: 10
    },
    pickerStyle: {
        width: width / 1.1,
        // borderBottomColor: 'white',
        // borderWidth: 1,
        alignSelf:"center",
        borderRadius:10,
        backgroundColor:"#DCDADA",
        marginTop:"4%"
    },
    pickerItem: {
        color: 'black',
        fontFamily: "K2D"
    },
    input: {
        width: width / 1.1,
        backgroundColor:"#DCDADA",
        // borderBottomWidth: 1,
        color: 'black',
        fontFamily: 'K2D-Regular',
        alignSelf: "center",
        borderRadius:10
    },
    btn: {
        // backgroundColor: "#00B0F0",
        backgroundColor: "#002E62",
        width: width / 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 16,
        borderRadius: 10,
        marginBottom: "20%",
        marginTop:"-5%"
    },
    btnCotainer: {
        alignItems: 'center',
        marginTop: height / 8,

    },
    btnTxt: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'K2D',
    },
    bottomContainer: {
        alignItems: 'center',
        marginTop: height / 28
    },
    txtBottom: {
        flexDirection: 'row'
    },
    serverConfigurationTxt:{ marginTop: "5%", fontSize: 20, fontWeight: "800", color: "black", paddingLeft: "3%" }
})