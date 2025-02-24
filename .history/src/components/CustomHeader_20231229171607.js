
import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/dist/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({title,RightIcon,RightPress,style,onBackPress}) => {
    const navigation = useNavigation()

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress(); // Execute the callback if provided
        } else {
            navigation.goBack();
        }
    };
    return (
        <View style={[styles.container, style]}>
             <View style={styles.header}>
             <MaterialCommunityIcons name='keyboard-backspace' size={34} color='#fff' onPress={handleBackPress}  />
                <Text style={styles.title}>{title}</Text>
                {RightIcon ? (
                    <MaterialCommunityIcons name={RightIcon} size={34} color='#fff' onPress={RightPress} />
                ) : (
                    <Text > {""}</Text>
                )}
                
                
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
         flexDirection:'row',
         alignItems:'center',
         justifyContent:'space-between',
         paddingHorizontal:25,
             
    },
    title:{
        fontSize:24,
        color:'white',
        fontFamily:"K2D-Regular"
    }
});

export default CustomHeader;
