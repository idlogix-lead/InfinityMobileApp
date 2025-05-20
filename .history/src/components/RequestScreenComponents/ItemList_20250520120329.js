import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import EvilIcons from 'react-native-vector-icons/dist/EvilIcons';
import Entypo from 'react-native-vector-icons/dist/Entypo';
import Octicons from 'react-native-vector-icons/dist/Octicons';
import FontAwesome5 from 'react-native-vector-icons/dist/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import SimpleLineIcons from 'react-native-vector-icons/dist/SimpleLineIcons';
import NameContainer from '../HomeScreenComponents/NameContainer';
import {baseGestureHandlerProps} from 'react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon';

const {width, height} = Dimensions.get('window');

const ItemList = ({
  onPress,
  name,
  startDate,
  endDate,
  Name,
  ProjectName,
  BusinessName,
  User_Contact,
  campaignName,
  Assets,
  Invoice,
  order,
  payment,
  shipment,
  RMA,
  backgroundColorDot,
  onPressMain,
  Idnumber,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handlePress = item => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <TouchableOpacity style={styles.itemCon} onPress={onPressMain}>
      <View style={[styles.taskStatusContainer]}>
        {/* Dot and Task Name */}
        <View style={styles.dotTaskContainer}>
          <View
            style={[
              styles.dotView,
              {backgroundColor: backgroundColorDot},
            ]}></View>
          <Text style={styles.idStyle}>#{Idnumber}</Text>
          <View style={styles.verticalLineStyle}></View>
          <Text style={styles.cardNameStyle}>{name}</Text>
        </View>
      </View>

      {/*  start Date show  */}
      <View style={{flexDirection: 'row', width: '93.5%', alignSelf: 'center'}}>
        <View style={styles.dateContainer}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <EvilIcons name="calendar" size={20} color="#000" />
            <Text style={{color: 'black', fontSize: 12, fontWeight: '500'}}>
              Start Date:
            </Text>
          </View>
          <Text style={{color: 'black', paddingLeft: '6%', fontSize: 12}}>
            {startDate}
          </Text>
        </View>
        {/* End Date Show */}
        <View style={[styles.dateContainer, {paddingLeft: '5%'}]}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <EvilIcons name="calendar" size={20} color="#000" />
            <Text style={{color: 'black', fontSize: 12, fontWeight: '500'}}>
              End Date:
            </Text>
          </View>
          <Text style={{color: 'black', paddingLeft: '6%', fontSize: 12}}>
            {endDate}
          </Text>
        </View>
      </View>

      {/* All data Display in screen */}

      <ScrollView
        horizontal
        style={{width: '95%', alignSelf: 'center', marginTop: '2%'}}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{paddingRight: '105%'}}>
        {Name && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Product', value: Name})}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <SimpleLineIcons name="social-dropbox" size={14} color="#FFF" />
                <Text style={[styles.lableStyle, {paddingLeft: '2%'}]}>
                  Product:
                </Text>
              </View>
              <Text
                style={[styles.textStyle, {flexShrink: 1}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {Name}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {ProjectName && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Project', value: ProjectName})}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Octicons name="project" size={14} color="#FFF" />
              <Text style={[styles.lableStyle, {flexShrink: 1}]}>Project:</Text>
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.textStyle}>
              {ProjectName}
            </Text>
          </TouchableOpacity>
        )}

        {BusinessName && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() =>
              handlePress({title: 'Business Name', value: BusinessName})
            }>
            <View>
              <Text style={styles.lableStyle}>Business Name:</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {BusinessName}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {User_Contact && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() =>
              handlePress({title: 'User Contact', value: User_Contact})
            }>
            <View>
              <Text style={styles.lableStyle}>User Contact:</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {User_Contact}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {campaignName && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() =>
              handlePress({title: 'Campaign', value: campaignName})
            }>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Entypo name="megaphone" size={14} color="#FFF" />
                <Text style={styles.lableStyle}>Campaign:</Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {campaignName}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {Assets && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Assets', value: Assets})}>
            <View>
              <Text style={styles.lableStyle}>Assets:</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {Assets}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {Invoice && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Invoice', value: Invoice})}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FontAwesome5 name="file-invoice" size={14} color="#FFF" />
                <Text style={styles.lableStyle}>Invoice:</Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {Invoice}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {order && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Order', value: order})}>
            <View>
              <Text style={styles.lableStyle}>Order:</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {order}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {payment && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Payment', value: payment})}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <MaterialIcons name="payments" size={14} color="#FFF" />
                <Text style={styles.lableStyle}>Payment:</Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {payment}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {shipment && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Shipment', value: shipment})}>
            <View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <FontAwesome5 name="shipping-fast" size={14} color="#FFF" />
                <Text style={styles.lableStyle}>Shipment:</Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {shipment}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {RMA && (
          <TouchableOpacity
            style={styles.NameContainer}
            onPress={() => handlePress({title: 'Sale Return', value: RMA})}>
            <View>
              <Text style={styles.lableStyle}>Sale Return:</Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.textStyle}>
                {RMA}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FlatList Modal Show */}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View
              style={{
                backgroundColor: '#D3D3D3',
                height: '10%',
                borderRadius: 10,
                padding: '1%',
              }}>
              <TouchableOpacity
                style={{color: 'black'}}
                onPress={() => setModalVisible(false)}>
                <Entypo
                  name="cross"
                  size={24}
                  color="#888"
                  style={{alignSelf: 'flex-end'}}
                />
              </TouchableOpacity>
              {/* <Text style={styles.txt}>Set Status</Text> */}
              <View style={[styles.modalView, {paddingHorizontal: '10%'}]}>
                <Text style={styles.txt}>{selectedItem?.title}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '300',
                    color: '#000',
                    marginBottom: 10,
                  }}>
                  {selectedItem?.value}
                </Text>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Detail View */}
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btnSty} onPress={onPress}>
          <Text style={{color: 'black', fontSize: 12}}> Details </Text>
          <Entypo
            name="chevron-right"
            size={12}
            color="#000"
            style={{alignSelf: 'center', marginTop: '4%'}}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.lineStyle} />
    </TouchableOpacity>
  );
};

