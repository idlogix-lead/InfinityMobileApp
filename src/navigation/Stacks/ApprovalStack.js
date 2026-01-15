import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// Screens
import ApprovalScreens from '../../screens/ApprovalScreens/ApprovalScreens';
import CompanyInformationScreen from '../../screens/CompanyInformationScreen/CompanyInformationScreen';
import ApprovalByDoc from '../../screens/ApprovalScreens/ApprovalByDoc';
import ApprovalByDate from '../../screens/ApprovalScreens/ApprovalByDate';
import ApprovalCardList from '../../screens/ApprovalScreens/ApprovalCardList';
import FinancialByDoc from '../../screens/ApprovalScreens/FinancialByDoc';
import PendingDetails from '../../screens/ApprovalScreens/PendingDetails';
import AllApprovalList from '../../screens/ApprovalScreens/AllApprovalList';
import ApprovalDetails from '../../screens/ApprovalScreens/ApprovalDetails';

const Stack = createNativeStackNavigator();

const ApprovalStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* ENTRY SCREEN */}
      <Stack.Screen name="ApprovalScreens" component={ApprovalScreens} />

      <Stack.Screen name="AllApprovalList" component={AllApprovalList} />
      <Stack.Screen
        name="CompanyInformationScreen"
        component={CompanyInformationScreen}
      />
      <Stack.Screen name="ApprovalByDoc" component={ApprovalByDoc} />
      <Stack.Screen name="ApprovalByDate" component={ApprovalByDate} />
      <Stack.Screen name="ApprovalCardList" component={ApprovalCardList} />
      <Stack.Screen name="FinancialByDoc" component={FinancialByDoc} />
      <Stack.Screen name="ApprovalDetails" component={ApprovalDetails} />
      <Stack.Screen name="PendingDetails" component={PendingDetails} />
    </Stack.Navigator>
  );
};

export default ApprovalStack;
