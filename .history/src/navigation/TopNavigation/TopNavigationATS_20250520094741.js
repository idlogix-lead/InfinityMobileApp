import React, {useState, useEffect, useRef, useCallback} from 'react';
import {StyleSheet, View, ActivityIndicator, FlatList} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChartCards from '../../components/RequestScreenComponents/ChartCards';
import CustomHeader from '../../components/CustomHeader';
import AllTaskScreen from '../../screens/AllTaskScreen/AllTaskScreen';
import ShowTeamTask from '../../screens/AllTaskScreen/ShowTeamTask';
import {useFocusEffect} from '@react-navigation/native';

const TapTab = createMaterialTopTabNavigator();

const TopNavigationATS = () => {
  const [myTaskData, setMyTaskData] = useState([]);
  const [teamTaskData, setTeamTaskData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('My Task'); // Track active tab

  const getAPIData = async () => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const protocol = await AsyncStorage.getItem('protocol');
      const host = await AsyncStorage.getItem('host');
      const port = await AsyncStorage.getItem('port');
      const userId = await AsyncStorage.getItem('userId');

      const myTaskResponse = await fetch(
        `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=SalesRep_ID eq ${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const myTaskResult = await myTaskResponse.json();

      const teamTaskResponse = await fetch(
        `${protocol}://${host}:${port}/api/v1/models/mbl_request_view_v?$filter=Supervisor_ID eq ${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const teamTaskResult = await teamTaskResponse.json();

      setMyTaskData(myTaskResult.records || []);
      setTeamTaskData(teamTaskResult.records || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getAPIData();
    }, []),
  );

  const processChartData = data => {
    return data.reduce((acc, currentItem) => {
      const userName = currentItem.user_name;
      if (!acc[userName]) {
        acc[userName] = {
          assignedCount: 0,
          completedCount: 0,
          pendingCount: 0,
        };
      }
      acc[userName].assignedCount++;
      if (currentItem.R_Status_ID?.id == 1000003) {
        acc[userName].completedCount++;
      } else {
        acc[userName].pendingCount++;
      }
      return acc;
    }, {});
  };

  const myTaskChartData = Object.keys(processChartData(myTaskData)).map(
    userName => ({
      name: userName,
      assigned: processChartData(myTaskData)[userName].assignedCount,
      completed: processChartData(myTaskData)[userName].completedCount,
      pending: processChartData(myTaskData)[userName].pendingCount,
    }),
  );

  const teamTaskChartData = Object.keys(processChartData(teamTaskData)).map(
    userName => ({
      name: userName,
      assigned: processChartData(teamTaskData)[userName].assignedCount,
      completed: processChartData(teamTaskData)[userName].completedCount,
      pending: processChartData(teamTaskData)[userName].pendingCount,
    }),
  );

  return (
    <View style={{flex: 1}}>
      <CustomHeader title="ATS" />
      <View>
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={activeTab === 'My Task' ? myTaskChartData : teamTaskChartData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => {
              const progressPercentage = item.completed / item.assigned || 0;
              return (
                <ChartCards
                  name={item.name}
                  firstTop="Assigned"
                  secTop="Completed"
                  thirdTop="Pending"
                  percentageNum={progressPercentage}
                  total={item.assigned}
                  comp={item.completed}
                  unComp={item.pending}
                />
              );
            }}
          />
        )}
      </View>

      <TapTab.Navigator
        screenOptions={{
          tabBarLabelStyle: {fontSize: 14},
          tabBarIndicatorStyle: {backgroundColor: '#0050C0'},
          tabBarStyle: {backgroundColor: '#f9f9f9', elevation: 2},
        }}
        screenListeners={{
          state: e => {
            const index = e.data.state.index;
            setActiveTab(e.data.state.routeNames[index]); // Update activeTab based on tab change
          },
        }}>
        <TapTab.Screen
          name="My Task"
          component={AllTaskScreen}
          initialParams={{data: myTaskData}}
        />
        <TapTab.Screen
          name="Team Task"
          component={ShowTeamTask}
          initialParams={{data: teamTaskData}}
        />
      </TapTab.Navigator>
    </View>
  );
};

export default TopNavigationATS;