export default ItemList;
const styles = StyleSheet.create({
  itemCon: {
    borderRadius: 7,
  },
  idStyle: {
    paddingLeft: '1%',
    color: '#000',
    fontSize: 15,
    fontWeight: 600,
  },
  verticalLineStyle: {
    marginHorizontal: width * 0.01,
    height: 20,
    width: width * 0.004,
    backgroundColor: '#D3D3D3',
  },
  cardNameStyle: {
    color: '#000',
    fontSize: 15,
    alignSelf: 'center',
    paddingLeft: 3,
    fontWeight: 600,
  },
  dateContainer: {
    marginTop: '2%',
  },
  btnSty: {
    backgroundColor: '#f5f5f5',
    padding: 3,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btnContainer: {
    alignSelf: 'center',
    width: '90%',
    marginTop: '3%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: '1%',
  },
  lineStyle: {
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
    width: '100%',
  },
  NameContainer: {
    backgroundColor: '#002E62',
    marginRight: 2,
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    marginTop: '0.2%',
    width: '25%',
    height: '60%',
    overflow: 'hidden',
  },
  lableStyle: {color: '#fff', fontSize: 12},
  textStyle: {
    color: '#fff',
    fontSize: 10,
    alignSelf: 'center',
    flexShrink: 1, // Text shrink karne ke liye
    width: '100%', // Ensure karega ke text properly fit ho
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
  },
  modalView: {
    width: '90%',
    height: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  txt: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'K2D-Regular',
    fontWeight: '700',
  },
  btn: {
    backgroundColor: 'white',
    height: '12%',
    width: '80%',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  txtBtn: {
    color: '#00B0F0',
    fontSize: 20,
    fontFamily: 'K2D-Regular',
  },
  dotView: {
    width: width * 0.03, // Responsive dot size
    height: width * 0.03,
    borderRadius: width * 0.015,
  },
  idText: {
    paddingLeft: width * 0.01,
    color: '#000',
    fontSize: width * 0.04, // Responsive font size
    fontWeight: '600',
  },
  separator: {
    height: '100%',
    width: width * 0.003, // Responsive width
    marginLeft: width * 0.03, // Responsive margin
  },
  nameText: {
    color: '#000',
    fontSize: width * 0.04, // Responsive font size
    alignSelf: 'center',
    paddingLeft: width * 0.01,
    fontWeight: '600',
  },

  taskStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.01, // Responsive padding
    paddingHorizontal: width * 0.03,
  },
  dotTaskContainer: {
    flexDirection: 'row',
    padding: width * 0.01,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: height * 0.05,
  },
});
