import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../components/CustomHeader'
import PortalCards from '../../components/EmployeePortalComponents/PortalCards'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6'

const EmployeePortal = ({navigation}) => {
  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title='Employee Portal' />
      <View>
        <PortalCards
          text='Salary Slip'
          icon={<Ionicons name='person' size={25} color="#000" />}
        />
        <PortalCards
          text='Attendence Status'
          icon={<FontAwesome6 name='users' size={25} color="#000" />}
        />
        <PortalCards
          text='Staff Attendence'
          icon={<Ionicons name='person' size={25} color="#000" />}
        />
        <PortalCards
          text='Leave Status'
          icon={<Ionicons name='person' size={25} color="#000" />}
        />
        <PortalCards
          text='Score Card'
          icon={<Ionicons name='person' size={25} color="#000" />}
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