import { StyleSheet, Text, View,ScrollView } from 'react-native'
import React,{useEffect,useState} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BasicInformation = () => {
  const size = 30; 
  const color = '#0050C0'; 

  const [employeeData, setEmployeeData] = useState({});

  const getBasicInfo = async () => {
    const token = await AsyncStorage.getItem('token')
        const protocol = await AsyncStorage.getItem('protocol')
        const host = await AsyncStorage.getItem('host')
        const port = await AsyncStorage.getItem('port')
        const Id = await AsyncStorage.getItem("userId")
    try {
      const response = await axios.get(`${protocol}://${host}:${port}/api/v1/models/hr_employee_v?$filter=ad_user_id eq ${Id}`,
      {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    setEmployeeData(response.data.records[0]);
    // console.log(response.data.records[0],'mmm');
    } catch (error) {
      console.log('Error', error)
    }
  }

  useEffect(()=>{
    getBasicInfo();
  },[])
  
  return (
    <ScrollView>
    <View style={{flex:1}}>
        <Text style={styles.TextHeading}>Personal Information</Text>

        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
            <MaterialIcons name='person' size={size} color={color}/>
          </View>
          <View>
            <Text style={styles.TextTop}>Gaurdian Name</Text>
            <Text style={styles.TextBottom}>{employeeData.Father_Name}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name='transgender' size={size} color={color}/>
          </View>
          <View>
            <Text style={styles.TextTop}>Gender</Text>
            <Text style={styles.TextBottom}>{employeeData?.Gender?.identifier}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
            <MaterialCommunityIcons name='calendar-account' size={size} color={color}/>
          </View>
          <View>
            <Text style={styles.TextTop}>Date of Birth</Text>
            <Text style={styles.TextBottom}>{employeeData.Date_Birth}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name='bloodtype' size={size} color={color}/>
          </View>
          <View>
            <Text style={styles.TextTop}>Blood_Group</Text>
            <Text style={styles.TextBottom}>{employeeData?.Blood_Group?.identifier}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialCommunityIcons name='star-david' size={size} color={color}/>
          </View>
          <View>
            <Text style={styles.TextTop}>Religion</Text>
            <Text style={styles.TextBottom}>{employeeData?.Religion?.identifier}</Text>
          </View>
        </View>

        <Text style={styles.TextHeading}>Company Information</Text>

        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name="fingerprint" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>NationalCode</Text>
            <Text style={styles.TextBottom}>{employeeData.NationalCode}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialCommunityIcons name="calendar" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>Date_Cnicissue </Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name="event" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>Date_Cnicexpire</Text>
            <Text style={styles.TextBottom}>{employeeData.Date_Cnicexpire}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialCommunityIcons name="heart" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>MaritalStatus</Text>
            <Text style={styles.TextBottom}>{employeeData?.MaritalStatus?.identifier}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name="assignment" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>LICCode </Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialCommunityIcons name="calendar" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>Date_LicExpire</Text>
            <Text style={styles.TextBottom}></Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name="business" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>HR_Department_ID</Text>
            <Text style={styles.TextBottom}>{employeeData?.HR_Department_ID?.identifier}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialIcons name="work" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>HR_Job_ID</Text>
            <Text style={styles.TextBottom}>{employeeData?.HR_Job_ID?.identifier}</Text>
          </View>
        </View>
        <View style={styles.ContainerView}>
          <View style={styles.IconView}>
          <MaterialCommunityIcons name="calendar" size={size} color={color} />
          </View>
          <View>
            <Text style={styles.TextTop}>Start Date</Text>
            <Text style={styles.TextBottom}>{employeeData.StartDate}</Text>
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