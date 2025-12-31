import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {Menu, Divider} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CRMCard = ({
  header,
  startDate,
  name,
  email,
  mail,
  phone,
  whatsapp,
  onPress,
  dateText,
  actOnPress,
  Description,
  id,
  status,
  count,
  interactionType,
  cellNo,
}) => {
  const [visible, setVisible] = useState(false);
  const [editStatus, setEditStatus] = useState(status);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [leads, setLeads] = useState('');
  const interaction = moment(dateText).format('DD MMM YYYY');

  const cols = [
    {
      title: 'Last Activity',
      align: 'flex-start',
      dotColor: 'rgba(234, 71, 71, 1)',
      content: (
        <View style={styles.statusRow}>
          <Text style={styles.value}>{interactionType || 'Email'}</Text>
        </View>
      ),
    },
    {
      title: 'Last Interaction',
      align: 'center',
      dotColor: 'rgba(231, 205, 76, 1)',
      content: (
        <View style={styles.statusRow}>
          <Text style={styles.value}>{interaction}</Text>
        </View>
      ),
    },
    {
      title: 'Total Activities',
      align: 'flex-end',
      dotColor: 'rgba(38, 189, 206, 1)',
      content: <Text style={styles.value}>{count}</Text>
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* header name */}
        <View style={styles.header}>
          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />
          <View>
            <View
              style={{
                flexDirection: 'row',
                marginTop: 1,
                justifyContent: 'space-between',
                gap: 25,
              }}>
              {/* <Text style={styles.name}>Name:</Text> */}
              <TouchableOpacity
                onPress={() =>
                  Alert.alert('House #24, Street 6, Green Town, Lahore')
                }
                style={{
                  alignItems: 'flex-start',
                  // backgroundColor: 'gray',
                  width: '40%',
                }}>
                <Text style={styles.name}>{name}</Text>
              </TouchableOpacity>
              <View
                style={{
                  alignItems: 'flex-end',
                  // backgroundColor: 'gray',
                  width: '46%',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity onPress={phone}>
                  <Text style={styles.link}>Call</Text>
                </TouchableOpacity>
                <Text style={styles.separator}> \ </Text>
                <TouchableOpacity onPress={mail}>
                  <Text style={styles.link}>E-mail</Text>
                </TouchableOpacity>
              </View>
              <Text style={{color: 'gray', marginLeft: 20}}>{id}</Text>
            </View>
            <TouchableOpacity
              style={{flexDirection: 'row', marginTop: 1}}
              onPress={() =>
                Alert.alert('Office #12, Floor 3, XYZ Plaza, Faisalabad')
              }>
              {/* <Text style={{color: 'black'}}>Company:</Text> */}
              <Text style={styles.company}>{header}</Text>
              <View style={{paddingHorizontal: '1%', paddingTop: '1%'}}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={15}
                  color={'#2F4FE3'}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoRow}>
          {cols.map((col, index) => (
            <View key={index} style={[styles.col, {alignItems: col.align}]}>
              {/* Title */}
              <Text style={styles.label}>{col.title}</Text>

              {/* Dot under title, aligned same as col */}
              <View
                style={[
                  styles.dottedLine,
                  col.align === 'center'
                    ? {alignItems: 'center'}
                    : col.align === 'flex-end'
                    ? {alignItems: 'flex-end'}
                    : {alignItems: 'flex-start'},
                ]}>
                <View
                  style={[styles.smallDot, {backgroundColor: col.dotColor}]}
                />
              </View>

              {/* Content (status/date/action) */}
              {col.content}
            </View>
          ))}
        </View>
        {/* Date */}
        {/* <View style={styles.date}> */}
        {/* <Text>
            <AntDesign name="calendar" size={19} color={'#82ced9'} />
          </Text> */}
        {/* <Text style={styles.dateText}>
            {/* {dateText} */}
        {/* {moment({dateText}).format('DD MMM YYYY')}
          </Text>  */}
        {/* </View> */}
        {/* <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View> */}
        {/* name */}
        {/* <View style={{flexDirection: 'row', marginTop: 1}}>
              <Text style={{color: 'black'}}>Name:</Text>
              <Text style={{color: 'gray', marginLeft: 20}}>{name}</Text>
              <Text style={{color: 'gray', marginLeft: 20}}>{id}</Text>
            </View> */}
        {/* Email */}
        {/* <View style={{flexDirection: 'row', marginTop: 5}}>
              <Text style={{color: 'black'}}>E-mail:</Text>
              <Text style={{color: 'gray', marginLeft: 20}}>{email}</Text>
            </View>
          </View>
        </View> */}

        {/* Icons*/}
        {/* <View style={{flexDirection: 'row-reverse', paddingTop: 10}}> */}
        {/* Mail Icon */}
        {/* <View style={{flexDirection: 'row', marginRight: 5}}> */}
        {/* <TouchableOpacity onPress={mail} style={styles.icons}> */}
        {/* <Text style={{textAlign: 'center'}}> */}
        {/* <Ionicons name="mail-outline" size={20} color={'black'} /> */}
        {/* </Text> */}
        {/* </TouchableOpacity> */}
        {/* Call Icon */}
        {/* <TouchableOpacity onPress={phone} style={styles.icons}> */}
        {/* <Text style={{textAlign: 'center'}}> */}
        {/* <Ionicons name="call-outline" size={20} color={'black'} /> */}
        {/* </Text> */}
        {/* </TouchableOpacity> */}
        {/* WhatsApp Icon */}
        {/* <TouchableOpacity */}
        {/* onPress={whatsapp} */}
        {/* style={[styles.icons, {paddingLeft: 9}]}> */}
        {/* <Image source={require('../../asserts/Crm/WhatsappIcon.png')} /> */}
        {/* </TouchableOpacity> */}
        {/* </View> */}
        {/* </View> */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '7%',
            paddingVertical: '3%',
            borderRadius: 6,
            backgroundColor: '#fff',
            elevation: 2,
            shadowColor: '#000',
          }}>
          {/* mail section */}
          <View
            style={{
              flexDirection: 'row',
              width: '48%',
              alignItems: 'center',
              paddingHorizontal: '4%',
            }}>
            <MaterialCommunityIcons
              name="email-outline"
              size={15}
              color={'#2F4FE3'}
            />
            <Text
              style={{
                color: '#555',
                fontSize: 13,
                fontFamily: 'K2D-Medium',
                paddingHorizontal: '3%',
              }}>
              {email || 'N/A'}
            </Text>
          </View>

          {/* phone section */}
          <View
            style={{
              flexDirection: 'row',
              width: '48%',
              alignItems: 'center',
              paddingHorizontal: '3%',
            }}>
            <MaterialCommunityIcons
              name="phone-outline"
              size={15}
              color={'#2F4FE3'}
            />
            <Text
              style={{color: '#555', fontSize: 13, fontFamily: 'K2D-Medium',paddingHorizontal:'5%'}}>
              {cellNo || 'N/A'}
            </Text>
          </View>
        </View>
        <View style={styles.description}>
          <Text style={styles.label}>Description</Text>
          {/* <Text style={styles.input}>{Description}</Text> */}

          <Text style={styles.descText}>
            {Description && Description.trim() !== ''
              ? Description
              : 'No description provided'}
          </Text>

          {/* <TextInput
            style={styles.input}
            placeholder=""
            // value={item.description}
            // onChangeText={(text) =>
            //   setLeads((prev) =>
            //     prev.map((lead) =>
            //       lead.id === item.id ? { ...lead, description: text } : lead
            //     )
            //   )
            // }
          /> */}
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
                  <Text style={styles.buttonText}>{editStatus}</Text>
                  <Text style={{marginTop: 5, marginLeft: 5}}>
                    <AntDesign name="down" size={15} color={'#fff'} />
                  </Text>
                </TouchableOpacity>
              }>
              <View>
                <Menu.Item
                  onPress={() => {
                    setEditStatus('New'); // selected value
                    closeMenu();
                  }}
                  title="New"
                />
                <Divider style={{height: 1, color: 'black', width: '100%'}} />

                <Menu.Item
                  onPress={() => {
                    setEditStatus('Converted'); // selected value
                    closeMenu();
                  }}
                  title="Converted"
                />
                <Divider style={{height: 1, color: 'black', width: '100%'}} />

                <Menu.Item
                  onPress={() => {
                    setEditStatus('working'); // selected value
                    closeMenu();
                  }}
                  title="Working"
                />
              </View>
            </Menu>
          </View>
          {/* <View style={styles.button}>
            <Text style={styles.buttonText}>{status}</Text>
          </View> */}

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
    </View>
  );
};

