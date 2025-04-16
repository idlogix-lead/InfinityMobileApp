import {StyleSheet, Text, View, Image} from 'react-native';
import React from 'react';
import CustomHeader from '../../components/CustomHeader';
import PortalCards from '../../components/EmployeePortalComponents/PortalCards';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LeaveStatus from './LeaveStatusScreen/LeaveStatus';

const EmployeePortal = ({navigation}) => {
  return (
    <View style={{flex: 1}}>
      <CustomHeader title="Employee Portal" />
      <View>
        <PortalCards
          onPress={() => navigation.navigate('SalarySlip')}
          text="Salary Slip"
          image={require('../../asserts/EmployePortal/saleryslip.png')}
          icon={<AntDesign name="right" size={25} color="#000" />}
          // icon={<Ionicons name="receipt-outline" size={25} color="#0050C0" />}
        />
        <PortalCards
          onPress={() => navigation.navigate('AttendenceStatus')}
          text="Attendence Status"
          image={require('../../asserts/EmployePortal/attendenceStatus.png')}
          icon={<AntDesign name="right" size={25} color="#000" />}
          // icon={<FontAwesome6 name="users" size={25} color="#0050C0" />}
        />
        <PortalCards
          onPress={() => navigation.navigate('StaffAttendance')}
          text="Staff Attendence"
          image={require('../../asserts/EmployePortal/staffAttendence.png')}
          icon={<AntDesign name="right" size={25} color="#000" />}
          // icon={
          //   <MaterialCommunityIcons
          //     name="list-status"
          //     size={25}
          //     color="#0050C0"
          //   />
          // }
        />
        <PortalCards
          onPress={() => navigation.navigate('LeaveStatus')}
          text="Leave Status"
          image={require('../../asserts/EmployePortal/leaveStatus.png')}
          icon={<AntDesign name="right" size={25} color="#000" />}
          // icon={
          //   <MaterialCommunityIcons
          //     name="calendar-alert"
          //     size={25}
          //     color="#0050C0"
          //   />
          // }
        />
        <PortalCards
          text="Score Card"
          image={require('../../asserts/EmployePortal/scoreCard.png')}
          icon={<AntDesign name="right" size={25} color="#000" />}
          // icon={
          //   <MaterialCommunityIcons
          //     name="card-bulleted"
          //     size={25}
          //     color="#0050C0"
          //   />
          // }
        />
        <PortalCards
          onPress={() => navigation.navigate('EmployeeProfileTopNavigation')}
          text="Profile"
          image={require('../../asserts/EmployePortal/profile.png')}
          icon={<AntDesign name="right" size={20} color="#000" />}
          // icon={<Ionicons name="person-sharp" size={25} color="#0050C0" />}
        />
      </View>
    </View>
  );
};

export default EmployeePortal;

const styles = StyleSheet.create({});
