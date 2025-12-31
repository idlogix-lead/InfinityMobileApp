import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React, {useState} from 'react';
import {Menu, Divider} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const CRMCard = ({
  header,
  name,
  email,
  mail,
  phone,
  whatsapp,
  onPress,
  dateText,
  actOnPress,
  id,
}) => {
  const [visible, setVisible] = useState(false);

  const closeMenu = () => setVisible(false);
  const openMenu = () => setVisible(true);

  return (
    <View style={styles.card}>
      {/* header name */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerText}>{header}</Text>
        </View>
      </View>
      {/* Date */}
      <View style={styles.date}>
        <Text>
          <AntDesign name="calendar" size={19} color={'#82ced9'} />
        </Text>
        <Text style={styles.dateText}>
          {/* {dateText} */}
          {moment({dateText}).format('DD MMM YYYY')}
        </Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View>
          {/* name */}
          <View style={{flexDirection: 'row', marginTop: 1}}>
            <Text style={{color: 'black'}}>Name:</Text>
            <Text style={{color: 'gray', marginLeft: 20}}>{name}</Text>
            <Text style={{color: 'gray', marginLeft: 20}}>{id}</Text>
          </View>
          {/* Email */}
          <View style={{flexDirection: 'row', marginTop: 5}}>
            <Text style={{color: 'black'}}>E-mail:</Text>
            <Text style={{color: 'gray', marginLeft: 20}}>{email}</Text>
          </View>
        </View>
      </View>
      {/* Icons*/}
      <View style={{flexDirection: 'row-reverse', paddingTop: 10}}>
        {/* Mail Icon */}
        <View style={{flexDirection: 'row', marginRight: 5}}>
          <TouchableOpacity onPress={mail} style={styles.icons}>
            <Text style={{textAlign: 'center'}}>
              <Ionicons name="mail-outline" size={20} color={'black'} />
            </Text>
          </TouchableOpacity>
          {/* Call Icon */}
          <TouchableOpacity onPress={phone} style={styles.icons}>
            <Text style={{textAlign: 'center'}}>
              <Ionicons name="call-outline" size={20} color={'black'} />
            </Text>
          </TouchableOpacity>
          {/* WhatsApp Icon */}
          <TouchableOpacity
            onPress={whatsapp}
            style={[styles.icons, {paddingLeft: 9}]}>
            <Image
              source={require('../../../asserts/CRMIcons/WhatsappIcon.png')}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Bottom Button */}
      <View style={styles.bottomButton}>
        {/* status function */}
        <View style={styles.button}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            style={{marginTop: 55, marginLeft: 15}}
            anchor={
              <TouchableOpacity
                onPress={openMenu}
                style={{flexDirection: 'row'}}>
                <Text style={styles.buttonText}>Status</Text>
                <Text style={{marginTop: 5, marginLeft: 5}}>
                  <AntDesign name="down" size={15} color={'#fff'} />
                </Text>
              </TouchableOpacity>
            }>
            <View>
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  // navigation.navigate('Bottom');
                }}
                title="New"
              />
              <Divider style={{height: 1, color: 'black', width: '100%'}} />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  // navigation.navigate('Home');
                }}
                title="Previous"
              />
              <Divider style={{height: 1, color: 'black', width: '100%'}} />
              <Menu.Item
                onPress={() => {
                  closeMenu();
                  // navigation.navigate('Home');
                }}
                title="Cancel"
              />
            </View>
          </Menu>
        </View>
        {/* Activity */}
        <TouchableOpacity onPress={actOnPress} style={styles.button}>
          <Text style={styles.buttonText}>Activity</Text>
          <Text>
            <Ionicons name="add-outline" size={20} color={'#fff'} />
          </Text>
        </TouchableOpacity>
        {/* Details */}
        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CRMCard;

const styles = StyleSheet.create({
  card: {
    width: '95%',
    backgroundColor: '#eeeeee',
    marginTop: 40,
    alignSelf: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  header: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    height: 35,
    marginRight: 9,
    paddingTop: 6,
    flexDirection: 'row',
  },
  dateText: {
    color: 'black',
    marginLeft: 4,
    marginTop: 1,
    fontSize: 12,
  },
  icons: {
    height: 40,
    width: 40,
    marginRight: 4,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    elevation: 11,
  },
  bottomButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    borderTopWidth: 2,
    borderRightColor: 'grey',
    paddingTop: 10,
  },
  button: {
    height: 35,
    width: 90,
    backgroundColor: '#83ced9',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});
