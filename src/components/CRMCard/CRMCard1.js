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
import { useUpdateLeadStatus } from '../../hooks/CRMhooks/useCRM';

const CRMCard1 = ({
  header,
  name,
  email,
  mail,
  phone,
  onPress,
  dateText,
  actOnPress,
  leadId,
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
    
    updateLeadStatusMutation.mutate({
      leadId,
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
                size={14}
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
            size={14}
            color={'#2F4FE3'}
          />
          <Text style={styles.contactText}>{email || 'N/A'}</Text>
        </View>
        <View style={styles.contactItem}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={14}
            color={'#2F4FE3'}
          />
          <Text style={styles.contactText}>{cellNo || 'N/A'}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomButton}>
        <View style={styles.button}>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            style={{ marginTop: 48, marginLeft: 12 }}
            anchor={
              <TouchableOpacity
                onPress={openMenu}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.buttonText}>{editStatus}</Text>
                <AntDesign name="down" size={14} color={'#fff'} />
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
            <Divider />
            <Menu.Item
              onPress={() => handleStatusUpdate('Expired')}
              title="Expired"
            />
          </Menu>
        </View>

        <TouchableOpacity onPress={actOnPress} style={styles.button}>
          <Text style={styles.buttonText}>Activity</Text>
          <Ionicons name="add-outline" size={18} color={'#fff'} />
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
    padding: 10,
    marginBottom: 10,
    shadowColor: 'rgba(0, 0, 0, 0.25)',
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    minHeight: 145,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 11,
    fontFamily: 'K2D-Medium',
  },
  separator: {
    color: 'rgba(139, 140, 144, 1)',
    fontSize: 12,
    marginHorizontal: 3,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  company: {
    fontSize: 12,
    fontFamily: 'K2D-Bold',
    color: 'rgba(125, 125, 125, 1)',
    marginRight: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 1)',
    fontFamily: 'K2D-Medium',
  },
  dottedLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(170, 170, 170, 1)',
    marginVertical: 8,
    position: 'relative',
  },
  smallDot: {
    width: 6,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    marginTop: '-3%',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  value: {
    fontSize: 13,
    color: 'rgba(139, 140, 144, 1)',
    fontFamily: 'K2D-Regular',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
  },
  contactItem: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  contactText: {
    color: '#555',
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    paddingHorizontal: 6,
  },
  bottomButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingTop: 8,
  },
  button: {
    height: 32,
    width: 85,
    backgroundColor: '#2F4FE3',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'K2D-Medium',
    fontSize: 12,
  },
});

export default CRMCard1;