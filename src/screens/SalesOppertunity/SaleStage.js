import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SaleStage = () => {
  const [stages, setStages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fetch current user ID from AsyncStorage
  useEffect(() => {
    const getUserId = async () => {
      const userId = await AsyncStorage.getItem('userId'); // stored user ID
      setCurrentUserId(userId);
    };
    getUserId();
  }, []);

  // Fetch stages dynamically with token and per-user filter
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        let url =
          'http://116.58.53.114:9999/api/v1/models/C_SalesStage?$select=name';

        // Only fetch stages created by current user
        if (currentUserId) {
          url += `&$filter=CreatedBy eq ${currentUserId}`;
        }

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userStages = res.data.records || [];

        // If no stages defined by user, optionally show default stages
        if (userStages.length === 0) {
          setStages([{id: 0, Name: 'Default Stage'}]);
        } else {
          setStages(userStages);
        }
      } catch (err) {
        console.error(
          'Error fetching stages:',
          err.response?.data || err.message,
        );
      }
    };
    fetchStages();
  }, [currentUserId]);

  // Handle card click → fetch opportunities
  // const handleStageClick = async stageId => {
  //   setSelectedStageId(stageId);
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     const res = await axios.get(
  //       `https://uactros.myinfinityerp.com:443/api/v1/models/C_Opportunity?$filter=C_SalesStage_ID eq ${stageId}`,
  //       {
  //         headers: {Authorization: `Bearer ${token}`},
  //       },
  //     );
  //     setOpportunities(res.data.records || []);
  //   } catch (err) {
  //     console.error(
  //       'Error fetching opportunities:',
  //       err.response?.data || err.message,
  //     );
  //   }
  // };
  const handleStageClick = async stageId => {
    setSelectedStageId(stageId);
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `https://uactros.myinfinityerp.com:443/api/v1/models/C_Opportunity?$filter=C_SalesStage_ID eq ${stageId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      // Make sure opportunities is always an array
      if (Array.isArray(res.data.records)) {
        setOpportunities(res.data.records);
      } else {
        setOpportunities([]); // fallback
      }
    } catch (err) {
      console.error(
        'Error fetching opportunities:',
        err.response?.data || err.message,
      );
      setOpportunities([]); // fallback in case of error
    }
  };

  const renderStageCard = ({item}) => {
    const isActive = selectedStageId === item.id;
    return (
      <TouchableOpacity
        style={[styles.card, isActive && styles.activeCard]}
        onPress={() => handleStageClick(item.id)}>
        <View style={styles.topWrapper}>
          <Text style={styles.cardText}>{item.Name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // const renderOpportunity = ({item}) => (
  //   <View style={styles.opportunityCard}>
  //     <Text style={styles.opportunityText}>Document No: {item.DocumentNo}</Text>
  //     <Text style={styles.opportunityText}>
  //       Client: {item.C_BPartner_ID?.identifier}
  //     </Text>
  //     <Text style={styles.opportunityText}>Amount: {item.OpportunityAmt}</Text>
  //     <Text style={styles.opportunityText}>
  //       Expected Close: {item.ExpectedCloseDate}
  //     </Text>
  //   </View>
  // );
  const renderOpportunity = ({item}) => {
    // Only render if item is an object
    if (typeof item !== 'object') return null;

    return (
      <View style={styles.opportunityCard}>
        <Text style={styles.opportunityText}>
          Document No: {item.DocumentNo || 'N/A'}
        </Text>
        <Text style={styles.opportunityText}>
          Client: {item.C_BPartner_ID?.identifier || 'N/A'}
        </Text>
        <Text style={styles.opportunityText}>
          Amount: {item.OpportunityAmt || 'N/A'}
        </Text>
        <Text style={styles.opportunityText}>
          Expected Close: {item.ExpectedCloseDate || 'N/A'}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Sales Stages</Text>

      <FlatList
        data={stages}
        horizontal
        keyExtractor={item => item.id.toString()}
        renderItem={renderStageCard}
        contentContainerStyle={styles.cardList}
        showsHorizontalScrollIndicator={false}
      />

      {selectedStageId && (
        <>
          <Text style={styles.heading}>Opportunities</Text>
          {opportunities.length > 0 ? (
            <FlatList
              data={opportunities}
              keyExtractor={item => item.id.toString()}
              renderItem={renderOpportunity}
              contentContainerStyle={styles.opportunityList}
            />
          ) : (
            <Text style={styles.noData}>No opportunities in this stage.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 10, backgroundColor: '#f5f5f5'},
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  cardList: {paddingVertical: 10},
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginRight: 10,
    borderRadius: 8,
    elevation: 2,
  },
  activeCard: {backgroundColor: '#4CAF50'},
  cardText: {fontSize: 16, fontWeight: 'bold', color: '#000'},
  opportunityList: {paddingVertical: 10},
  opportunityCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
  },
  opportunityText: {fontSize: 14, marginBottom: 3, color: '#333'},
  noData: {textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray'},
});

export default SaleStage;
