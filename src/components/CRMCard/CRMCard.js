import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
} from 'react-native';
import { Menu, Divider } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { useUpdateLeadStatus } from '../../hooks/CRMhooks/useCRM';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CRMCard = ({
  header,
  name,
  email,
  phone,
  mail,
  dateText,
  leadId,
  status,
  count,
  interactionType,
   actOnPress,
  cellNo,
  onEdit,
  onActivity,
  priority = 'High',
  company,
  Description, // Add Description prop
}) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editStatus, setEditStatus] = useState(status);

  const updateLeadStatusMutation = useUpdateLeadStatus();
  const interaction = moment(dateText).format('DD MMM YYYY');

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleStatusUpdate = (newStatus) => {
    setEditStatus(newStatus);
    setVisible(false);
    updateLeadStatusMutation.mutate({ leadId, status: newStatus });
  };

  // Use company prop if provided, otherwise use header
  const companyName = company || header || 'No Company';

  return (
    <View style={styles.card}>
      {/* COLLAPSED VIEW */}
      <View style={styles.headerRow}>
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          {/* ADD TOUCHABLE OPACITY FOR ADDRESS LIKE IN CRMCard1 */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert('Address', 'House #24, Street 6, Green Town, Lahore')
            }>
            <View style={styles.companyRow}>
              <Text style={styles.company}>{companyName}</Text>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color="#2F4FE3"
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* RIGHT QUICK ACTIONS */}
        <View style={styles.rightActions}>
          <View style={styles.quickRow}>
            <Text style={styles.link} onPress={phone}>Call</Text>
            <Text style={styles.separator}> | </Text>
            <Text style={styles.link} onPress={mail}>E-mail</Text>
          </View>

          {/* PRIORITY */}
          <View style={styles.priorityRow}>
            <View style={styles.priorityBox} />
            <Text style={styles.priorityText}>{priority}</Text>
          </View>
        </View>
      </View>

      {/* EXPANDED CONTENT */}
      {expanded && (
        <>
          <View style={styles.infoRow}>
            <InfoCol
              title="Last Activity"
              value={interactionType || 'Email'}
              color="#EA4747"
            />
            <InfoCol
              title="Last Interaction"
              value={interaction}
              color="#E7CD4C"
            />
            <InfoCol
              title="Total Activities"
              value={count}
              color="#26BDCE"
            />
          </View>

          <View style={styles.contactInfo}>
            <ContactItem icon="email-outline" text={email || 'N/A'} />
            <ContactItem icon="phone-outline" text={cellNo || 'N/A'} />
          </View>

          {/* DESCRIPTION SECTION - Added like in the example */}
          <View style={styles.description}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.descText}>
              {Description && Description.trim() !== ''
                ? Description
                : 'No description provided'}
            </Text>
          </View>

          <View style={styles.bottomButton}>
            <View style={styles.button}>
              <Menu
                visible={visible}
                onDismiss={() => setVisible(false)}
                anchor={
                  <TouchableOpacity
                    onPress={() => setVisible(true)}
                    style={styles.menuAnchor}>
                    <Text style={styles.buttonText}>{editStatus}</Text>
                    <AntDesign name="down" size={14} color="#fff" />
                  </TouchableOpacity>
                }>
                {['New', 'Working', 'Converted', 'Expired'].map(item => (
                  <React.Fragment key={item}>
                    <Menu.Item title={item} onPress={() => handleStatusUpdate(item)} />
                    <Divider />
                  </React.Fragment>
                ))}
              </Menu>
            </View>

             <TouchableOpacity onPress={actOnPress} style={styles.button}>
                     <Text style={styles.buttonText}>Activity</Text>
                     <Ionicons name="add-outline" size={18} color={'#fff'} />
                   </TouchableOpacity>

            <TouchableOpacity onPress={onEdit} style={styles.button}>
              <Text style={styles.buttonText}>Details</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* EXPAND ARROW AT BOTTOM - ALWAYS VISIBLE */}
      <TouchableOpacity onPress={toggleExpand} style={styles.expandArrow}>
        <AntDesign
          name={expanded ? 'up' : 'down'}
          size={16}
          color="#888"
        />
      </TouchableOpacity>
    </View>
  );
};

/* ---------- SMALL COMPONENTS ---------- */

const InfoCol = ({ title, value, color }) => (
  <View style={styles.infoCol}>
    <Text style={styles.label}>{title}</Text>
    <View style={styles.line}>
      <View style={[styles.smallDot, { backgroundColor: color }]} />
    </View>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const ContactItem = ({ icon, text }) => (
  <View style={styles.contactItem}>
    <MaterialCommunityIcons name={icon} size={14} color="#2F4FE3" />
    <Text style={styles.contactText}>{text}</Text>
  </View>
);

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 5,
    marginBottom: 12,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  name: {
    fontSize: 13,
    fontFamily: 'K2D-SemiBold',
    color: '#3C3C3C',
  },
  // ADDED COMPANY ROW STYLES
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  company: {
    fontSize: 12,
    fontFamily: 'K2D-Bold',
    color: '#7D7D7D',
    marginRight: 5,
  },

  rightActions: {
    alignItems: 'flex-end',
  },
  quickRow: {
    flexDirection: 'row',
  },
  link: {
    color: '#154489',
    fontSize: 11,
  },
  separator: {
    marginHorizontal: 4,
    color: '#999',
  },

  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityBox: {
    width: 10,
    height: 10,
    backgroundColor: '#EA4747',
    marginRight: 6,
  },
  priorityText: {
    fontSize: 11,
    color: '#666',
  },

  infoRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 12,
  },
  infoCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
  },
  line: {
    height: 1,
    backgroundColor: '#AAA',
    marginVertical: 6,
  },
  smallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -3,
  },
  value: {
    fontSize: 12,
    color: '#8B8C90',
  },

  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#555',
  },

  // DESCRIPTION SECTION STYLES - Added like in the example
  description: {
    marginTop: 12,
    marginBottom: 5,
  },
  descText: {
    marginTop: 4,
    fontSize: 12,
    color: '#8B8C90',
    fontFamily: 'K2D-Regular',
    borderBottomWidth: 1,
    borderColor: '#AAA',
    paddingBottom: 8,
  },

  bottomButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    paddingTop: 4,
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
  menuAnchor: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  expandArrow: {
    alignItems: 'center',
  },
});

export default CRMCard;