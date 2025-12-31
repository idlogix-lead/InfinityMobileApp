import {StyleSheet, Text, TouchableOpacity, View, Animated} from 'react-native';
import React, {useState} from 'react';
import CustomHeader from '../../components/CustomHeader';

const AddActivity = () => {
  const [activityCollapsed, setActivityCollapsed] = useState(true);
  const activityAnim = useRef(new Animated.Value(0)).current;

  const toggleSection = (collapsed, setCollapsed, anim) => {
    setCollapsed(!collapsed);
    Animated.timing(anim, {
      toValue: collapsed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRotation = anim =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
  return (
    <View style={{flex: 1}}>
      <CustomHeader title={'Add Activity'} />
      {/* Activity */}
      <View style={styles.activity}>
        <Text style={{color: '#000', fontSize: 15, fontWeight: 'bold'}}>
          Activity Type
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          toggleSection(activityCollapsed, setActivityCollapsed, activityAnim)
        }
        style={styles.dateInput}></TouchableOpacity>
    </View>
  );
};

export default AddActivity;

const styles = StyleSheet.create({
  activity: {
    padding: 10,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginHorizontal: 10,
    marginTop: 8,
    backgroundColor: '#fff',
  },
});
