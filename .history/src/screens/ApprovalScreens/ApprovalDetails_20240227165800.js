import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import ApprovalCard from '../../components/ApprocalScreenComponents/ApprovalCard'

const ApprovalDetails = () => {


//     let mobelname = 'C_payment';

//     if(tableId=335)
//     mobelname = 'C_payment';
// else if(tableId=336)
// mobelname = 'C_invoice';
    
// else if(tableId=337)
// mobelname = 'C_return';

//     const response = await fetch(`${protocol}://${host}:${port}/api/v1/models/${mobelname}?$filter=${mobelname}_ID eq ${record_id}`, {
          
    return (
        <View style={{ flex: 1 }}>
            <CustomHeader title={'Approval Details'} />

            <View style={styles.TopBorderStyle}>
                <View style={styles.TopLeftBorder}>
                </View>
                <View ></View>
            </View>

            <ApprovalCard/>

        </View>
    )
}

export default ApprovalDetails

const styles = StyleSheet.create({
    TopBorderStyle: {
        borderWidth: 0.5,
        borderColor: 'gray',
        marginTop: 10,
        height: '10%',
        width: '98%',
        alignSelf: 'center',
    },
    TopLeftBorder: {
        width: '49%',
        borderRightWidth: 0.5,
        borderLeftColor: 'gray',
        height: '100%',
    },
    
})