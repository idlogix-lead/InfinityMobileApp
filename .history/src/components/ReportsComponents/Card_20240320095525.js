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
        if (expanded2) {
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setExpanded2(false));
        } else {
            Animated.timing(animation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setExpanded2(true));
        }
    };
    const handleToggle3 = () => {
        if (expanded3) {
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setExpanded3(false));
        } else {
            Animated.timing(animation, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setExpanded3(true));
        }
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
                <TouchableOpacity onPress={handleToggle2}
                    style={styles.MiddleContainer}>
                    <Text style={styles.TitleTxt}>Cash</Text>
                    <Text style={styles.TitleTxt}>{item.title}</Text>
                </TouchableOpacity>
            )}
            {expanded2 && (
                <TouchableOpacity>
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
            {expanded3 && (
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
                    )}
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
})

This is my screen i want in this when i come to this screen all cards will open bydefault and onPress to card open and close its data which is inside of this 

ChatGPT
To achieve the behavior you want, where all cards are open by default and pressing a card toggles its open/close state, you'll need to make a few adjustments to your code. It looks like you already have the expanded states set to true by default for each section of the card, which is great. However, the animation handling and toggle functions need some refinement to ensure they work independently for each section.

Here's a refined version of your Card component that supports independent toggle functionality for each section with animations:

jsx
Copy code
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
        outputRange: [0, 200], // Adjust these values according to your needs
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
            {/* Main section */}
            <TouchableOpacity onPress={() => handleToggle(expanded, setExpanded, animation)}
                style={styles.MainContainer}>
                <Text style={styles.TitleTxt}>Funds Available</Text>
                <Text style={styles.TitleTxt}>{item.title}</Text>
            </TouchableOpacity>
            <Animated.View style={{ height: cardHeight, overflow: 'hidden' }}>
                {/* Your expandable content for the main section goes here */}
            </Animated.View>

            {/* Section 2 */}
            <TouchableOpacity onPress={() => handleToggle(expanded2, setExpanded2, animation2)}
                style={styles.MiddleContainer}>
                <Text style={styles.TitleTxt}>Cash</Text>
                <Text style={styles.TitleTxt}>{item.title}</Text>
            </TouchableOpacity>
            <Animated.View style={{ height: cardHeight2, overflow: 'hidden' }}>
                {/* Your expandable content for section 2 goes here */}
            </Animated.View>

            {/* Section 3 */}
            <TouchableOpacity onPress={() => handleToggle(expanded3, setExpanded3, animation3)}
                style={styles.MiddleContainer}>
                <Text style={styles.TitleTxt}>Bank</Text>
                <Text style={styles.TitleTxt}>{item.title}</Text>
            </TouchableOpacity>
            <Animated.View style={{ height: cardHeight3, overflow: 'hidden' }}>
                {/* Your expandable content for section 3 goes here */}
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
})