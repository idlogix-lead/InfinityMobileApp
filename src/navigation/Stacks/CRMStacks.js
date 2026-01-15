import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// CRM Screens

import CrmScreen from '../../screens/CRMScreen/CrmScreen';
import CrmTotal from '../../screens/CRMScreen/CrmTotal';
import CrmNew from '../../screens/CRMScreen/CrmNew';
import CrmWorking from '../../screens/CRMScreen/CrmWorking';
import CrmConverted from '../../screens/CRMScreen/CrmConverted';
import CrmExpire from '../../screens/CRMScreen/CrmExpire';
import ActivityList from '../../screens/CRMActivity/ActivityList';
import AddActivity from '../../screens/CRMActivity/AddActivity';
import LeadsDetails from '../../screens/CRMLeadDetail/LeadsDetails';
import AddLeads from '../../screens/CRMAddLeads/AddLeads';
import CRMGraph from '../../screens/CRMGraphScreen/CRMGraph';
import TodayFollowUp from '../../screens/CRMFollowupsScreen/TodayFollowup';
import FutureFollowUp from '../../screens/CRMFollowupsScreen/FutureFollowup';
import MissedFollowUp from '../../screens/CRMFollowupsScreen/MissedFollowup';
import SaleStageDetails from '../../screens/SalesOppertunity/SaleStageDetails';
import AllFollowups from '../../screens/CRMFollowupsScreen/AllFollowups';
import AddSaleOppor from '../../screens/SalesOppertunity/AddSaleOppor';
import CreateActivity from '../../screens/CRMActivity/CreateActivity';

const Stack = createNativeStackNavigator();

const CRMStack = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* Entry Screen (Tab click opens this) */}
      <Stack.Screen name="CrmHome" component={CrmScreen} />

      <Stack.Screen name="CrmTotal" component={CrmTotal} />
      <Stack.Screen name="CrmNew" component={CrmNew} />
      <Stack.Screen name="CrmWorking" component={CrmWorking} />
      <Stack.Screen name="CrmConverted" component={CrmConverted} />
      <Stack.Screen name="CrmExpire" component={CrmExpire} />
      <Stack.Screen name="ActivityList" component={ActivityList} />
      <Stack.Screen name="AddActivity" component={AddActivity} />
      <Stack.Screen name="LeadsDetails" component={LeadsDetails} />
      <Stack.Screen name="AddLeads" component={AddLeads} />
      <Stack.Screen name="CRMGraph" component={CRMGraph} />
      <Stack.Screen name="TodayFollowups" component={TodayFollowUp} />
      <Stack.Screen name="FutureFollowups" component={FutureFollowUp} />
      <Stack.Screen name="MissedFollowups" component={MissedFollowUp} />
      <Stack.Screen name="AllFollowups" component={AllFollowups} />

      <Stack.Screen name="SaleStageDetails" component={SaleStageDetails} />
      <Stack.Screen name="AddSaleOppor" component={AddSaleOppor} />
      <Stack.Screen name="CreateActivity" component={CreateActivity} />
    </Stack.Navigator>
  );
};

export default CRMStack;
