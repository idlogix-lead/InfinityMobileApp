import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const UnProceedCard = () => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.TopView}>
                <Text style={styles.dateTxt}>09-Jan-2023</Text>
                <View style={styles.liveRoll}>
                    <Text style={{ color: '#fff', fontFamily: 'K2D-Regular' }}>Present</Text>
                </View>
            </View>
            <View style={[styles.bottomView, { marginTop: 5 }]}>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <AntDesign name='login' size={20} color='#0050C0' />
                    </View>
                    <View>
                        <Text style={styles.titleTxt}>Check In</Text>
                        <Text style={styles.dateTxt}>Text</Text>
                    </View>
                </View>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <AntDesign name='logout' size={20} color='#0050C0' />
                    </View>
                    <View >
                        <Text style={styles.titleTxt}>Check Out</Text>
                        <Text style={styles.dateTxt}>Text</Text>
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
                        <Text style={styles.dateTxt}>Text</Text>
                    </View>
                </View>
                <View style={styles.InnerContainer}>
                    <View style={{ padding: 5, }}>
                        <FontAwesome name='building' size={20} color='#0050C0' />
                    </View>
                    <View >
                        <Text style={styles.titleTxt}>Sub-Department</Text>
                        <Text style={styles.dateTxt}>Text</Text>
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
        width: '90%',
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
        backgroundColor:'red',
        padding:5,
    },
    liveRoll: {
        backgroundColor: '#00B0F0',
        justifyContent: 'center',
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
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