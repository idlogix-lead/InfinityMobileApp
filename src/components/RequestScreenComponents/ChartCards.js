// import { Dimensions, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
// import React, { useState } from 'react'
// import Svg, { Circle } from 'react-native-svg';

// const screenWidth = Dimensions.get("window").width;


// const ChartCards = ({ name, firstTop, secTop, thirdTop, total, comp, unComp, onPressFirst, onPressSecond, onPressThird, percentageNum, pressChart }) => {
//     const radius = 40;
//     // const radius = 40;
//     const strokeWidth = 5;
//     const circumference = 2.2 * Math.PI * (radius - strokeWidth / 2);
//     let percentage = Math.round((percentageNum) * 100);
//     const progress = (percentage / 100) * circumference;

//     let color = 'lightgray';
//     if (percentage >= 1 && percentage < 49) {
//         color = 'red'
//     } else if (percentage >= 50 && percentage < 90) {
//         color = 'blue';
//     } else if (percentage >= 90) {
//         color = 'lightgreen';
//     }

//     return (
//         <View style={styles.container}>
//             <View style={styles.card}>
//                 <View style={styles.topName}>
//                     <View style={{ 
//                         width: '64%'    
//                         }}>
//                         <Text style={[styles.nameTxt]}>{name}</Text>
//                     </View>

//                 </View>
//                 <View
//                     style={{
//                         position: "absolute",
//                         // bottom: screenWidth * 0.24, // Adjust bottom spacing relative to screen width
//                         bottom:screenWidth * 0.27,
//                         left: -screenWidth * 0.04, // Extend beyond card (5% of screen width)
//                         right: -screenWidth * 0.05, // Extend beyond card (5% of screen width)
//                         width: "110%", // Make it slightly wider than the card
//                         borderBottomColor: "gray",
//                         borderBottomWidth: 1,
//                         alignSelf: "center",
                        
//                     }}
//                 />

//                 <View style={{ flexDirection: 'row',  }}>
//                     <Pressable style={styles.btn} onPress={onPressFirst}>
//                         <View style={[styles.topHeading, { width: '100%', }]}>
//                             <Text style={styles.nameTxt}>{firstTop}</Text>
//                         </View>
//                         <View>
//                             <Text style={styles.nameTxt}>{total}</Text>
//                         </View>
//                     </Pressable>
//                     <Pressable style={styles.btn} onPress={onPressSecond}>
//                         <View style={styles.topHeading}>
//                             <Text style={[styles.nameTxt, { width: 80, marginLeft: 15 }]}>{secTop}</Text>
//                         </View>
//                         <View>
//                             <Text style={styles.nameTxt}>{comp}</Text>
//                         </View>
//                     </Pressable>
//                     <Pressable style={styles.btn} onPress={onPressThird}>
//                         <View style={styles.topHeading}>
//                             <Text style={styles.nameTxt}>{thirdTop}</Text>
//                         </View>
//                         <View>
//                             <Text style={styles.nameTxt}>{unComp}</Text>
//                         </View>
//                     </Pressable>
//                     <Pressable style={styles.chart}
//                         onPress={pressChart}
//                     >
//                         <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
//                             <Circle
//                                 stroke="#ddd"
//                                 strokeWidth={strokeWidth}
//                                 fill="transparent"
//                                 r={radius}
//                                 cx={radius + strokeWidth / 2}
//                                 cy={radius + strokeWidth / 2}
//                             />
//                             <Circle
//                                 stroke={color}
//                                 strokeWidth={strokeWidth}
//                                 fill="transparent"
//                                 strokeDasharray={`${progress}, ${circumference}`}
//                                 r={radius}
//                                 cx={radius + strokeWidth / 2}
//                                 cy={radius + strokeWidth / 2}
//                                 transform={`rotate(-90 ${radius + strokeWidth / 2} ${radius + strokeWidth / 2})`}
//                             />

//                             {percentage ? (
//                                 <Text
//                                     style={{ position: 'absolute', top: radius - 7, left: 10, right: 0, textAlign: 'center', color: 'black' }}
//                                 >
//                                     {`${percentage}% `}
//                                 </Text>
//                             ) :
//                                 <Text
//                                     style={{ position: 'absolute', top: radius - 7, left: 10, right: 0, textAlign: 'center', color: 'black' }}
//                                 >
//                                     0%
//                                 </Text>
//                             }
//                         </Svg>
//                     </Pressable>
//                 </View>
//             </View>
//         </View>
//     )
// }

