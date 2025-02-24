import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import React, { useState, useContext } from 'react';
import { create } from 'react-test-renderer';

const Card = ({ item }) => {
    const [expanded, setExpanded] = useState(true);
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

    const cardHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 200],
    });

    return (
        <Animated.View style={{ height: cardHeight }}>
            <TouchableOpacity style={styles.MainContainer}>
                <Text style={styles.TitleTxt}>Funds Available</Text>
                <Text style={styles.TitleTxt}>{item.title}</Text>


            </TouchableOpacity>
            {/* <TouchableOpacity style={expanded ? {flexDirection:'row' , backgroundColor:'#F9d7ad', justifyContent:'space-between' ,height:40,borderWidth:1,borderColor:'#fff' }:{flexDirection:'row' , backgroundColor:'#FFFFFF' , justifyContent:'space-between' ,height:40,borderWidth:1,borderColor:'#fff' }} onPress={handleToggle}>
        <Text style={{ color:'#000',marginRight:20,marginTop:10}}>{item.price }</Text>
      </TouchableOpacity> */}
            {expanded && (
                <TouchableOpacity onPress={handleToggle}>
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
        backgroundColor:'#fff',
        width: '100%',
    },
    TitleTxt:{
        color:'#000',
        fontFamily:'K2D-Regular',
    },
})