import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen/WelcomeScreen'
import SignIn from '../screens/AuthScreens/SignIn';
import SelectRoleScreen from '../screens/SelectRoleScreens/SelectRoleScreen';
import HomeScreen from '../screens/HomeScreens/HomeScreen';
import BottomTab from './BottomTab/BottomTab';
import ApprovalScreens from '../screens/ApprovalScreens/ApprovalScreens';
import CompanyInformationScreen from '../screens/CompanyInformationScreen/CompanyInformationScreen';
import ApprovalByDoc from '../screens/ApprovalScreens/ApprovalByDoc';
import ApprovalByDate from '../screens/ApprovalScreens/ApprovalByDate';
import ApprovalCardList from '../screens/ApprovalScreens/ApprovalCardList';
import FinancialByDoc from '../screens/ApprovalScreens/FinancialByDoc';
import FingerPrintScreen from '../screens/AddFingerPrint/FingerPrintScreen';
import RequestScreen from '../screens/RequestScreens/RequestScreen';
import RequestList from '../screens/RequestScreens/RequestList';
import CreateNewReq from '../screens/RequestScreens/CreateNewReq';
import RequestDetails from '../screens/RequestScreens/RequestDetails';
import TopNavigationUser from './TopNavigation/TopNavigationUser';
import UserList from '../screens/RequestScreens/UserList';
import ChatScreen from '../screens/ChatScreens/ChatScreen';
import PendingDetails from '../screens/ApprovalScreens/PendingDetails';
import AllApprovalList from '../screens/ApprovalScreens/AllApprovalList';
import AllTaskScreen from '../screens/AllTaskScreen/AllTaskScreen';
import Performance from '../screens/RequestScreens/Performance';
import EmployeePortal from '../screens/EmployeePortalScreens/EmployeePortal';
import EmployeeProfileTopNavigation from '../screens/EmployeePortalScreens/ProfileScreens/EmployeeProfileTopNavigation';
import BasicInformation from '../screens/EmployeePortalScreens/ProfileScreens/BasicInformation';
import Education from '../screens/EmployeePortalScreens/ProfileScreens/Education';
import Experience from '../screens/EmployeePortalScreens/ProfileScreens/Experience';
import TopNavigationEmployeeProfile from './TopNavigation/TopNavigationEmployeeProfile';
import SalarySlip from '../screens/EmployeePortalScreens/SalarySlipScreen/SalarySlip';
import AttendenceStatus from '../screens/EmployeePortalScreens/AttendenceStatusScreen/AttendenceStatus';
import StaffAttendance from '../screens/EmployeePortalScreens/StaffAttendanceScreens/StaffAttendance';
import LeaveStatus from '../screens/EmployeePortalScreens/LeaveStatusScreen/LeaveStatus';
import AnnualLeave from '../screens/EmployeePortalScreens/LeaveStatusScreen/AnnualLeave';
import DetailedLeave from '../screens/EmployeePortalScreens/LeaveStatusScreen/DetailedLeave';
import ApprovalDetails from '../screens/ApprovalScreens/ApprovalDetails';

const Stack = createNativeStackNavigator();
const Navigation = () => {
    return (
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="SplashScreen" component={SplashScreen} />
                    <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                    <Stack.Screen name="SignIn" component={SignIn} />
                    <Stack.Screen name="SelectRoleScreen" component={SelectRoleScreen} />
                    <Stack.Screen name="HomeScreen" component={HomeScreen} />
                    <Stack.Screen name="BottomTab" component={BottomTab} />
                    <Stack.Screen name="ApprovalScreens" component={ApprovalScreens} />
                    <Stack.Screen name="CompanyInformationScreen" component={CompanyInformationScreen} />
                    <Stack.Screen name="ApprovalByDoc" component={ApprovalByDoc} />
                    <Stack.Screen name="ApprovalByDate" component={ApprovalByDate} />
                    <Stack.Screen name="ApprovalCardList" component={ApprovalCardList} />
                    <Stack.Screen name="FinancialByDoc" component={FinancialByDoc} />
                    <Stack.Screen name="FingerPrintScreen" component={FingerPrintScreen} />
                    <Stack.Screen name="RequestScreen" component={RequestScreen} />
                    <Stack.Screen name="RequestList" component={RequestList} />
                    <Stack.Screen name="CreateNewReq" component={CreateNewReq} />
                    <Stack.Screen name="RequestDetails" component={RequestDetails} />
                    <Stack.Screen name="UserList" component={UserList} />
                    <Stack.Screen name="ChatScreen" component={ChatScreen} />
                    <Stack.Screen name="AllApprovalList" component={AllApprovalList} />
                    <Stack.Screen name="                    <Stack.Screen name="AllApprovalList" component={ApprovalDetails} />
" component={ApprovalDetails} />
                    <Stack.Screen name="PendingDetails" component={PendingDetails} />
                    <Stack.Screen name="AllTaskScreen" component={AllTaskScreen} />
                    <Stack.Screen name="Performance" component={Performance} />
                    <Stack.Screen name="EmployeePortal" component={EmployeePortal} />
                    <Stack.Screen name="EmployeeProfileTopNavigation" component={EmployeeProfileTopNavigation} />
                    <Stack.Screen name="BasicInformation" component={BasicInformation} />
                    <Stack.Screen name="Education" component={Education} />
                    <Stack.Screen name="Experience" component={Experience} />
                    <Stack.Screen name="TopNavigationEmployeeProfile" component={TopNavigationEmployeeProfile} />
                    <Stack.Screen name="SalarySlip" component={SalarySlip} />
                    <Stack.Screen name="AttendenceStatus" component={AttendenceStatus} />
                    <Stack.Screen name="StaffAttendance" component={StaffAttendance} />
                    <Stack.Screen name="LeaveStatus" component={LeaveStatus} />
                    <Stack.Screen name="AnnualLeave" component={AnnualLeave} />
                    <Stack.Screen name="DetailedLeave" component={DetailedLeave} />
                </Stack.Navigator>
            </NavigationContainer>
    )
}

export default Navigation

const styles = StyleSheet.create({})