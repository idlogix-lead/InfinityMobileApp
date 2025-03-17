import { StyleSheet, Text, View, ActivityIndicator, ScrollView, FlatList, TouchableOpacity, Image, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import EvilIcons from 'react-native-vector-icons/dist/EvilIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import Octicons from 'react-native-vector-icons/dist/Octicons';
import FontAwesome5 from 'react-native-vector-icons/dist/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/dist/SimpleLineIcons';
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
    RMA,
    statusBorderColor,
    onPressMain

}) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handlePress = (item) => {
        setSelectedItem(item);
        setModalVisible(true);
    };


    return (
        <TouchableOpacity style={[styles.itemCon, { borderLeftColor: statusBorderColor, }]} onPress={onPressMain}>
            <View style={styles.taskStatusContainer}>
                <View style={styles.dotTaskContainer}>
                    <View style={styles.dotView}></View>
                    <Text style={{ color: "#002E62", alignSelf: "center", paddingLeft: 3, fontWeight: 600 }}>{name}</Text>
                </View>
                {/* <View style={{
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
                </View> */}
            </View>

            {/*  start Date show  */}
            <View style={{ flexDirection: "row", width: "90%", alignSelf: "center", }}>

                <View style={styles.dateContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <EvilIcons name='calendar' size={22} color='#000' />
                        <Text style={{ color: "black", fontSize: 12 }}>Start Date:</Text>
                    </View>
                    <Text style={{ color: "black", paddingLeft: "6%" }}>{startDate}</Text>
                </View>
                {/* End Date Show */}
                <View style={[styles.dateContainer, { paddingLeft: "5%" }]}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <EvilIcons name='calendar' size={22} color='#000' />
                        <Text style={{ color: "black", fontSize: 12 }}>End Date:</Text>

                    </View>
                    <Text style={{ color: "black", paddingLeft: "6%" }}>{endDate}</Text>
                </View>
            </View>
            {/* All data Display in screen */}

            {/* <ScrollView horizontal style={{ width: "95%", alignSelf: "center", }} showsHorizontalScrollIndicator={false}>
                {
                    Name &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}>
                        <SimpleLineIcons name='social-dropbox' size={14} color='#FFF' />
                            <Text style={styles.lableStyle}>Product:</Text>
                        </View>
                            <Text style={styles.textStyle}>{Name}</Text>
                        </View>
                    </TouchableOpacity>
                }
                {
                    ProjectName &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View style={{flexDirection:"row", alignItems:"center"}}>
                        <Octicons name='project' size={14} color='#FFF' />
                            <Text style={styles.lableStyle}>Project:</Text>
                        </View>
                        <Text style={styles.textStyle}>{ProjectName}</Text>
                    </TouchableOpacity>

                }
                {
                    BusinessName &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Business Name:</Text>
                            <Text style={styles.textStyle}>{BusinessName}</Text>
                        </View>
                    </TouchableOpacity>
                }
                {
                    User_Contact &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>User Contact:</Text>
                            <Text style={styles.textStyle}>{User_Contact}</Text>
                        </View>
                    </TouchableOpacity>

                }
                {
                    campaignName &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}> 
                        <Entypo name='megaphone' size={14} color='#FFF' />
                            <Text style={styles.lableStyle}>Campaign:</Text>
                        </View>
                            <Text style={styles.textStyle}>{campaignName}</Text>
                        </View>
                    </TouchableOpacity>

                }
                {
                    Assets &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Assets:</Text>
                            <Text style={styles.textStyle}>{Assets}</Text>
                        </View>
                    </TouchableOpacity>
                }

                {
                    Invoice &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}> 
                            <FontAwesome5 name='file-invoice' size={14} color='#FFF' />
                            <Text style={styles.lableStyle}> Invoice:</Text>
                        </View>
                            <Text style={styles.textStyle}>{Invoice}</Text>
                        </View>
                    </TouchableOpacity>

                }
                {
                    order &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>order:</Text>
                            <Text style={styles.textStyle}>{order}</Text>
                        </View>
                    </TouchableOpacity>
                }

                {
                    payment &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}>
                        <MaterialIcons name='payments' size={14} color='#FFF' />
                            <Text style={styles.lableStyle}> payment:</Text>
                            </View>
                            <Text style={styles.textStyle}>{payment}</Text>
                        </View>
                    </TouchableOpacity>

                }
                {
                    shipment &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                        <View style={{flexDirection:"row", alignItems:"center"}}> 
                        <FontAwesome5 name='shipping-fast' size={14} color='#FFF' />
                            <Text style={styles.lableStyle}>shipment:</Text>
                            </View>
                            <Text style={styles.textStyle}>{shipment}</Text>
                        </View>
                    </TouchableOpacity>
                }

                {
                    RMA &&
                    <TouchableOpacity style={styles.NameContainer}>
                        <View>
                            <Text style={styles.lableStyle}>Sale return:</Text>
                            <Text style={styles.textStyle}>{RMA}</Text>
                        </View>
                    </TouchableOpacity>
                }
            </ScrollView> */}

            <ScrollView horizontal style={{ width: "95%", alignSelf: "center" }} showsHorizontalScrollIndicator={false}>
                {Name && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Product", value: Name })}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <SimpleLineIcons name="social-dropbox" size={14} color="#FFF" />
                                <Text style={styles.lableStyle}>Product:</Text>
                            </View>
                            <Text style={styles.textStyle}>{Name}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {ProjectName && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Project", value: ProjectName })}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <Octicons name="project" size={14} color="#FFF" />
                            <Text style={styles.lableStyle}>Project:</Text>
                        </View>
                        <Text style={styles.textStyle}>{ProjectName}</Text>
                    </TouchableOpacity>
                )}

                {BusinessName && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Business Name", value: BusinessName })}>
                        <View>
                            <Text style={styles.lableStyle}>Business Name:</Text>
                            <Text style={styles.textStyle}>{BusinessName}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {User_Contact && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "User Contact", value: User_Contact })}>
                        <View>
                            <Text style={styles.lableStyle}>User Contact:</Text>
                            <Text style={styles.textStyle}>{User_Contact}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {campaignName && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Campaign", value: campaignName })}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Entypo name="megaphone" size={14} color="#FFF" />
                                <Text style={styles.lableStyle}>Campaign:</Text>
                            </View>
                            <Text style={styles.textStyle}>{campaignName}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {Assets && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Assets", value: Assets })}>
                        <View>
                            <Text style={styles.lableStyle}>Assets:</Text>
                            <Text style={styles.textStyle}>{Assets}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {Invoice && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Invoice", value: Invoice })}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FontAwesome5 name="file-invoice" size={14} color="#FFF" />
                                <Text style={styles.lableStyle}>Invoice:</Text>
                            </View>
                            <Text style={styles.textStyle}>{Invoice}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {order && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Order", value: order })}>
                        <View>
                            <Text style={styles.lableStyle}>Order:</Text>
                            <Text style={styles.textStyle}>{order}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {payment && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Payment", value: payment })}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <MaterialIcons name="payments" size={14} color="#FFF" />
                                <Text style={styles.lableStyle}>Payment:</Text>
                            </View>
                            <Text style={styles.textStyle}>{payment}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {shipment && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Shipment", value: shipment })}>
                        <View>
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <FontAwesome5 name="shipping-fast" size={14} color="#FFF" />
                                <Text style={styles.lableStyle}>Shipment:</Text>
                            </View>
                            <Text style={styles.textStyle}>{shipment}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {RMA && (
                    <TouchableOpacity style={styles.NameContainer} onPress={() => handlePress({ title: "Sale Return", value: RMA })}>
                        <View>
                            <Text style={styles.lableStyle}>Sale Return:</Text>
                            <Text style={styles.textStyle}>{RMA}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        {/* <Text style={styles.txt}>Set Status</Text> */}

                        <Text style={styles.txt}>{selectedItem?.title}</Text>
                        <Text style={styles.txt}>{selectedItem?.value}</Text>

                        <TouchableOpacity onPress={() =>  setModalVisible(false)} style={styles.btn}>
                            <Text style={styles.txtBtn}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Detail View */}
            <View style={styles.btnContainer}>

                {/* <TouchableOpacity style={styles.btnSty}>
                    <Text style={{ color: "black" }}> Report </Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={styles.btnSty} onPress={onPress}>
                    <Text style={{ color: "black" }}> Details </Text>
                    <Entypo name='chevron-right' size={18} color='#000' style={{ alignSelf: "center" }} />

                </TouchableOpacity>

            </View>

            <View style={styles.lineStyle} />



        </TouchableOpacity >
    )
}

export default ItemList
const styles = StyleSheet.create({
    itemCon: {
        // justifyContent: 'center',
        // alignItems: 'center',
        // marginTop: 10,
        // marginBottom: 10,
        // flex: 1,
        // backgroundColor: "#FFF",
        // padding: 10,
        marginVertical: 5,
        borderRadius: 7,
        borderLeftWidth: 10,  // Left border width



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
        // width: "90%",
        // alignSelf: "center",
        marginTop: "2%",
        // flexDirection: "row"
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
        // justifyContent: "space-between",
        justifyContent: "flex-end",
        marginBottom: "1%"
    },
    lineStyle: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        // marginVertical: 10,
        // marginVertical: 2,
        width: '100%',

    },
    NameContainer: {
        // backgroundColor: "gray",
        backgroundColor: "#002E62",
        marginRight: 2,
        borderRadius: 10,
        padding: 4,
        justifyContent: "center",
        // alignItems: "center",
        marginTop: '0.2%'

    },
    lableStyle: { color: "#fff", fontSize: 14, },
    textStyle: { color: "#fff", fontSize: 12, alignSelf: "center" },
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1
      },
      modalView: {
        // backgroundColor: '#00B0F0',
        backgroundColor: '#002E62',
        height: '50%',
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
      },
      modalViewDue: {
        backgroundColor: '#00B0F0',
        height: '40%',
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
      },
      modalViewPrior: {
        backgroundColor: '#00B0F0',
        height: '55%',
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
      },
      modalViewAssigned: {
        backgroundColor: '#00B0F0',
        height: '50%',
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15
      },
      txtContainer: {
        height: '12%',
        width: '80%',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center'
      },
      txt: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'K2D-Regular'
      },
      btn: {
        backgroundColor: 'white',
        height: '12%',
        width: '80%',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20
      },
      txtBtn: {
        color: '#00B0F0',
        fontSize: 20,
        fontFamily: 'K2D-Regular'
      },

















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