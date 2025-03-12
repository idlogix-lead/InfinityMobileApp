import { StyleSheet, Text, View, ActivityIndicator, ScrollView, FlatList, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import EvilIcons from 'react-native-vector-icons/dist/EvilIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import NameContainer from '../HomeScreenComponents/NameContainer';



const ItemList = ({
    onPress,
    employName,
    name,
    startDate,
    endDate,
    status,
    onPressModal,
    statusArrow,
    onPressReport,
    Name,
    ProjectName,
    BusinessName,
    User_Contact,
    campaignName,
    Assets,
    Invoice,
    order,
    payment,
    shipment,
    RMA

}) => {

    return (
        <View style={styles.itemCon}>
            <View style={styles.taskStatusContainer}>
                <View style={styles.dotTaskContainer}>
                    <View style={styles.dotView}></View>
                    <Text style={{ color: "#002E62", alignSelf: "center", paddingLeft: 3, fontWeight: 600 }}>{name}</Text>
                </View>
                <View style={{
                    //  backgroundColor: "#90EE90", 
                    // backgroundColor: "#AFE1AF",
                    backgroundColor: "#ECECEC",
                    padding: 3,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: 7,
                    elevation: 1,
                    shadowColor: "F0F0F0"
                }}>
                    <Text style={{ color: "black", alignSelf: "center" }}>{status}</Text>
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

            {/* All data Display in screen */}

            <ScrollView horizontal style={{ width: "95%", alignSelf: "center", }}>
                {
                    Name &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Product:</Text>
                            <Text style={styles.textStyle}>{Name}</Text>
                        </View>
                    </View>
                }
                {
                    ProjectName &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Project:</Text>
                            <Text style={styles.textStyle}>{ProjectName}</Text>
                        </View>
                    </View>

                }
                {
                    BusinessName &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Business Name:</Text>
                            <Text style={styles.textStyle}>{BusinessName}</Text>
                        </View>
                    </View>
                }
                {
                    User_Contact &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>User Contact:</Text>
                            <Text style={styles.textStyle}>{User_Contact}</Text>
                        </View>
                    </View>

                }
                {
                    campaignName &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Campaign:</Text>
                            <Text style={styles.textStyle}>{campaignName}</Text>
                        </View>
                    </View>

                }
                {
                    Assets &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Assets:</Text>
                            <Text style={styles.textStyle}>{Assets}</Text>
                        </View>
                    </View>
                }

                {
                    Invoice &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}> Invoice:</Text>
                            <Text style={styles.textStyle}>{ Invoice}</Text>
                        </View>
                    </View>

                }
                {
                    order &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>order:</Text>
                            <Text style={styles.textStyle}>{order}</Text>
                        </View>
                    </View>
                }

                {
                    payment &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}> payment:</Text>
                            <Text style={styles.textStyle}>{ payment}</Text>
                        </View>
                    </View>

                }
                {
                    shipment &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>shipment:</Text>
                            <Text style={styles.textStyle}>{shipment}</Text>
                        </View>
                    </View>
                }

                {
                    RMA &&
                    <View style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>RMA:</Text>
                            <Text style={styles.textStyle}>{RMA}</Text>
                        </View>
                    </View>
                }
            </ScrollView>

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
        // backgroundColor: "#DEEFF5",
        // backgroundColor: "#089080",
        padding: 3,
        borderRadius: 10,
        alignItems: "center"
    },
    dotView: {
        width: 8,
        height: 8,
        // backgroundColor: "blue",
        // backgroundColor: "#089080",
        backgroundColor: '#00B0F0',
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
    lineStyle: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginVertical: 10,
        width: '100%',
    },
    NameContainer: {
        // backgroundColor: "gray",
         backgroundColor: "#002E62",
        marginRight: 2,
        borderRadius: 10,
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
        marginTop:'0.2%'

    },
    lableStyle: { color: "#fff", fontSize: 14, },
    textStyle: { color: "#fff", fontSize: 12, alignSelf: "center" }

















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