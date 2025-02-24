import React, { useEffect } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import PendingRequest from '../../screens/RequestScreens/PendingRequest';
import CloseRequest from '../../screens/RequestScreens/CloseRequest';
import { View } from 'react-native';
import FinalClose from '../../screens/RequestScreens/FinalClose';


const Tab = createMaterialTopTabNavigator();

const TopNavigation = (props) => {
    const { startDate, endDate } = props;
    useEffect(() => {
        startDate ? console.log('exist') : console.log('not exist')
    }, [])
    return (
        <Tab.Navigator screenOptions={{
            tabBarStyle: {
                backgroundColor: '#D1D9D3',
                width: '90%',
                marginLeft: 15,
                borderRadius: 20,
                height: '7%',
            },
            tabBarActiveTintColor: '#800000',
            tabBarInactiveTintColor: '#4A4747',
            tabBarIndicator: ({ navigation, state }) => { 
                return (
                    <View style={{ 
                        height: 0
                    }} />
                );
            }
        }}>
            {startDate && endDate && (
                <Tab.Screen
                    name="Pending"
                    component={() => 
                    <PendingRequest
                        startDate={startDate}
                        endDate={endDate}
                    />}
                    initialParams={{ startDate, endDate }}
                />
            )}
            <Tab.Screen
                name="Close"
                component={() => 
                <CloseRequest
                    startDate={startDate}
                    endDate={endDate} />}
                initialParams={{ startDate, endDate }}
            />
            <Tab.Screen name="Final Close"
                component={() => 
                <FinalClose
                    startDate={startDate}
                    endDate={endDate}
                    initialParams={{ startDate, endDate }}
                />}
            />
        </Tab.Navigator>
    )
}

export default TopNavigation



// import React, { useEffect } from 'react';
// import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
// import PendingRequest from '../../screens/RequestScreens/PendingRequest';
// import CloseRequest from '../../screens/RequestScreens/CloseRequest';
// import { View } from 'react-native';
// import FinalClose from '../../screens/RequestScreens/FinalClose';

// const Tab = createMaterialTopTabNavigator();

// // Define your components outside of the TopNavigation component
// const PendingRequestScreen = ({ startDate, endDate }) => (
//   <PendingRequest startDate={startDate} endDate={endDate} />
// );

// const CloseRequestScreen = ({ startDate, endDate }) => (
//   <CloseRequest startDate={startDate} endDate={endDate} />
// );

// const FinalCloseScreen = ({ startDate, endDate }) => (
//   <FinalClose startDate={startDate} endDate={endDate} />
// );

// const TopNavigation = (props) => {
//   const { startDate, endDate } = props;

//   useEffect(() => {
//     startDate ? console.log('exist') : console.log('not exist');
//   }, []);

//   return (
//     <Tab.Navigator
//       screenOptions={{
//         tabBarStyle: {
//           backgroundColor: '#D1D9D3',
//           width: '90%',
//           marginLeft: 15,
//           borderRadius: 20,
//           height: '7%',
//         },
//         tabBarActiveTintColor: '#800000',
//         tabBarInactiveTintColor: '#4A4747',
//         tabBarIndicator: ({ navigation, state }) => {
//           return <View style={{ height: 0 }} />;
//         },
//       }}>
//       {startDate && endDate && (
//         <Tab.Screen
//           name="Pending"
//           initialParams={{ startDate, endDate }}>
//           {(props) => <PendingRequestScreen {...props} />}
//         </Tab.Screen>
//       )}
//       <Tab.Screen
//         name="Close"
//         initialParams={{ startDate, endDate }}>
//         {(props) => <CloseRequestScreen {...props} />}
//       </Tab.Screen>
//       <Tab.Screen
//         name="Final Close"
//         initialParams={{ startDate, endDate }}>
//         {(props) => <FinalCloseScreen {...props} />}
//       </Tab.Screen>
//     </Tab.Navigator>
//   );
// };

// export default TopNavigation;
