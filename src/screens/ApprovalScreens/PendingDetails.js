import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'
import PendingDetailHeader from '../../components/ApprocalScreenComponents/PendingDetailHeader'
import PaymentDetails from './PaymentDetails';

const PendingDetails = ({ route, navigation }) => {
    const { array, str } = route.params;
    console.log('item from pending details', array, str)


    const formattedData = array.map(item => {
        const label = Object.keys(item)[0];
        const value = item[label];
        return { label, value };
    });

    return (
        <View style={styles.container}>
            <PendingDetailHeader onPressBack={() => navigation.goBack()} />
            <FlatList
                data={formattedData}
                renderItem={({ item }) => {
                    return <PaymentDetails code={item.label} name={item.value} />

                }}
            />
        </View>
    )
}

export default PendingDetails

const styles = StyleSheet.create({
    topTab: {
        flexDirection: 'row',
        height: 35,
        width: '80%',
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
    },
    topTxt: {
        color: '#800000',
        fontSize: 16,
        fontFamily: 'K2D-Medium'
    }
})