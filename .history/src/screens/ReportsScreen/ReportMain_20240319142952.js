import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import PortalCards from '../../components/EmployeePortalComponents/PortalCards'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'


const ReportMain = () => {
  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Reports'}/>
      <PortalCards
          text='Liquidity'
          icon={<FontAwesome6 name='hand-holding-dollar' size={25} color="#0050C0" />}
        />
      <PortalCards
          text='Profitability'
          icon={<FontAwesome6 name='sack-dollar' size={25} color="#0050C0" />}
        />
      <PortalCards
          text='Financial Position'
          icon={<Ionicons name='receipt-outline' size={25} color="#0050C0" />}
        />
    </View>
  )
}

export default ReportMain

const styles = StyleSheet.create({})