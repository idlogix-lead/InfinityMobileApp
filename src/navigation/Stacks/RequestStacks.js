import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Request Screens
import RequestScreen from '../../screens/RequestScreens/RequestScreen';
import RequestList from '../../screens/RequestScreens/RequestList';
import CreateNewReq from '../../screens/RequestScreens/CreateNewReq';
import RequestDetails from '../../screens/RequestScreens/RequestDetails';
import DueTasks from '../../screens/Requests/DueTasks';
import PriorityRequests from '../../screens/Requests/PriorityRequests';
import TaskDetail from '../../screens/Requests/TaskDetail';
import Performance from '../../screens/RequestScreens/Performance';
import TeamTaskCreateNewReq from '../../screens/RequestScreens/TeamTaskCreateNewReq';
import Requests from '../../screens/Requests/Request';
import Search from '../../screens/Requests/Search';
import Account from '../../screens/Requests/Account';
import Inbox from '../../screens/Requests/Inbox';
import MyTasks from '../../screens/Requests/MyTasks';
import AddTask from '../../screens/Requests/AddTask';
import Create from '../../screens/Requests/Create';

const Stack = createNativeStackNavigator();

const RequestStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* Entry Screen (Tab click opens this) */}
      <Stack.Screen name="Request" component={Requests} />

      {/* Lists */}
      {/* <Stack.Screen name="RequestList" component={RequestList} /> */}
      <Stack.Screen name="TaskDetail" component={TaskDetail} />
      <Stack.Screen name="DueTasks" component={DueTasks} />
      <Stack.Screen name="PriorityRequests" component={PriorityRequests} />
      <Stack.Screen name="AddTask" component={AddTask} />
      <Stack.Screen name="Create" component={Create} />



      {/* Create */}
      {/* <Stack.Screen name="CreateNewReq" component={CreateNewReq} /> */}
      {/* <Stack.Screen
        name="TeamTaskCreateNewReq"
        component={TeamTaskCreateNewReq}
      /> */}

      {/* Details */}
      {/* <Stack.Screen name="RequestDetails" component={RequestDetails} /> */}

      {/* Others */}
      {/* <Stack.Screen name="Performance" component={Performance} /> */}
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="Inbox" component={Inbox} />
      <Stack.Screen name="MyTasks" component={MyTasks} />




    </Stack.Navigator>
  );
};

export default RequestStack;
