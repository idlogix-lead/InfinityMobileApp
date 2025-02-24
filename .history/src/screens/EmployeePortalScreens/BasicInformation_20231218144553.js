import { StyleSheet, Text, View,ScrollView } from 'react-native'
import React,{useEffect,useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BasicInformation = () => {

  const [userData, setUserData] = useState({
    guardianName: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    religion: '',
    nationalCode: '',
    dateCnicIssue: '',
    dateCnicExpire: '',
    maritalStatus: '',
    licCode: '',
    dateLicExpire: '',
    hrDepartmentId: '',
    hrJobId: '',
    startDate: '',
    dateOfConfirmation: '',
    endDate: '',
  });

  console.log(userData,'d')
  const getBasicInfo = async () => {
    const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const Id = await AsyncStorage.getItem("userId")
    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_employee_v?$filter=ad_user_id eq ${Id}`,
      {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
         const userRecord = response.data.records[0];

      // Update the state with the retrieved data
      setUserData({
        guardianName: userRecord.records[0].Degree_Title,
        gender: userRecord.records[1].Degree_Title,
        dateOfBirth: userRecord.records[2].Degree_Title,
        bloodGroup: userRecord.records[3].Degree_Title,
        religion: userRecord.records[4].Degree_Title,
        nationalCode: userRecord.records[5].Degree_Title,
        dateCnicIssue: userRecord.records[6].Degree_Title,
        dateCnicExpire: userRecord.records[7].Degree_Title,
        maritalStatus: userRecord.records[8].Degree_Title,
        licCode: userRecord.records[9].Degree_Title,
        dateLicExpire: userRecord.records[10].Degree_Title,
        hrDepartmentId: userRecord.records[11].Degree_Title,
        hrJobId: userRecord.records[12].Degree_Title,
        startDate: userRecord.records[13].Degree_Title,
        dateOfConfirmation: userRecord.records[14].Degree_Title,
        endDate: userRecord.records[15].Degree_Title,
      });
    } catch (error) {
      console.log('Error', error);
    }
  };
  

  useEffect(()=>{
    getBasicInfo();
  },[])
  
  return (
    <ScrollView>
    <View style={{flex:1}}>
        <Text style={styles.TextHeading}>Personal Information</Text>

        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>{userData.guardianName}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Gender</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Date of Birth</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Blood_Group</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Religion</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>

        <Text style={styles.TextHeading}>Company Information</Text>

        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>NationalCode</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Date_Cnicissue </Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Date_Cnicexpire</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>MaritalStatus</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>LICCode </Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Date_LicExpire</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>HR_Department_ID</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>HR_Job_ID</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Start Date</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>Date-of-Confirmation</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>

          </View>
          <View>
            <Text style={styles.TextTop}>End Date</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>

    </View>
    </ScrollView>
  )
}

export default BasicInformation

const styles = StyleSheet.create({
  TextHeading:{
    color:'#000',
    fontFamily:'K2D-Bold',
    fontSize:20,
    padding:10,
  },
  ContainerView:{
    flexDirection:'row',
    padding:10,
    width:'90%',
    alignSelf:'center',
    // marginTop:5,
  },
  IconView:{
    width:'20%',
    justifyContent:'center',
    alignItems:'center',
  },
  TextTop:{
    color:'#000',
    fontFamily:'K2D-Regular',
    fontSize:16
  },
  TextBottom:{
    color:'#000',
    fontFamily:'K2D-Bold',
    fontSize:16
  },
})