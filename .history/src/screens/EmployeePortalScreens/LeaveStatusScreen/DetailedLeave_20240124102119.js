import { StyleSheet, Text, View } from 'react-native'
import React, { useState, useEffect } from 'react'
import CustomHeader from '../../../components/CustomHeader'

const DetailedLeave = ({ route }) => {

  const { record } = route.params;

  // console.log(record, 'ff')

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title={'Leave Detail'} />

      <View style={styles.MainContainer}>

        <View style={styles.RowContainer}>
          <View style={styles.RowBox}>
            <Text style={styles.TopTxt}>Start Date</Text>
            <View style={styles.ViewContainer}>
              <Text style={styles.InsideTxt}>{record.StartDate}</Text>
            </View>
          </View>

          <View style={styles.RowBox}>
            <Text style={styles.TopTxt}>End Date</Text>
            <View style={styles.ViewContainer}>
              <Text style={styles.InsideTxt}>{record.EndDate}</Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.TopTxt}>Partner Name</Text>
          <View style={styles.ViewContainer}>
            <Text style={styles.InsideTxt}>{record?.C_BPartner_ID?.identifier}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.TopTxt}>Client</Text>
          <View style={styles.ViewContainer}>
            <Text style={styles.InsideTxt}>{record?.AD_Client_ID?.identifier}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.TopTxt}>Organization</Text>
          <View style={styles.ViewContainer}>
            <Text style={styles.InsideTxt}>{record?.AD_Org_ID?.identifier}</Text>
          </View>
        </View>


        <View>
          <Text style={{ color: '#000' }}>{record.Description}</Text>
          <Text style={{ color: '#000' }}>{record.StartDate}</Text>
          <Text style={{ color: '#000' }}>{record.EndDate}</Text>
          {/* <Text style={{ color: '#000' }}>{record?.AD_Client_ID?.identifier}</Text> */}
          {/* <Text style={{ color: '#000' }}>{record?.AD_Org_ID?.identifier}</Text> */}
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
  ViewContainer: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#00B0F0',
  },
  TopTxt: {
    color: '#0070C0',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    marginTop: 10
  },
  InsideTxt: {
    color: '#000',
    fontFamily: 'K2D-Regular',
    fontSize: 16
  },
  RowContainer: {
    flexDirection: 'row',
    // backgroundColor:'green',
    justifyContent:'space-between',
  },
  RowBox: {
    // backgroundColor: 'red',
    width: '47%',
    
  },
})