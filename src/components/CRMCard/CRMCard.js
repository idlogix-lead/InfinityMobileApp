// components/CRMCard/CRMCard.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useUpdateLeadStatus } from '../../hooks/CRMhooks/useCRM'; // You'll need to create this hook

const CRMCard = ({
  header,
  name,
  email,
  mail,
  phone,
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
  
  const updateLeadStatusMutation = useUpdateLeadStatus();
  
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);
  
  const interaction = moment(dateText).format('DD MMM YYYY');
  
  const handleStatusUpdate = (newStatus) => {
    setEditStatus(newStatus);
    closeMenu();
    
    // Update lead status via API
    updateLeadStatusMutation.mutate({
      id,
      status: newStatus,
    });
  };
  
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
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          }}
          style={styles.avatar}
        />
        <View style={styles.headerContent}>
          <View style={styles.nameRow}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert('House #24, Street 6, Green Town, Lahore')
              }>
              <Text style={styles.name}>{name}</Text>
            </TouchableOpacity>
            <View style={styles.contactLinks}>
              <TouchableOpacity onPress={phone}>
                <Text style={styles.link}>Call</Text>
              </TouchableOpacity>
              <Text style={styles.separator}> \ </Text>
              <TouchableOpacity onPress={mail}>
                <Text style={styles.link}>E-mail</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Office #12, Floor 3, XYZ Plaza, Faisalabad')
            }>
            <View style={styles.companyRow}>
              <Text style={styles.company}>{header}</Text>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={15}
                color={'#2F4FE3'}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Row */}
      <View style={styles.infoRow}>
        {cols.map((col, index) => (
          <View key={index} style={[styles.col, { alignItems: col.align }]}>
            <Text style={styles.label}>{col.title}</Text>
            <View style={styles.dottedLine}>
              <View style={[styles.smallDot, { backgroundColor: col.dotColor }]} />
            </View>
            {col.content}
          </View>
        ))}
      </View>

      {/* Contact Info */}
      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <MaterialCommunityIcons
            name="email-outline"
            size={15}
            color={'#2F4FE3'}
          />
          <Text style={styles.contactText}>{email || 'N/A'}</Text>
        </View>
        <View style={styles.contactItem}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={15}
            color={'#2F4FE3'}
          />
          <Text style={styles.contactText}>{cellNo || 'N/A'}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.description}>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.descText}>
          {Description && Description.trim() !== ''
            ? Description
            : 'No description provided'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomButton}>
        <View style={styles.button}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            style={{ marginTop: 55, marginLeft: 15 }}
            anchor={
              <TouchableOpacity
                onPress={openMenu}
                style={{ flexDirection: 'row' }}>
                <Text style={styles.buttonText}>{editStatus}</Text>
                <AntDesign name="down" size={15} color={'#fff'} />
              </TouchableOpacity>
            }>
            <Menu.Item
              onPress={() => handleStatusUpdate('New')}
              title="New"
            />
            <Divider />
            <Menu.Item
              onPress={() => handleStatusUpdate('Converted')}
              title="Converted"
            />
            <Divider />
            <Menu.Item
              onPress={() => handleStatusUpdate('Working')}
              title="Working"
            />
          </Menu>
        </View>

        <TouchableOpacity onPress={actOnPress} style={styles.button}>
          <Text style={styles.buttonText}>Activity</Text>
          <Ionicons name="add-outline" size={20} color={'#fff'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  headerContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: 'rgba(60, 60, 60, 1)',
  },
  contactLinks: {
    flexDirection: 'row',
    alignItems: 'center',
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
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  company: {
    fontSize: 13,
    fontFamily: 'K2D-Bold',
    color: 'rgba(125, 125, 125, 1)',
    marginRight: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: '5%',
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '3%',
  },
  value: {
    fontSize: 15,
    color: 'rgba(139, 140, 144, 1)',
    fontFamily: 'K2D-Regular',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '7%',
    paddingVertical: '3%',
    borderRadius: 6,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
  },
  contactItem: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    paddingHorizontal: '4%',
  },
  contactText: {
    color: '#555',
    fontSize: 13,
    fontFamily: 'K2D-Medium',
    paddingHorizontal: '3%',
  },
  description: {
    marginTop: '7%',
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
  bottomButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
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
});

export default CRMCard;