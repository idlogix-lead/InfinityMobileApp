import { StyleSheet, Text, View, Image, Dimensions, TextInput, TouchableOpacity, BackHandler, ScrollView,StatusBar } from 'react-native'
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
        <View style={{ flex: 1 ,backgroundColor:'#0050C0'}}>
            <StatusBar translucent={true}  backgroundColor="#0050C0" />
            {/* First image */}
            <View style={styles.imageCon}>
                <Image
                    source={require('../../asserts/splashScreenAsserts/infinityLoginIcon.png')}
                    style={{ height: height / 5.8, width: width / 1.8,marginTop:'30%',backgroundColor:'red' }}

                />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.pickerStyle}>
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={(itemValue, itemIndex) =>
                            setSelectedValue(itemValue)
                        }
                        style={styles.pickerItem}
                        dropdownIconColor={'white'}
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

                <View style={{ marginTop: 12 }}>
                    <TextInput
                        onChangeText={text => setIpAddress(text)}
                        value={IpAddress}
                        placeholder="Enter your Domain / IP Adress"
                        placeholderTextColor="white"
                        style={styles.input}
                    />
                </View>
                <View style={{ marginTop: 12 }}>
                    <TextInput
                        onChangeText={text => setPortNum(text)}
                        value={portNum}
                        placeholder="Enter your Port Number"
                        placeholderTextColor="white"
                        style={styles.input}
                    />
                </View>
            </View>


            {/* Button */}
            <View style={styles.btnCotainer}>
                <TouchableOpacity style={styles.btn} onPress={() => navigateToSignIn()}>
                    <Text style={styles.btnTxt}>Save Changes</Text>
                </TouchableOpacity>
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
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 4
    },
    txt2: {
        fontSize: 32,
        fontFamily: 'K2D-Bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: {width: 2, height: 2},
        textShadowRadius: 4
    },
    topMiddleText: {
        flexDirection: 'row'
    },
    inputContainer: {
        alignItems: 'center',
        marginTop: height / 8
    },
    pickerStyle: {
        width: width / 1.3,
        borderBottomColor: 'white',
        borderBottomWidth: 1
    },
    pickerItem: {
        color: 'white',
        fontFamily: "K2D"
    },
    input: {
        width: width / 1.3,
        borderBottomColor: 'white',
        borderBottomWidth: 1,
        color: 'white',
        fontFamily: 'K2D-Regular'
    },
    btn: {
        backgroundColor: "#00B0F0",
        width: width / 2,
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 16,
        borderRadius: 10,
    },
    btnCotainer: {
        alignItems: 'center',
        marginTop: height / 8
    },
    btnTxt: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'K2D'
    },
    bottomContainer: {
        alignItems: 'center',
        marginTop: height / 28
    },
    txtBottom: {
        flexDirection: 'row'
    },
})