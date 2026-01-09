import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import React from 'react'

const CardCompanyInformation = ({ Icon, secondtext, topText }) => {
    const { width, height } = useWindowDimensions();
    
    // Calculate responsive sizes
    const isSmallScreen = width < 375;
    const isTablet = width >= 768;
    
    // Responsive values
    const containerWidth = isTablet ? '90%' : '95%';
    const marginTop = isTablet ? 30 : 25;
    const iconContainerHeight = isTablet ? height / 12 : height / 16;
    const iconContainerWidth = isTablet ? width / 6 : width / 8;
    const marginLeft = isTablet ? 15 : 10;
    const fontSize = isTablet ? 18 : 16;

    return (
        <View style={[
            styles.container, 
            { 
                width: containerWidth,
                marginTop: marginTop 
            }
        ]}>
            <View style={[
                styles.iconContainer, 
                { 
                    height: iconContainerHeight,
                    width: iconContainerWidth 
                }
            ]}>
                {Icon}
            </View>
            <View style={[styles.textContainer, { marginLeft }]}>
                <Text style={[styles.topText, { fontSize }]}>{topText}</Text>
                <Text style={[styles.secondText, { fontSize }]} numberOfLines={2}>
                    {secondtext || 'Not Available'}
                </Text>
            </View>
        </View>
    )
}

export default CardCompanyInformation

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center'
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    topText: {
        color: 'black',
        fontFamily: 'K2D-Regular',
        marginBottom: 4,
    },
    secondText: {
        color: 'black',
        fontFamily: 'K2D-Regular',
    },
});