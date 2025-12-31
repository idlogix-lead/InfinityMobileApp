import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  Animated,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ExpandableSearch = ({
  placeholder = 'Search',
  initialOpen = false,
  onSearch = () => {},
  containerWidth = 280,
  closedWidth = 48,
  animationDuration = 200,
}) => {
  const [open, setOpen] = useState(initialOpen);
  const [text, setText] = useState('');
  const anim = useRef(new Animated.Value(initialOpen ? 1 : 0)).current; // 0 = closed, 1 = open

  useEffect(() => {
    Animated.timing(anim, {
      toValue: open ? 1 : 0,
      duration: animationDuration,
      useNativeDriver: false, // width & opacity can't use native driver
    }).start();
  }, [open, anim, animationDuration]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [closedWidth, containerWidth],
    extrapolate: 'clamp',
  });

  const inputOpacity = anim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.5, 1],
  });

  const handleIconPress = () => {
    if (open && text.trim().length > 0) {
      onSearch(text.trim());
      // optionally close after search: setOpen(false);
    } else {
      setOpen(s => !s);
    }
  };

  return (
    <Animated.View style={[styles.wrapper, {width}]}>
      <Animated.View
        style={[styles.inputContainer, {opacity: inputOpacity}]}
        pointerEvents={open ? 'auto' : 'none'}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => {
            onSearch(text.trim()); /* setOpen(false) if you want to collapse */
          }}
          returnKeyType="search"
          editable={open}
          underlineColorAndroid="transparent"
           cursorColor="#000"
        />
      </Animated.View>

      <TouchableOpacity
        onPress={handleIconPress}
        activeOpacity={0.7}
        style={styles.iconTouch}>
        <Ionicons name={open ? 'close' : 'search'} size={20} color={'#000'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#f2f2f2',
    borderRadius: 24,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  inputContainer: {
    flex: 1,
    marginRight: 6,
  },
  input: {
    // height: 30,
    paddingVertical:1,
    paddingHorizontal: 12,
    fontSize: 13,
    fontFamily: 'K2D-Regular',
    color: '#000',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    // paddingTop: 10,
    // textAlignVertical: 'bottom'
  },
  iconTouch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ExpandableSearch;
