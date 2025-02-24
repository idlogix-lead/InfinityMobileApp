import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const RequestListHeader = () => {
    return (
        <View style={{alignItems:'center',marginTop:15}}>
            <View style={styles.container}>
                <Text style={styles.txt}>Due Date</Text>
                <Text style={styles.txt}>Task Name</Text>
                <Text style={styles.txt}>Detail</Text>
            </View>
        </View>
    )
}

export default RequestListHeader

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#800000',
        width: '90%',
        flexDirection:'row',
        justifyContent:'space-around',
        borderRadius:10,
    },
    txt:{
        color:'white',
        fontFamily:'K2D-Bold',
    }
})