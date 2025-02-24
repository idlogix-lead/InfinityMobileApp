import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import React, { useState, useContext } from 'react';
import { create } from 'react-test-renderer';

const Card = ({ item }) => {
    const [expanded, setExpanded] = useState(true);
    const [expanded2, setExpanded2] = useState(true);
    const [expanded3, setExpanded3] = useState(true);
    const [animation] = useState(new Animated.Value(0));

    const handleToggle = () => {
        if (expanded) {
            Animated.timing(animation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start(() => setExpanded(false));
        } else {
            Animated.timing(animation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }).start(() => setExpanded(true));
        }
    };
    const handleToggle2 = () => {
        // if (expanded2) {
        //     Animated.timing(animation, {
        //         toValue: 0,
        //         duration: 300,
        //         useNativeDriver: false,
        //     }).start(() => setExpanded2(false));
        // } else {
        //     Animated.timing(animation, {
        //         toValue: 1,
        //         duration: 300,
        //         useNativeDriver: false,
        //     }).start(() => setExpanded2(true));
        // }
    };
    const handleToggle3 = () => {
        // if (expanded3) {
        //     Animated.timing(animation, {
        //         toValue: 0,
        //         duration: 200,
        //         useNativeDriver: false,
        //     }).start(() => setExpanded3(false));
        // } else {
        //     Animated.timing(animation, {
        //         toValue: 1,
        //         duration: 200,
        //         useNativeDriver: false,
        //     }).start(() => setExpanded3(true));
        // }
    };

    const cardHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [70, 200],
    });

    return (
        <Animated.View style={{ height: cardHeight }}>
            <TouchableOpacity onPress={handleToggle}
                style={styles.MainContainer}>
                <Text style={styles.TitleTxt}>Funds Available</Text>
                <Text style={styles.TitleTxt}>{item.title}</Text>
            </TouchableOpacity>
            {expanded && (
                // <View>
                    <TouchableOpacity onPress={handleToggle2}
                        style={styles.MiddleContainer}>
                        <Text style={styles.TitleTxt}>Cash</Text>
                        <Text style={styles.TitleTxt}>{item.title}</Text>
                    </TouchableOpacity>
                    )}
                    {expanded2 && (
                        <TouchableOpacity onPress={handleToggle2}>
                        <View style={{ height: 129, backgroundColor: '#E2E2E2' }}>
                            <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, padding: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'black', marginLeft: 20, fontSize: 17, }}>Payment</Text>
                                    <Text style={{ color: 'black', marginRight: 20, fontSize: 17, }}>Amount</Text>
                                </View>
    
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'black', marginLeft: 20, fontSize: 17, marginTop: 7 }}>Cash</Text>
                                    <Text style={{ color: 'black', marginRight: 20, fontSize: 17, marginTop: 7 }}>{item.cash}</Text>
                                </View>
                            </View>
    
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                <Text style={{ color: 'black', marginLeft: 20, fontSize: 17, marginTop: 7 }}>ربح Visa</Text>
                                <Text style={{ color: 'black', marginRight: 20, fontSize: 17, marginTop: 7 }}>{item.visa}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleToggle3}
                        style={styles.MiddleContainer}>
                        <Text style={styles.TitleTxt}>Bank</Text>
                        <Text style={styles.TitleTxt}>{item.title}</Text>
                    </TouchableOpacity>
                    {/* {expanded3 && (
                        <TouchableOpacity onPress={handleToggle3}>
                        <View style={{ height: 129, backgroundColor: '#E2E2E2' }}>
                            <View style={{ borderBottomColor: 'black', borderBottomWidth: 1, padding: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'black', marginLeft: 20, fontSize: 17, }}>Payment</Text>
                                    <Text style={{ color: 'black', marginRight: 20, fontSize: 17, }}>Amount</Text>
                                </View>
    
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: 'black', marginLeft: 20, fontSize: 17, marginTop: 7 }}>Cash</Text>
                                    <Text style={{ color: 'black', marginRight: 20, fontSize: 17, marginTop: 7 }}>{item.cash}</Text>
                                </View>
                            </View>
    
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                                <Text style={{ color: 'black', marginLeft: 20, fontSize: 17, marginTop: 7 }}>ربح Visa</Text>
                                <Text style={{ color: 'black', marginRight: 20, fontSize: 17, marginTop: 7 }}>{item.visa}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    )} */}
                {/* </View> */}
        </Animated.View>

    );
};

export default Card;

const styles = StyleSheet.create({
    MainContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        width: '100%',
        padding: 10,
        marginTop: 10,
    },
    MiddleContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        width: '90%',
        padding: 10,
        marginTop: 10,
        alignSelf:'center'
    },
    TitleTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 18,
    },
})