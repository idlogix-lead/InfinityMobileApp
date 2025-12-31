import React from 'react';
import { View, Text, TouchableOpacity, Animated, Alert, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import moment from 'moment';


const FollowupSection = ({
  title,
  collapsed,
  setCollapsed,
  anim,
  data,
  navigation,
  deleteActivity,
  titleStyle
}) => {
  const toggleSection = () => {
    setCollapsed(!collapsed);
    Animated.timing(anim, {
      toValue: collapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRotation = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderFollowupCard = item => (
    <View key={item?.id} style={styles.followupCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>
          {item.ContactActivityType.identifier}
        </Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('AddActivity', { data: item, mode: 'edit' })
          }>
          <Feather name="edit-3" size={20} color={'#a135b1'} />
        </TouchableOpacity>
      </View>

      <Text style={{ color: 'gray' }}>{item.AD_User_ID.identifier}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', marginTop: 7 }}>
          <Text style={{ marginTop: 8 }}>
            <AntDesign name="calendar" size={19} color={'#82ced9'} />
          </Text>

          <View style={styles.date}>
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 13 }}>
              Created Date
            </Text>
            <Text style={styles.dateText}>
              {moment(item.Created).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ marginTop: 15 }}
          onPress={() =>
            Alert.alert(
              'Confirm Delete',
              'Are you sure you want to delete this activity?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: () => deleteActivity(item.id) },
              ]
            )
          }>
          <MaterialCommunityIcons name="delete" size={25} color={'#000'} />
        </TouchableOpacity>
      </View>

      {/* Start - End date */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flexDirection: 'row', marginTop: 7 }}>
          <Text style={{ marginTop: 8 }}>
            <AntDesign name="calendar" size={19} color={'#82ced9'} />
          </Text>
          <View style={styles.date}>
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 13 }}>
              Start Date
            </Text>
            <Text style={styles.dateText}>
              {moment(item.StartDate).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 7, marginLeft: 20 }}>
          <Text style={{ marginTop: 8 }}>
            <AntDesign name="calendar" size={19} color={'#82ced9'} />
          </Text>
          <View style={styles.date}>
            <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 13 }}>
              End Date
            </Text>
            <Text style={styles.dateText}>
              {moment(item.EndDate).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={{ marginTop: 7 }}>
        <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 14 }}>
          Description:
        </Text>

        <Text style={{ color: '#000', fontSize: 13 }} numberOfLines={1}>
          {item.Description}
        </Text>
      </View>
    </View>
  );

  return (
    <View>
      {/* Header */}
      <TouchableOpacity onPress={toggleSection} style={styles.followupHeader}>
        <Text style={styles.followupTitle}>{title}</Text>

        <Animated.View style={{ transform: [{ rotate: getRotation }] }}>
          <Feather name="chevron-down" size={20} color="#000" />
        </Animated.View>
      </TouchableOpacity>

      {/* Body */}
      {!collapsed && data.map(item => renderFollowupCard(item))}
    </View>
  );
};

export default FollowupSection;

const styles = StyleSheet.create({
     sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    color: '#000',
  },
  sectionTitleText: {
    color: 'black',
    fontStyle: 'italic',
    marginLeft: 10,
  },
  toggleBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  toggleTitle: {
    fontSize: 15,
    // fontWeight: 'bold',
    fontFamily:'K2D-Medium',
    color: '#000',
    flex: 1,
  },
  followupCard: {
      flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 5,
    height:50,
    // borderWidth:.5,
    // borderColor:'rgba(0, 0, 0, 0.15)',
    padding: 14,
    marginBottom: 20,
    shadowColor:'rgba(0, 0, 0, 0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation:2,
  },
})