// export default ChartCards

// const styles = StyleSheet.create({
//     container: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 20,
//         bottom: 10,

//     },
//     card: {
//         // backgroundColor: 'white',
//         // width: '94%',
//         // height: 130,
//         // borderRadius: 20,
//         // alignItems: 'center',
//         // elevation: 10, 
//         // shadowColor: 'black', 
//         // shadowOffset: {
//         //     width: 50,
//         //     height: 50,
//         // },
//         // shadowOpacity: 1,
//         // shadowRadius: 10,
//         // bottom: 10,
//         // marginTop: 10,
//         // borderLeftWidth:3,
//         // borderLeftColor:'#0070C0',
//         width: "90%",
//         alignSelf: "center"

//     },
//     topName: {
//         width: '90%',
//         flexDirection: 'row',
//         // borderBottomWidth:2,
//         borderBottomColor: '#00B0F0'
//     },
//     nameTxt: {
//         color: 'black',
//         fontSize: 13,
//         fontFamily: 'K2D-Bold',
//     },
//     border: {
//         backgroundColor: 'black',
//         width: '100%',
//         height: 1,
//     },
//     btn: {
//         width: '22%',
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     chart: {
//         // backgroundColor: 'orange',
//         width: '33%',
//         alignItems: 'center',
//         height: '100%',
//         justifyContent: 'center',
//         // marginTop: "0.5%"
//     },
//     topHeading: {
//         height: '25%',
//         marginLeft: 10

//     },
//     gauge: {
//         // position: 'absolute',
//         // width: 100,
//         // height: 160,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     gaugeText: {
//         // backgroundColor: 'transparent',
//         color: '#000',
//         // fontSize: 24,
//     },
// })



import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get("window");

const ChartCards = ({ name, firstTop, secTop, thirdTop, total, comp, unComp, onPressFirst, onPressSecond, onPressThird, percentageNum, pressChart }) => {
    const radius = width * 0.08;
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
        <View style={[styles.container]}>
            <View style={styles.card}>
                <View style={styles.topName}>
                    <View style={styles.nameContainer}>
                        <Text style={styles.nameTxt}>{name}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <Pressable style={styles.btn} onPress={onPressFirst}>
                        <Text style={styles.nameTxt}>{firstTop}</Text>
                        <Text style={styles.valueTxt}>{total}</Text>
                    </Pressable>

                    <Pressable style={styles.btn} onPress={onPressSecond}>
                        <Text style={styles.nameTxt}>{secTop}</Text>
                        <Text style={styles.valueTxt}>{comp}</Text>
                    </Pressable>

                    <Pressable style={styles.btn} onPress={onPressThird}>
                        <Text style={styles.nameTxt}>{thirdTop}</Text>
                        <Text style={styles.valueTxt}>{unComp}</Text>
                    </Pressable>

                    <Pressable style={styles.chart} onPress={pressChart}>
                        <Svg height={radius * 2 + strokeWidth} width={radius * 2.2 + strokeWidth}>
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
                        </Svg>
                        <Text style={styles.percentageTxt}>{percentage ? `${percentage}%` : `0%`}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

export default ChartCards;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        // marginTop: height * 0.006,
        paddingVertical: height * 0.006,
    },
    card: {
        width: "100%",
        backgroundColor: '#fff',
        // borderRadius: 12,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.04,
        shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.2,
        // shadowRadius: 3,
        // elevation: 5,
    },
    topName: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: height * 0.015,
       
    },
    nameContainer: {
        width: '70%',
    },
    nameTxt: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'K2D-Bold',
    },
    valueTxt: {
        color: 'black',
        // fontSize: width * 0.040,
        fontSize: 16,
        fontWeight: '400',
    },
    divider: {
        width: "110%",
        height: 1,
        backgroundColor: "gray",
        alignSelf: "center",
        marginBottom: height * 0.006,
        
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    btn: {
        width: '26%',
        alignItems: 'center',
    },
    chart: {

        width: '22%',
        alignItems: 'center',
        justifyContent: 'center',    
    },
    
    
    percentageTxt: {
        position: 'absolute',
        textAlign: 'center',
        color: 'black',
        fontSize: width * 0.035,
        fontWeight: 'bold',
    },
});
