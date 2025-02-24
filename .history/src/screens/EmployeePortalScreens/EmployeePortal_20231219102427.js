import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import PortalCards from '../../components/EmployeePortalComponents/PortalCards'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const EmployeePortal = ({navigation}) => {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title='Employee Portal' />
      <View>
        <PortalCards
          text='Salary Slip'
          icon={<Ionicons name='receipt-outline' size={25} color="#000" />}
        />
        <PortalCards
          text='Attendence Status'
          icon={<FontAwesome6 name='users' size={25} color="#000" />}
        />
        <PortalCards
          text='Staff Attendence'
          icon={<MaterialCommunityIcons name='list-status' size={25} color="#000" />}
        />
        <PortalCards
          text='Leave Status'
          icon={<MaterialCommunityIcons name='calendar-alert' size={25} color="#000" />}
        />
        <PortalCards
          text='Score Card'
          icon={<MaterialCommunityIcons name='card-bulleted' size={25} color="#000" />}
        />
        <PortalCards
          onPress={()=>navigation.navigate('EmployeeProfileTopNavigation')}
          text='Profile'
          icon={<Ionicons name='person-sharp' size={25} color="#000" />}
        />
      </View>

    </View>
  )
}

export default EmployeePortal

const styles = StyleSheet.create({
})