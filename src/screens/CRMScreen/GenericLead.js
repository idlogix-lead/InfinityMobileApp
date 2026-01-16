// screens/CRM/GenericLeadScreen.js
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomHeader from '../../components/CustomHeader';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CRMCard from '../../components/CRMCard/CRMCard';
import { useFollowups } from '../../hooks/CRMhooks/useCRM';
import { useLeadActions } from '../../hooks/CRMhooks/useLeadActions';
import moment from 'moment';

const GenericLead = ({ 
  navigation, 
  route, 
  screenTitle,
  leadFilter,
  statsConfig
}) => {
  const { data: followups = [] } = useFollowups();
  const { handleMail, handlePhone, handleWhatsApp } = useLeadActions();
  
  // Get leads from route params
  const leads = route.params?.leads || [];
  const activities = route.params?.activities || followups;
  
  // Calculate stats
  const stats = useMemo(() => {
    if (!leads.length) {
      return {
        todayLeads: 0,
        monthLeads: 0,
        totalLeads: 0,
      };
    }
    
    const todayLeads = leads.filter(lead => 
      moment(lead.Created).isSame(moment(), 'day')
    ).length;
    
    const monthLeads = leads.filter(lead => 
      moment(lead.Created).isSame(moment(), 'month')
    ).length;
    
    return {
      todayLeads,
      monthLeads,
      totalLeads: leads.length,
    };
  }, [leads]);
  
  const renderLeadCard = (item) => {
    const userActivity = activities.filter(
      act => act?.AD_User_ID?.id === item?.id
    );
    
    const lastActivity = [...userActivity].sort(
      (a, b) => new Date(b.Created) - new Date(a.Created)
    )[0];
    
    const lastActivityType = lastActivity?.ContactActivityType?.identifier || 'N/A';
    const activityCount = userActivity.length;
    
    return (
      <View style={{ marginHorizontal: 10, marginVertical: 5 }}>
        <CRMCard
          header={item.AD_Org_ID?.identifier || item.AD_Client_ID?.identifier}
          name={item?.Name}
          email={item?.EMail}
          cellNo={item?.Phone}
          count={activityCount}
          interactionType={lastActivityType}
          status={item?.LeadStatus?.identifier}
          Description={item?.Description}
          mail={() => handleMail(item?.EMail)}
          phone={() => handlePhone(item?.Phone)}
          whatsapp={() => handleWhatsApp(item?.Phone)}
          dateText={item?.Updated || item?.Created}
          actOnPress={() => {
            navigation.navigate('ActivityList', {
              data: item,
              mode: 'create',
            });
          }}
          onPress={() => {
            navigation.navigate('LeadsDetails', { data: item });
          }}
        />
      </View>
    );
  };
  
  return (
    <Provider>
      <View style={{ flex: 1 }}>
        
        <View style={styles.main}>
          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialIcons
                  name="article"
                  size={20}
                  color="rgba(38, 189, 206, 1)"
                />
              </View>
              <Text style={styles.statLabel}>Today Leads</Text>
              <Text style={styles.statValue}>{stats.todayLeads}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialIcons
                  name="calendar-month"
                  size={20}
                  color="rgba(234, 71, 71, 1)"
                />
              </View>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValue}>{stats.monthLeads}</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconWrapper}>
                <MaterialCommunityIcons
                  name="file-account"
                  size={20}
                  color="rgba(231, 205, 76, 1)"
                />
              </View>
              <Text style={styles.statLabel}>All Leads</Text>
              <Text style={styles.statValue}>{stats.totalLeads}</Text>
            </View>
          </View>
          
          {/* Leads List */}
          <FlatList
            data={leads}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={({ item }) => renderLeadCard(item)}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No leads found
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
        
        {/* Floating Action Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AddLeads')}
          style={styles.floatingButton}>
          <Text style={styles.floatingButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    marginTop: -22,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  statsContainer: {
    backgroundColor: '#F5F5F5',
    height: 110,
    marginTop: '5%',
    marginHorizontal: 22,
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#000',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.10)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconWrapper: {
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: 'K2D-Medium',
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: 'K2D-SemiBold',
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'K2D-Medium',
  },
  listContent: {
    paddingBottom: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2F4FE3',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: '#fff',
    fontFamily: 'K2D-Bold',
    fontSize: 20,
  },
});

export default GenericLead;