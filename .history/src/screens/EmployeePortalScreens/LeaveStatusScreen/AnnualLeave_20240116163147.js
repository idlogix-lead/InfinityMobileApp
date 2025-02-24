import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'
import AnnualLeaveCard from '../../../components/LeaveStatusComponents/AnnualLeaveCard'

const AnnualLeave = () => {
  return (
    <View>
      <CustomHeader title='Annual Leave'/>
      <AnnualLeaveCard 
      Txt={'Client'}
      />
      <AnnualLeaveCard 
      Txt={'Client'}
      />
      <AnnualLeaveCard 
      Txt={'Client'}
      />
      <AnnualLeaveCard 
      Txt={'Client'}
      />
      <AnnualLeaveCard 
      Txt={'Client'}
      />
    </View>
  )
}

export default AnnualLeave

const styles = StyleSheet.create({})