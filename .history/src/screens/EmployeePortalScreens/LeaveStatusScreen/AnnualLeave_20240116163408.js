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
      Txt={'Organization'}
      />
      <AnnualLeaveCard 
      Txt={'Bussiness Partner'}
      />
      <AnnualLeaveCard 
      Txt={'Start Date'}
      />
      <AnnualLeaveCard 
      Txt={'End Date'}
      />
      <AnnualLeaveCard 
      Txt={'Leave Type'}
      />
      <AnnualLeaveCard 
      Txt={'Document Status'}
      />
      <AnnualLeaveCard 
      Txt={'End Date'}
      />
      <AnnualLeaveCard 
      Txt={'End Date'}
      />
      <AnnualLeaveCard 
      Txt={'End Date'}
      />
      <AnnualLeaveCard 
      Txt={'End Date'}
      />
    </View>
  )
}

export default AnnualLeave

const styles = StyleSheet.create({})