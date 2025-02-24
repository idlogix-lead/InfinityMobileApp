import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import CustomHeader from '../../components/CustomHeader'
import ApprovalCard from '../../components/ApprocalScreenComponents/ApprovalCard'

const ApprovalDetails = ({ route }) => {
    const { recordId, tableId } = route.params;

    

    const FetchDetails = async () => {
        try {
            const protocol = await AsyncStorage.getItem('protocol');
            const host = await AsyncStorage.getItem('host');
            const port = await AsyncStorage.getItem('port');
            const roleId = await AsyncStorage.getItem('roleId');
            const token = await AsyncStorage.getItem('token');

            let mobelname = 'C_payment';

            if (tableId === 335)
                mobelname = 'C_payment';
            else if (tableId === 318)
                mobelname = 'C_invoice';
            else if (tableId === 333)
                mobelname = 'C_InvoiceLine';
            else if (tableId === 702)
                mobelname = 'M_Requisition';
            else if (tableId === 703)
                mobelname = 'M_RequisitionLine';

            console.log(mobelname)

            const response = await fetch(`${protocol}://${host}:${port}/api/v1/models/${mobelname}?$filter=${mobelname}_ID eq ${recordId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log(response.formData,'success')
            } catch (error) {
                console.error('Error:', error);
            }
    
        };

        useEffect(() => {
            FetchDetails();
        }, [recordId, tableId]);

            return (
                <View style={{ flex: 1 }} >
                    <CustomHeader title={'Approval Details'} />

                    <View style={styles.TopBorderStyle}>
                        <View style={styles.TopLeftBorder}>
                        </View>
                        <View ></View>
                    </View>

                    <ApprovalCard />

                </View >
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