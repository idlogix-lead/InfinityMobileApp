import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'

const DetailedLeave = ({ route }) => {

  const { record } = route.params;

  // console.log(record, 'ff')

  return (
    <View style={{flex:1}}>
      <CustomHeader title={'Leave Detail'} />

      <View style={styles.MainContainer}>

        <View >
          <Text>Partner Name</Text>
          <View style={styles.ViewContainer}>
            <Text style={{ color: '#000' }}>{record?.C_BPartner_ID?.identifier}</Text>
          </View>
        </View>


        <View>
          <Text style={{ color: '#000' }}>{record.Description}</Text>
          <Text style={{ color: '#000' }}>{record.StartDate}</Text>
          <Text style={{ color: '#000' }}>{record.EndDate}</Text>
          <Text style={{ color: '#000' }}>{record?.AD_Client_ID?.identifier}</Text>
          <Text style={{ color: '#000' }}>{record?.AD_Org_ID?.identifier}</Text>
          <Text style={{ color: '#000' }}>{record?.C_DocTypeTarget_ID?.identifier}</Text>
          <Text style={{ color: '#000' }}>{record?.C_DocType_ID?.identifier}</Text>
          <Text style={{ color: '#000' }}>{record?.C_Year_ID?.identifier}</Text>
          <Text style={{ color: '#000' }}>{record?.DocStatus?.identifier}</Text>
          <Text style={{ color: '#000' }}>{record?.HR_LevTypes_ID?.identifier}</Text>
        </View>
      </View>
    </View>
  )
}

export default DetailedLeave

const styles = StyleSheet.create({
  MainContainer: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    padding: 5,
  },
  ViewContainer:{
    backgroundColor:'red',
    padding:10,
    borderRadius:10,
    borderWidth:2,
    borderColor:'#00B0F0',
  },
})