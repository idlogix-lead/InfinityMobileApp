import { StyleSheet, Text, View, Dimensions, Image, StatusBar, ImageBackground, Animated } from 'react-native'
import React, { useEffect, useCallback, useRef, useMemo } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const SplashScreen = ({ navigation }) => {

    // const moveAnim = useRef(new Animated.Value(-1000)).current;
    // const moveAnim = useMemo(new Animated.Value(-1000)).current;


    // const moveAnim = useMemo(() => new Animated.Value(-1000), []);
    // const rotateAnim = useRef(new Animated.Value(0)).current;


    const moveAnim = useMemo(() => new Animated.Value(-1000), []);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const getTokens = async () => {
        const token = await AsyncStorage.getItem('token')
        const tokenOk = await AsyncStorage.getItem('tokenOk')
        const userId = await AsyncStorage.getItem('userId')
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
                            navigation.navigate('FingerPrintScreen', { token, userId,tokenOk, roleId });
                        }, 2600);
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


    // useEffect(() => {
    //     Animated.timing(moveAnim, {
    //       toValue: 0, // Move to top (0 means aligned with first image)
    //       duration: 500, // 2 seconds animation
    //       useNativeDriver: true,
    //     }).start();
    //   }, []);

    // useEffect(() => {
    //     Animated.spring(moveAnim, {
    //         toValue: 0,
    //         speed: 10,
    //         duration: 1000,
    //         bounciness: 10,
    //         useNativeDriver: true,
    //     }).start(() => {
    //         Animated.timing(rotateAnim, {
    //             toValue: 1,
    //             duration: 300,
    //             useNativeDriver: true,
    //         }).start();
    //     });
    // }, []);


    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100, 
            useNativeDriver: true,
        }).start(() => {
            
            Animated.spring(moveAnim, {
                toValue: 0,
                speed: 2,
                duration: 1000,
                bounciness: 10,
                useNativeDriver: true,
            }).start(() => {
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        });
    }, []);

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "30deg"],
    });
    return (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" />
            <Animated.View style={{
                // width: 220, height: 1000,
                flexDirection: "row",
                alignItems: "center",
                // backgroundColor:"red",
                marginRight: '20%',

                transform: [{ rotate: rotateInterpolate }],
            }}>
                <Image
                    source={require('../../asserts/splashScreenAsserts/Frame393(3).png')}
                    // source={require('../../asserts/splashScreenAsserts/87.png')}
                    style={{ width: 220, height: 200, }}
                />
                <View>
                    <Animated.Image
                        source={require('../../asserts/splashScreenAsserts/dot(1).png')}
                        style={{
                            transform: [{ translateY: moveAnim }], // Move dot UP first
                            width: 50,
                            height: 50,
                        }}
                    />
                </View>
            </Animated.View>
            {/* </View> */}



            {/* <ImageBackground source={require('../../asserts/splashScreenAsserts/ERP_splash.png')}
                style={styles.imageBackground}
                resizeMode="cover">
                 </ImageBackground> */}

            {/* <View style={styles.imageCon}>
                    <Image
                        source={require('../../asserts/splashScreenAsserts/infinityFinal.png')}
                        style={{ height: height / 5.8, width: width / 1.8, marginTop: "50%" }}
                    />
                </View> */}


            {/* <View style={styles.bottomContainer}>
                    <Text style={styles.txtPowerBy}>Powered by</Text>
                    <View style={{ borderRightWidth: 2, borderRightColor: 'white', width: 10, height: 15 }} />

                    <Text style={styles.txt}>ID LOGIX</Text>


                </View> */}

        </View>
    )
}

export default SplashScreen

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#002E62",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },


    // imageCon: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     height: height / 1.5,
    //     width: width,
    // },
    // topMiddleText: {
    //     flexDirection: 'row'
    // },
    // txt: {
    //     fontSize: 16,
    //     fontFamily: 'K2D-Regular',
    //     color: 'white',
    //     marginLeft: 10,
    //     textShadowColor: '#0070C0',
    //     textShadowOffset: { width: 2, height: 2 },
    //     textShadowRadius: 4
    // },
    // middleContainer: {
    //     alignItems: 'center'
    // },
    // txt2: {
    //     fontSize: 16,
    //     fontFamily: 'K2D-Regular',
    //     color: 'white',
    //     textShadowColor: '#0070C0',
    //     textShadowOffset: { width: 2, height: 2 },
    //     textShadowRadius: 4
    // },
    // bottomContainer: {
    //     alignItems: 'center',
    //     marginTop: "40%",
    //     flexDirection: 'row',
    //     alignSelf: 'center',
    // },
    // txtBottom: {
    //     flexDirection: 'row'
    // },
    // txtPowerBy: {
    //     fontSize: 16,
    //     fontFamily: 'K2D-Bold',
    //     color: 'white',
    //     textShadowColor: '#0070C0',
    //     textShadowOffset: { width: 2, height: 2 },
    //     textShadowRadius: 4
    // },
    // imageBackground: {
    //     flex: 1,
    //     width: '100%',
    //     height: '100%',
    // },
})