import { View, Text, StyleSheet, BackHandler, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ title, RightIcon, RightPress, style,MessageNameIcon,MessageOnPress }) => {
    const navigation = useNavigation()

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, []);

    const handleBackPress = () => {
        navigation.goBack();
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.header}>
                <MaterialCommunityIcons name='keyboard-backspace' size={34} color='#fff' onPress={handleBackPress} />
                <Text style={styles.title}>{title}</Text>
                {RightIcon ? (

                    <TouchableOpacity>
                    <MaterialCommunityIcons name={RightIcon} size={34} color='#fff' onPress={RightPress} />
                    </TouchableOpacity>
                ) : (
                    <Text > {""}</Text>
                )}
                {/* {MessageNameIcon ? (
                    <TouchableOpacity>
                    <Entypo name={MessageNameIcon} size={34} color='#fff' onPress={MessageOnPress} />
                    </TouchableOpacity>
                ) : (<Text > {""}</Text>)} */}


            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#0050C0',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10,
        justifyContent: 'center',
        height: 120,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 25,

    },
    title: {
        fontSize: 24,
        color: 'white',
        fontFamily: "K2D-Regular"
    }
});

export default CustomHeader;
