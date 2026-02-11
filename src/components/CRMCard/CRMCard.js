// components/CRMCard/CRMCard.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { useQueryClient } from 'react-query';

const STATUS_CONFIG = {
  New: {
    barColor: '#2ECC71',
    badgeText: 'New',
    badgeBg: '#EAF8F0',
    badgeColor: '#2ECC71',
    showDot: true,
  },
  Working: {
    barColor: '#F4A623',
    badgeText: 'Working',
    badgeBg: '#FFF3E0',
    badgeColor: '#F4A623',
    showDot: true,
  },
  Converted: {
    barColor: '#4A6CF7',
    badgeText: 'Converted',
    badgeBg: '#EEF1FF',
    badgeColor: '#4A6CF7',
    showDot: false,
    showCheck: true,
  },
  Expired: {
    barColor: '#EA4747',
    badgeText: 'Expired',
    badgeBg: '#FDECEC',
    badgeColor: '#EA4747',
    showDot: true,
  },
};

const CRMCard = ({
  leadId,
  name,
  header,
  status: propStatus = 'New',
  interactionType,
  dateText,
  phone,
  mail,
  actOnPress,
  onPress,
  email,
  count,
  Description,
  company,
}) => {
  const queryClient = useQueryClient();
  const [currentStatus, setCurrentStatus] = useState(propStatus);

  // Subscribe to query cache changes
  useEffect(() => {
    const updateStatusFromCache = () => {
      if (!leadId) return;

      // Try to get from main leads cache
      const cachedLeads = queryClient.getQueryData(['leads']);
      if (Array.isArray(cachedLeads)) {
        const cachedLead = cachedLeads.find(lead => 
          lead.id === leadId || lead.AD_User_ID?.id === leadId
        );
        if (cachedLead?.LeadStatus?.identifier) {
          setCurrentStatus(cachedLead.LeadStatus.identifier);
          return;
        }
      }

      // Try to get from status-specific caches
      const statuses = ['New', 'Working', 'Converted', 'Expired'];
      for (const status of statuses) {
        const cachedStatusLeads = queryClient.getQueryData(['leads', { status }]);
        if (Array.isArray(cachedStatusLeads)) {
          const cachedLead = cachedStatusLeads.find(lead => 
            lead.id === leadId || lead.AD_User_ID?.id === leadId
          );
          if (cachedLead?.LeadStatus?.identifier) {
            setCurrentStatus(cachedLead.LeadStatus.identifier);
            return;
          }
        }
      }
      
      setCurrentStatus(propStatus);
    };

    // Initial update
    updateStatusFromCache();

    // Subscribe to query cache changes
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'leads') {
        updateStatusFromCache();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [leadId, queryClient, propStatus]);

  const statusUI = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.New;

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View
            style={[
              styles.statusBar,
              { backgroundColor: statusUI.barColor },
            ]}
          />

          <Image
            source={{
              uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            }}
            style={styles.avatar}
          />

          <View style={styles.center}>
            <Text style={styles.name}>{name || 'No Name'}</Text>
            <Text style={styles.company}>{header || company || 'No Company'}</Text>

            <Text style={styles.lastText}>
              Last: {interactionType || 'No Activity'} ·{' '}
              {dateText ? moment(dateText).fromNow() : 'No Date'}
            </Text>
          </View>

          <View style={styles.right}>
            <View
              style={[
                styles.badge,
                { backgroundColor: statusUI.badgeBg },
              ]}>
              {statusUI.showDot && (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: statusUI.badgeColor },
                  ]}
                />
              )}
              {statusUI.showCheck && (
                <AntDesign
                  name="checkcircle"
                  size={14}
                  color={statusUI.badgeColor}
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.badgeText,
                  { color: statusUI.badgeColor },
                ]}>
                {statusUI.badgeText}
              </Text>
            </View>

            <View style={styles.iconRow}>
              {phone && (
                <TouchableOpacity onPress={phone}>
                  <Ionicons
                    name="call-outline"
                    size={18}
                    color="#2F4FE3"
                  />
                </TouchableOpacity>
              )}

              {mail && (
                <TouchableOpacity onPress={mail}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="#2F4FE3"
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={actOnPress}>
                <View style={styles.addActivity}>
                  <Ionicons
                    name="alarm-outline"
                    size={18}
                    color="#2F4FE3"
                  />
                  <AntDesign
                    name="pluscircle"
                    size={10}
                    color="#2F4FE3"
                    style={styles.plus}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingRight: 10,
  },
  statusBar: {
    width: 5,
    height: '100%',
    marginRight: 10,
    borderRadius: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  center: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontFamily: 'K2D-SemiBold',
    color: '#000',
  },
  company: {
    fontSize: 12,
    fontFamily: 'K2D-Medium',
    color: '#777',
  },
  lastText: {
    fontSize: 11,
    fontFamily: 'K2D-Regular',
    color: '#999',
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'K2D-Medium',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addActivity: {
    position: 'relative',
  },
  plus: {
    position: 'absolute',
    right: -5,
    bottom: -5,
  },
});

export default CRMCard;