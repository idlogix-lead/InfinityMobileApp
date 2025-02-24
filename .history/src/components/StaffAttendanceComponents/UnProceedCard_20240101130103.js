import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const UnProceedCard = ({date,liveRoll,CheckInTxt,CheckOutTxt,DepartmentTxt,SubDepartmentTxt,style}) => {
    return (
        <View style={[styles.cardContainer,{style}]}>
            <View style={styles.TopView}>
                <Text style={styles.dateTxt}>{date}</Text>
                <Text style={styles.liveRoll}>{liveRoll}</Text>
            </View>
            <View style={styles.bottomView}>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <AntDesign name='login' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Check In</Text>
                        <Text style={styles.dateTxt}>{CheckInTxt}</Text>
                    </View>
                </View>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <AntDesign name='logout' size={20} color='#0050C0' />
                    </View>
                    <View >
                        <Text style={styles.titleTxt}>Check Out</Text>
                        <Text style={styles.dateTxt}>{CheckOutTxt}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.bottomView}>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <FontAwesome name='building' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Department</Text>
                        <Text style={styles.dateTxt}>{DepartmentTxt}</Text>
                    </View>
                </View>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <FontAwesome name='building' size={20} color='#0050C0' />
                    </View>
                    <View >
                        <Text style={styles.titleTxt}>Sub-Department</Text>
                        <Text style={styles.dateTxt}>{SubDepartmentTxt}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default UnProceedCard

const styles = StyleSheet.create({
    cardContainer: {
        height: 200,
        width: '100%',
        backgroundColor: '#fff',
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 10,
        elevation: 3,
        borderLeftColor: '#00B0F0',
        borderLeftWidth: 4,
        paddingLeft: 10,
        paddingTop: 10,
    },
    TopView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 5,
        width:'90%',
    },
    liveRoll: {
        fontFamily:'K2D-Bold',
        color:'#000',
    },
    dateTxt: {
        color: '#000',
        fontFamily: 'K2D-Regular',
        width: 125,
    },
    bottomView: {
        flexDirection: 'row',
        padding: 10,
    },
    InnerContainer: {
        width: '50%',
        flexDirection: 'row',
    },
    titleTxt: {
        color: '#0050C0',
        fontFamily: 'K2D-Bold',
    },
})