// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const NotificationComponent = ({ created, reference, textMsg }) => {
//     return (
//         <View style={styles.card}>

//             <Text style={styles.message}>{textMsg}</Text>
//             <Text style={styles.reference}>{reference}</Text>
//             <Text style={styles.date}>{new Date(created).toLocaleString()}</Text>
//             <View style={styles.separator} />

//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     card: {
//         backgroundColor: '#fff',
//         padding: 16,
//         marginVertical: 8,
//         borderRadius: 12,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         elevation: 3,
//     },
//     date: {
//         fontSize: 14,
//         // fontWeight: 'bold',
//         color: '#555',
//         marginBottom: 6,
//         alignSelf:"flex-end"
//     },
//     reference: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 8,
//     },
//     separator: {
//         height: 1,
//         backgroundColor: '#ddd',
//         // marginVertical: 8,
//     },
//     message: {
//         fontSize: 14,
//         color: '#444',
//         lineHeight: 20,
//         fontWeight:"700"
//     },
// });

// export default NotificationComponent;

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const NotificationComponent = ({
  created,
  reference,
  textMsg,
  backgroundColor,
  NotificationOnPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: backgroundColor}]}
      onPress={NotificationOnPress}>
      <View style={styles.header}>
        {reference && <Text style={styles.reference}>{reference}</Text>}
        {textMsg && <Text style={styles.message}>{textMsg}</Text>}
      </View>
      <View style={styles.separator} />
      <Text style={styles.date}>{new Date(created).toLocaleString()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    // backgroundColor: '#f9f9f9',
    padding: 16,
    // marginVertical:2,
    // borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    // borderLeftWidth: 5,
    borderLeftColor: '#002E62',
    marginTop: '1%',
  },
  header: {
    // flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    // color: '#777',
    color: 'red',
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  reference: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  message: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    fontWeight: '500',
  },
});

export default NotificationComponent;
