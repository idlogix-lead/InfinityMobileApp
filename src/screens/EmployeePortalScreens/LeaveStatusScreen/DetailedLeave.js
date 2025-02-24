import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CustomHeader from '../../../components/CustomHeader'

const DetailedLeave = ({ route }) => {

  const { record } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader title={'Leave Detail'} />

      <View style={styles.MainContainer}>

        <View>
          <Text style={styles.TopTxt}>Partner Name</Text>
          <View style={styles.ViewContainer}>
            <Text style={styles.InsideTxt}>{record?.C_BPartner_ID?.identifier}</Text>
          </View>
        </View>

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

        <View style={styles.RowContainer}>
          <View style={styles.RowBox}>
            <Text style={styles.TopTxt}>Year</Text>
            <View style={styles.ViewContainer}>
              <Text style={styles.InsideTxt}>{record?.C_Year_ID?.identifier}</Text>
            </View>
          </View>

          <View style={styles.RowBox}>
            <Text style={styles.TopTxt}>Document Status</Text>
            <View style={styles.ViewContainer}>
              <Text style={styles.InsideTxt}>{record?.DocStatus?.identifier}</Text>
            </View>
          </View>
        </View>

        <View style={styles.RowContainer}>
          <View style={styles.RowBox}>
            <Text style={styles.TopTxt}>Document Target</Text>
            <View style={styles.ViewContainer}>
              <Text style={styles.InsideTxt}>{record?.C_DocTypeTarget_ID?.identifier}</Text>
            </View>
          </View>

          <View style={styles.RowBox}>
            <Text style={styles.TopTxt}>Document Type</Text>
            <View style={styles.ViewContainer}>
              <Text style={styles.InsideTxt}>{record?.C_DocType_ID?.identifier}</Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.TopTxt}>Leave Type</Text>
          <View style={styles.ViewContainer}>
            <Text style={styles.InsideTxt}>{record?.HR_LevTypes_ID?.identifier}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.TopTxt}>Description</Text>
          <View style={styles.ViewContainer}>
            <Text style={styles.InsideTxt}>{record.Description ? record.Description : 'null'}</Text>
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
      </View>
    </View>
  )
}

export default DetailedLeave

const styles = StyleSheet.create({
  MainContainer: {
    width: '90%',
    alignSelf: 'center',
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
    justifyContent: 'space-between',
  },
  RowBox: {
    width: '47%',

  },
})