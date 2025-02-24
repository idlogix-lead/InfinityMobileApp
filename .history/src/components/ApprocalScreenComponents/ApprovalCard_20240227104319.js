import { StyleSheet, Text, View, ScrollView } from 'react-native'
import React from 'react'

const ApprovalCard = () => {
    return (
        <ScrollView >
            <View style={styles.SrNo}>
                <Text style={styles.TopTxt}>Sr.#</Text>
            </View>

        </ScrollView>
    )
}

export default ApprovalCard

const styles = StyleSheet.create({
    SrNo:{

    },
    TopTxt:{
        fontFamily:'K2D-Regular',
        color:'#000',
    },
})