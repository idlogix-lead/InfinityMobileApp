import { StyleSheet, Text, View, ActivityIndicator, ScrollView, FlatList, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import EvilIcons from 'react-native-vector-icons/dist/EvilIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';



const ItemList = ({ onPress, employName, name, startDate, endDate, status, onPressModal, statusArrow, onPressReport }) => {
    return (
        <View style={styles.itemCon}>
            {/* <View onPress={onPress} style={styles.item}>
                <View style={{ marginHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#00B0F0' }} >
                    <Text style={styles.nameTxt} >{employName}</Text>
                </View>
                <View style={{ flexDirection: 'row', height: 100, }}>

                    <View style={styles.singleItem}>
                        <Text style={styles.topText}>Task Name</Text>
                        <Text style={[styles.bottomTxt, { paddingLeft: 5 }]}>{name}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={styles.singleItem}>
                            <Text style={styles.topText}>Start Date</Text>
                            <Text style={styles.bottomTxt}>{startDate}</Text>
                        </View>
                        <View style={styles.singleItem}>
                            <Text style={styles.topText}>Due Date</Text>
                            <Text style={styles.bottomTxt}>{endDate}</Text>
                        </View>
                        <View style={styles.singleItem}>
                            <View >
                                <TouchableOpacity style={{ flexDirection: 'row', }} onPress={onPressModal}>
                                    <Text style={styles.topText}>Status</Text>
                                    <Image source={statusArrow} style={{ height: 20, width: 10, }} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.bottomTxt}>{status}</Text>
                        </View>
                    </ScrollView>
                </View>
                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                    <View style={{ width: '83%', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity onPress={onPressReport}>
                                <Text style={styles.report}>Report</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ flexDirection: 'row' }} onPress={onPress}>
                            <Text style={styles.details}>Details</Text>
                            <Image source={require('../../asserts/RequestAsserts/detailArrow.png')} style={{ height: 25, width: 20 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View> */}

            <View style={styles.taskStatusContainer}>
                <View style={styles.dotTaskContainer}>
                    <View style={styles.dotView}></View>
                    <Text style={{ color: "black", alignSelf: "center", paddingLeft: 3 }}>{name}</Text>
                </View>
                <View style={{
                    //  backgroundColor: "#90EE90", 
                    backgroundColor: "#AFE1AF",
                    padding: 3, borderRadius: 7
                }}>
                    <Text style={{ color: "black" }}>{status}</Text>
                </View>
            </View>

            {/*  start Date show  */}

            <View style={styles.dateContainer}>
                <Text style={{ color: "black", }}>Start Date:</Text>
                <EvilIcons name='calendar' size={18} color='#000' style={{ alignSelf: "center" }} />
                <Text style={{ color: "black" }}>{startDate}</Text>
            </View>
            {/* End Date Show */}
            <View style={styles.dateContainer}>
                <Text style={{ color: "black", }}>End Date:</Text>
                <EvilIcons name='calendar' size={18} color='#000' style={{ alignSelf: "center" }} />
                <Text style={{ color: "black" }}>{endDate}</Text>
            </View>

            {/* Detail View */}
            <View style={styles.btnContainer}>

                <TouchableOpacity style={styles.btnSty}>
                    <Text style={{ color: "black" }}> Report </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSty} onPress={onPress}>
                    <Text style={{ color: "black" }}> Details </Text>
                    <Entypo name='chevron-right' size={18} color='#000' style={{ alignSelf: "center" }} />

                </TouchableOpacity>

            </View>

            <View style={styles.lineStyle} />



        </View >
    )
}

export default ItemList
const styles = StyleSheet.create({
    itemCon: {
        // justifyContent: 'center',
        // alignItems: 'center',
        // marginTop: 10,
        // marginBottom: 10,
        flex: 1
    },
    taskStatusContainer: {
        width: "90%",
        justifyContent: "space-between",
        flexDirection: "row",
        alignSelf: "center",
        marginTop: "3%"
    },
    dotTaskContainer: {
        flexDirection: "row",
        backgroundColor: "#DEEFF5",
        padding: 3,
        borderRadius: 10,
        alignItems: "center"
    },
    dotView: {
        width: 8,
        height: 8,
        backgroundColor: "blue",
        borderRadius: 4,
        // marginRight: 1,
    },
    dateContainer: {
        width: "90%",
        alignSelf: "center",
        marginTop: "2%",
        flexDirection: "row"
    },
    btnSty: {
        backgroundColor: "#f5f5f5",
        padding: 3,
        borderRadius: 4,
        flexDirection: "row"
    },
    btnContainer: {
        alignSelf: "center",
        width: "90%",
        marginTop: "3%",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    lineStyle:{
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginVertical: 10,
        width: '100%',
    }

















    // item: {
    //     width: '93%',
    //     backgroundColor: 'white',
    //     borderRadius: 20,
    //     elevation: 8,
    //     borderLeftWidth: 3,
    //     borderLeftColor: '#0070C0',

    // },
    // singleItem: {
    //     width: '30%',
    //     alignItems: 'center',
    //     paddingLeft: 10
    // },
    // nameTxt: {
    //     color: '#0070C0',
    //     opacity: 0.7,
    //     fontSize: 14,
    //     fontFamily: 'K2D-Bold',
    // },
    // topText: {
    //     color: '#000000',
    //     opacity: 0.7,
    //     fontSize: 14,
    //     fontFamily: 'K2D-Bold',
    //     width: 90,
    // },
    // bottomTxt: {
    //     color: '#0070C0',
    //     fontSize: 14,
    //     fontFamily: 'K2D-Bold',
    //     width: 90,
    // },
    // pickerItem: {
    //     color: '#800000',
    //     fontFamily: "K2D-Regular",
    //     fontSize: 16
    // },
    // container: {
    //     flex: 1,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // },
    // modalContainer: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     backgroundColor: 'rgba(0,0,0,0.5)',
    //     flex: 1
    // },
    // modalView: {
    //     backgroundColor: '#800000',
    //     height: '40%',
    //     width: '90%',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     borderRadius: 15
    // },
    // txtContainer: {
    //     height: '15%',
    //     width: '80%',
    //     marginBottom: 10,
    //     alignItems: 'center',
    //     justifyContent: 'center'
    // },
    // txt: {
    //     color: 'white',
    //     fontSize: 20,
    //     fontFamily: 'K2D-Regular'
    // },
    // btn: {
    //     backgroundColor: 'white',
    //     height: '15%',
    //     width: '80%',
    //     marginBottom: 10,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     borderRadius: 20
    // },
    // txtBtn: {
    //     color: '#800000',
    //     fontSize: 20,
    //     fontFamily: 'K2D-Regular'
    // },
    // report: {
    //     color: 'black',
    //     fontSize: 14,
    //     fontFamily: 'K2D-SemiBold',
    //     marginLeft: 10,
    //     textDecorationLine: 'underline'
    // },
    // details: {
    //     color: '#0050C0',
    //     fontSize: 14,
    //     fontFamily: 'K2D-SemiBold',
    //     marginLeft: 10,
    // }
})