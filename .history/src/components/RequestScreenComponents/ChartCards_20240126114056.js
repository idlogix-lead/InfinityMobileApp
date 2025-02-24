import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Svg, { Circle } from 'react-native-svg';

const ChartCards = ({ name, firstTop, secTop, thirdTop, total, comp, unComp, onPressFirst, onPressSecond, onPressThird, percentageNum, pressChart }) => {
    const radius = 40;
    const strokeWidth = 5;
    const circumference = 2.2 * Math.PI * (radius - strokeWidth / 2);
    let percentage = Math.round((percentageNum) * 100);
    const progress = (percentage / 100) * circumference;

    let color = 'lightgray';
    if (percentage >= 1 && percentage < 49) {
        color = 'red'
    } else if (percentage >= 50 && percentage < 90) {
        color = 'blue';
    } else if (percentage >= 90) {
        color = 'lightgreen';
    }

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={[styles.topName]}>
                    <View style={{ width: '64%', }}>
                        <Text style={styles.nameTxt}>{name}</Text>
                    </View>
                  
                </View>
              
                <View style={{ flexDirection: 'row'}}>
                    <Pressable style={styles.btn} onPress={onPressFirst}>
                        <View style={[styles.topHeading,{width:'100%'}]}>
                            <Text style={styles.nameTxt}>{firstTop}</Text>
                        </View>
                        <View>
                            <Text style={styles.nameTxt}>{total}</Text>
                        </View>
                    </Pressable>
                    <Pressable style={styles.btn} onPress={onPressSecond}>
                        <View style={styles.topHeading}>
                            <Text style={[styles.nameTxt,{width:80,marginLeft:15}]}>{secTop}</Text>
                        </View>
                        <View>
                            <Text style={styles.nameTxt}>{comp}</Text>
                        </View>
                    </Pressable>
                    <Pressable style={styles.btn} onPress={onPressThird}>
                        <View style={styles.topHeading}>
                            <Text style={styles.nameTxt}>{thirdTop}</Text>
                        </View>
                        <View>
                            <Text style={styles.nameTxt}>{unComp}</Text>
                        </View>
                    </Pressable>
                    <Pressable style={styles.chart}
                        onPress={pressChart}
                    >
                        <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
                            <Circle
                                stroke="#ddd"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                r={radius}
                                cx={radius + strokeWidth / 2}
                                cy={radius + strokeWidth / 2}
                            />
                            <Circle
                                stroke={color}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeDasharray={`${progress}, ${circumference}`}
                                r={radius}
                                cx={radius + strokeWidth / 2}
                                cy={radius + strokeWidth / 2}
                                transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
                            />

                            {percentage ? (
                                <Text
                                    style={{ position: 'absolute', top: radius - 7, left: 10, right: 0, textAlign: 'center', color: 'black' }}
                                >
                                    {`${percentage}% `}
                                </Text>
                            ) :
                                <Text
                                    style={{ position: 'absolute', top: radius - 7, left: 10, right: 0, textAlign: 'center', color: 'black' }}
                                >
                                    0%
                                </Text>
                            }
                        </Svg>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

export default ChartCards

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        bottom: 10,
        
    },
    card: {
        backgroundColor: 'white',
        width: '94%',
        height: 130,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10, 
        shadowColor: 'black', 
        shadowOffset: {
            width: 50,
            height: 50,
        },
        shadowOpacity: 1,
        shadowRadius: 10,
        bottom: 10,
        marginTop: 10,
        borderLeftWidth:3,
        borderLeftColor:'#0070C0',
    },
    topName: {
        width: '90%',
        flexDirection: 'row',
        borderBottomWidth:2,
        borderBottomColor:'#00B0F0' 
    },
    nameTxt: {
        color: 'black',
        fontSize: 13,
        fontFamily: 'K2D-Bold',
    },
    border: {
        backgroundColor: 'black',
        width: '100%',
        height: 1,   
    },
    btn: {
        width: '22%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    chart: {
        // backgroundColor: 'orange',
        width: '33%',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'center',
    },
    topHeading: {
        height: '45%',
        marginLeft:10
         
    },
    gauge: {
        // position: 'absolute',
        // width: 100,
        // height: 160,
        alignItems: 'center',
        justifyContent: 'center',
    },
    gaugeText: {
        // backgroundColor: 'transparent',
        color: '#000',
        // fontSize: 24,
    },
})