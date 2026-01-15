import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import Performance from '../../screens/RequestScreens/Performance';
import EmployeePortal from '../../screens/EmployeePortalScreens/EmployeePortal';
import EmployeeProfileTopNavigation from '../../screens/EmployeePortalScreens/ProfileScreens/EmployeeProfileTopNavigation';
import BasicInformation from '../../screens/EmployeePortalScreens/ProfileScreens/BasicInformation';
import Education from '../../screens/EmployeePortalScreens/ProfileScreens/Education';
import Experience from '../../screens/EmployeePortalScreens/ProfileScreens/Experience';
import TopNavigationEmployeeProfile from '../TopNavigation/TopNavigationEmployeeProfile';
import SalarySlip from '../../screens/EmployeePortalScreens/SalarySlipScreen/SalarySlip';
import AttendenceStatus from '../../screens/EmployeePortalScreens/AttendenceStatusScreen/AttendenceStatus';
import StaffAttendance from '../../screens/EmployeePortalScreens/StaffAttendanceScreens/StaffAttendance';
import LeaveStatus from '../../screens/EmployeePortalScreens/LeaveStatusScreen/LeaveStatus';
import AnnualLeave from '../../screens/EmployeePortalScreens/LeaveStatusScreen/AnnualLeave';
import DetailedLeave from '../../screens/EmployeePortalScreens/LeaveStatusScreen/DetailedLeave';
import ApprovalDetails from '../../screens/ApprovalScreens/ApprovalDetails';
// import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';
import ReportMain from '../../screens/ReportsScreen/ReportMain';
import Liquidity from '../../screens/ReportsScreen/Liquidity/Liquidity';
import TopNavigationATS from '../TopNavigation/TopNavigationATS';
import ShowMyTask from '../../screens/AllTaskScreen/ShowMyTask';
import ShowTeamTask from '../../screens/AllTaskScreen/ShowTeamTask';
// import TeamTaskCreateNewReq from '../../screens/RequestScreens/TeamTaskCreateNewReq';
import NotificationSrn from '../../screens/NotificationSrn/NotificationSrn';
import QRScannerScreen from '../../screens/QRCodeScanner/QRScannerScreen';
import ProfileScreen from '../../screens/ProfileScreens/ProfileScreen';

const Stack = createNativeStackNavigator();

const EmployeeStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Entry Screen (Tab click opens this) */}
      {/* <Stack.Screen name="EmployeePortal" component={EmployeePortal} /> */}
      <Stack.Screen name="EmployeePortal" component={ProfileScreen} />
      <Stack.Screen
        name="EmployeeProfileTopNavigation"
        component={EmployeeProfileTopNavigation}
      />
      <Stack.Screen name="Performance" component={Performance} />

      <Stack.Screen name="BasicInformation" component={BasicInformation} />
      <Stack.Screen name="Education" component={Education} />
      <Stack.Screen name="Experience" component={Experience} />
      <Stack.Screen
        name="TopNavigationEmployeeProfile"
        component={TopNavigationEmployeeProfile}
      />
      <Stack.Screen name="SalarySlip" component={SalarySlip} />
      <Stack.Screen name="AttendenceStatus" component={AttendenceStatus} />
      <Stack.Screen name="StaffAttendance" component={StaffAttendance} />
      <Stack.Screen name="LeaveStatus" component={LeaveStatus} />
      <Stack.Screen name="AnnualLeave" component={AnnualLeave} />
      <Stack.Screen name="DetailedLeave" component={DetailedLeave} />
      {/* <Stack.Screen name="ProfileScreen" component={ProfileScreen} /> */}
      <Stack.Screen name="ReportMain" component={ReportMain} />
      <Stack.Screen name="Liquidity" component={Liquidity} />
      <Stack.Screen name="TopNavigationATS" component={TopNavigationATS} />
      <Stack.Screen name="ShowMyTask" component={ShowMyTask} />
      <Stack.Screen name="showMyTeamTask" component={ShowTeamTask} />
      <Stack.Screen name="NotificationSrn" component={NotificationSrn} />
      <Stack.Screen name="QRScannerScreen" component={QRScannerScreen} />
      <Stack.Screen name="ApprovalDetails" component={ApprovalDetails} />
    </Stack.Navigator>
  );
};

export default EmployeeStack;
