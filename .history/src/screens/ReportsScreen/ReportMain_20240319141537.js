import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import PortalCards from '../../components/EmployeePortalComponents/PortalCards'
import Ionicons from 'react-native-vector-icons/Ionicons'


const ReportMain = () => {
  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Reports'}/>
      <PortalCards
          text='Liquidity'
          icon={<Ionicons name='receipt-outline' size={25} color="#0050C0" />}
        />
      <PortalCards
          text='Salary Slip'
          icon={<Ionicons name='receipt-outline' size={25} color="#0050C0" />}
        />
      <PortalCards
          text='Salary Slip'
          icon={<Ionicons name='receipt-outline' size={25} color="#0050C0" />}
        />
    </View>
  )
}

export default ReportMain

const styles = StyleSheet.create({})