export default CRMCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(240, 241, 245, 1)',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  filterTxt: {
    fontFamily: 'K2D-Medium',
    fontSize: 15,
    color: '#000',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 3,
    padding: 12,
    marginBottom: '5%',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: 'rgba(60, 60, 60, 1)',
  },
  company: {
    fontSize: 13,
    fontFamily: 'K2D-Bold',
    color: 'rgba(125, 125, 125, 1)',
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
    // borderTopWidth: 2,
    borderRightColor: 'grey',
    paddingTop: 10,
  },
  button: {
    height: 35,
    width: 90,
    backgroundColor: '#2F4FE3',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginTop: 4,
    // borderTopWidth: 0.5,
    // borderTopColor: "#ddd",
    paddingTop: '5%',
  },
  //   col: {
  //     flex: 1,
  //     alignItems: "flex-start",
  //   },
  label: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '3%',
    justifyContent: 'space-between',
  },
  dot: {
    // width: 8,
    // height: 8,
    // borderRadius: 4,
    // marginRight: 4,
  },
  col: {
    flex: 1,
  },
  dottedLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(170, 170, 170, 1)',
    marginVertical: 10,
    position: 'relative',
  },
  smallDot: {
    width: 7,
    height: 10,
    borderRadius: 6,
    position: 'absolute',
    marginTop: '-3%',
  },
  value: {
    fontSize: 15,
    color: 'rgba(139, 140, 144, 1)',
    fontFamily: 'K2D-Regular',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  link: {
    color: 'rgba(21, 68, 137, 1)',
    fontSize: 12,
    fontFamily: 'K2D-Medium',
  },
  separator: {
    color: 'rgba(139, 140, 144, 1)',
    fontSize: 13,
    marginHorizontal: 3,
  },
  description: {
    marginTop: '7%',
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    color: 'rgba(0, 0, 0, 1)',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'rgba(170, 170, 170, 1)',
    fontSize: 13,
    paddingVertical: '0%',
    color: '#000',
    fontFamily: 'K2D-Regular',
  },
  descText: {
    marginTop: 5,
    fontSize: 13,
    color: 'rgba(139, 140, 144, 1)',
    fontFamily: 'K2D-Regular',
    borderBottomWidth: 1,
    borderColor: 'rgba(170, 170, 170, 1)',
    paddingVertical: '1%',
  },
});
