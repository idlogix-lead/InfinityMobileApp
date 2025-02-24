import { StyleSheet, Text, View, Dimensions, Image, StatusBar, ImageBackground } from 'react-native'
import React, { useEffect,useCallback  } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const SplashScreen = ({ navigation }) => {
    
    const getTokens = async () => {
        const token = await AsyncStorage.getItem('token')
        const tokenOk = await AsyncStorage.getItem('tokenOk')
        const roleId = await AsyncStorage.getItem('roleId')
        const userName = await AsyncStorage.getItem('userName')
        const password = await AsyncStorage.getItem('password')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const clientId = await AsyncStorage.getItem('clientId')
        const organizationId = await AsyncStorage.getItem('organizationId')
        const warehouseId = await AsyncStorage.getItem('warehouseId')

        if (token) {
            await fetch(`${protocol}:${host}:${port}/api/v1/auth/tokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userName: userName,
                    password: password
                }),
            })
                .then(response => response.text())
                .then(async (responseText) => {
                    const responseJSON = JSON.parse(responseText);
                    const token = responseJSON.token;
                    const URL = `${protocol}://${host}:${port}/api/v1/auth/tokens`
                    const sessionResponse = await fetch(URL, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            clientId,
                            roleId,
                            organizationId,
                            warehouseId,
                            language: 'en_US'
                        })
                    })
                    if (!sessionResponse.ok) {
                        console.error(`PUT request failed with status ${sessionResponse.status}`);
                        alert(`some problem with server ${sessionResponse.status}`)
                        navigation.navigate('WelcomeScreen')
                    } else {
                        const sessionData = await sessionResponse.json();
                        const token = sessionData.token
                        await AsyncStorage.setItem('token', token)
                        setTimeout(() => {
                            navigation.navigate('FingerPrintScreen', { token, tokenOk, roleId });
                        }, 2000);
                    }
                })
        } else {
            setTimeout(() => {
                navigation.navigate('WelcomeScreen')
            }, 3000)
        }
    }
    useFocusEffect(
        useCallback(() => {
          getTokens();
        }, [])
      );
    // useEffect(() => {
    //     getTokens();
    // }, [])

    // const getTokens = async () => {
    //     const token = await AsyncStorage.getItem('token');
    //     const tokenOk = await AsyncStorage.getItem('tokenOk');
    //     const roleId = await AsyncStorage.getItem('roleId');
    //     const userName = await AsyncStorage.getItem('userName');
    //     const password = await AsyncStorage.getItem('password');
    //     const protocol = await AsyncStorage.getItem('protocol');
    //     const host = await AsyncStorage.getItem('host');
    //     const port = await AsyncStorage.getItem('port');
    //     const clientId = await AsyncStorage.getItem('clientId');
    //     const organizationId = await AsyncStorage.getItem('organizationId');
    //     const warehouseId = await AsyncStorage.getItem('warehouseId');

    //     if (token) {
    //         try {
    //             const isValidToken = true; 

    //             if (!isValidToken) {
    //                 throw new Error('Token is invalid or expired');
    //             }
    //             const sessionResponse = await fetch(`${protocol}://${host}:${port}/api/v1/auth/tokens`, {
    //                 method: 'PUT',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`,
    //                 },
    //                 body: JSON.stringify({
    //                     clientId,
    //                     roleId,
    //                     organizationId,
    //                     warehouseId,
    //                     language: 'en_US',
    //                 }),
    //             });

    //             if (!sessionResponse.ok) {
    //                 throw new Error(`Session update failed with status: ${sessionResponse.status}`);
    //             }

    //             const sessionData = await sessionResponse.json();
    //             const updatedToken = sessionData.token;
    //             await AsyncStorage.setItem('token', updatedToken);

    //             setTimeout(() => {
    //                 navigation.navigate('FingerPrintScreen', { token: updatedToken, tokenOk, roleId });
    //             }, 3000);

    //         } catch (error) {
    //             console.error(error);
    //             setTimeout(() => {
    //                 navigation.navigate('WelcomeScreen');
    //             }, 3000);
    //         }
    //     } else {
    //         setTimeout(() => {
    //             navigation.navigate('WelcomeScreen');
    //         }, 3000);
    //     }
    // };

    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" />

            <ImageBackground source={require('../../asserts/splashScreenAsserts/ERP_splash.png')}
                style={styles.imageBackground}
                resizeMode="cover">

                {/* <View style={styles.imageCon}>
                    <Image
                        source={require('../../asserts/splashScreenAsserts/infinityFinal.png')}
                        style={{ height: height / 5.8, width: width / 1.8, marginTop: "50%" }}
                    />
                </View> */}


                <View style={styles.bottomContainer}>
                    <Text style={styles.txtPowerBy}>Powered by</Text>
                    <View style={{ borderRightWidth: 2, borderRightColor: 'white', width: 10, height: 15 }} />

                    <Text style={styles.txt}>ID LOGIX</Text>


                </View>
            </ImageBackground>
        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageCon: {
        alignItems: 'center',
        justifyContent: 'center',
        height: height / 1.5,
        width: width,
    },
    topMiddleText: {
        flexDirection: 'row'
    },
    txt: {
        fontSize: 16,
        fontFamily: 'K2D-Regular',
        color: 'white',
        marginLeft: 10,
        textShadowColor: '#0070C0',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    middleContainer: {
        alignItems: 'center'
    },
    txt2: {
        fontSize: 16,
        fontFamily: 'K2D-Regular',
        color: 'white',
        textShadowColor: '#0070C0',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    bottomContainer: {
        alignItems: 'center',
        marginTop: "40%",
        flexDirection: 'row',
        alignSelf: 'center',
    },
    txtBottom: {
        flexDirection: 'row'
    },
    txtPowerBy: {
        fontSize: 16,
        fontFamily: 'K2D-Bold',
        color: 'white',
        textShadowColor: '#0070C0',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4
    },
    imageBackground: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
})