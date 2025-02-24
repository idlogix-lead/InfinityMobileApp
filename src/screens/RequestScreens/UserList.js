import { StyleSheet, Text, View, ActivityIndicator, BackHandler } from 'react-native'
import React, { useEffect, useState } from 'react'
import TopHeader from '../../components/RequestScreenComponents/TopHeader';
import TopNavigationUser from '../../navigation/TopNavigation/TopNavigationUser';
import CustomHeader from '../../components/CustomHeader';

const UserList = ({ navigation }) => {
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* <TopHeader txt='User' onPress={() => navigation.goBack()} /> */}
            <CustomHeader title="User List"/>
            <TopNavigationUser />
        </View>

    )
}

export default UserList

const styles = StyleSheet.create({})