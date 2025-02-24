import { ImageBackground, StyleSheet, Text, View, Dimensions, Image, TouchableOpacity, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import CardCompanyInformation from '../../components/CompanyInformationScreen/CardCompanyInformation';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height, width } = Dimensions.get('window');
const CompanyInformationScreen = ({ navigation }) => {
    const [clientName,setClientName] = useState('')
    const [organizationName,setOrganizationName] = useState('')
    const [roleName,setRoleName] = useState('')
    const [wareHouseName,setWareHouseName] = useState('')
    

    const getInfo = async () => {
        setClientName(await AsyncStorage.getItem('clientNameSelected'))
        setOrganizationName(await AsyncStorage.getItem('roleNameSelected'))
        setRoleName(await AsyncStorage.getItem('organizationNameSelected'))
        setWareHouseName(await AsyncStorage.getItem('warehouseNameSelected'))
    }
    console.log(clientName)

    useEffect(() => {
        const backAction = () => {
            navigation.goBack();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );
        getInfo()
        return () => backHandler.remove();
    }, [])

    return (
        <View style={{ flex: 1, alignItems: 'center' }}>
            {/* Top header */}
            <ImageBackground
                source={require('../../asserts/CompanyInformationScreen/Rectangle.png')}
                style={styles.header}>
                <View style={styles.imageCon}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image source={require('../../asserts/CompanyInformationScreen/Arrow.png')} />
                    </TouchableOpacity>
                    <Text style={styles.company}>Company information</Text>
                </View>
            </ImageBackground>

            <View style={styles.profileCon}>
                <Text style={styles.profileTxt}>Profile</Text>
            </View>

            <CardCompanyInformation
                topText="Client"
                secondtext={clientName}
                source={require('../../asserts/CompanyInformationScreen/Client.png')} text='Test Client' />

            <CardCompanyInformation
                topText="Role"
                secondtext={organizationName}
                source={require('../../asserts/CompanyInformationScreen/Male.png')} text='Test Client' />

            <CardCompanyInformation
                topText="Organization"
                secondtext={roleName}
                source={require('../../asserts/CompanyInformationScreen/Network.png')} text='Test Client' />


            <CardCompanyInformation
                topText="Warehouse"
                secondtext={wareHouseName}
                source={require('../../asserts/CompanyInformationScreen/Warehouse.png')} text='Test Client' />
        </View>
    )
}

export default CompanyInformationScreen

const styles = StyleSheet.create({
    header: {
        width: width,
        height: height / 8.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imageCon: {
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    company: {
        color: 'white',
        marginLeft: 10,
        fontSize: 24,
        fontFamily: 'K2D-SemiBold'
    },
    profileCon: {
        marginTop: 15,
        width: '80%'
    },
    profileTxt: {
        fontSize: 24,
        fontFamily: 'K2D-Regular',
        color: '#800000'
    }
})