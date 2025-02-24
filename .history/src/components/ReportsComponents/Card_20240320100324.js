import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import React, { useState } from 'react';

const Card = ({ item }) => {
    const [expanded, setExpanded] = useState(true);
    const [expanded2, setExpanded2] = useState(true);
    const [expanded3, setExpanded3] = useState(true);

    // Separate animation values for each expandable section
    const [animation, setAnimation] = useState(new Animated.Value(1)); // Main section
    const [animation2, setAnimation2] = useState(new Animated.Value(1)); // Section 2
    const [animation3, setAnimation3] = useState(new Animated.Value(1)); // Section 3

    // Adjust toggle function to use corresponding state and animation
    const handleToggle = (expandedState, setExpandedState, animationValue) => {
        let finalValue = expandedState ? 0 : 1; // Determine final value based on current state
        Animated.timing(animationValue, {
            toValue: finalValue,
            duration: 300,
            useNativeDriver: false,
        }).start(() => setExpandedState(!expandedState));
    };

    // We calculate height for each section but you might want to adjust this based on your actual content
    const cardHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 400], // Adjust these values according to your needs
    });
    const cardHeight2 = animation2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200], // Adjust these values according to your needs
    });
    const cardHeight3 = animation3.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200], // Adjust these values according to your needs
    });

    return (
        <View>
            <TouchableOpacity onPress={() => handleToggle(expanded, setExpanded, animation)}
                style={styles.MainContainer}>
                <Text style={styles.TitleTxt}>Funds Available</Text>
                <Text style={styles.TitleTxt}>{item.title}</Text>
            </TouchableOpacity>
            <Animated.View style={{ height: cardHeight, overflow: 'hidden' }}>
                <TouchableOpacity onPress={() => handleToggle(expanded2, setExpanded2, animation2)}
                    style={styles.MiddleContainer}>
                    <Text style={styles.TitleTxt}>Cash</Text>
                    <Text style={styles.TitleTxt}>{item.title}</Text>
                </TouchableOpacity>
                <Animated.View style={{ height: cardHeight2, overflow: 'hidden' }}>
                    <View style={styles.InnerConteiner}>
                    <Text>hedjwnska</Text>
                    </View>
                </Animated.View>

                <TouchableOpacity onPress={() => handleToggle(expanded3, setExpanded3, animation3)}
                    style={styles.MiddleContainer}>
                    <Text style={styles.TitleTxt}>Bank</Text>
                    <Text style={styles.TitleTxt}>{item.title}</Text>
                </TouchableOpacity>

                <Animated.View style={{ height: cardHeight3, overflow: 'hidden' }}>
                    <View style={styles.InnerConteiner}>
                        <Text>hedjwnska</Text>
                    </View>
                </Animated.View>
            </Animated.View>
        </View>
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
    MiddleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        width: '90%',
        padding: 10,
        marginTop: 10,
        alignSelf: 'center'
    },
    TitleTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        fontSize: 18,
    },
    InnerConteiner:{
        width:'90%',
        backgroundColor:'#eeeeee',
        alignSelf:'center',
    },
})