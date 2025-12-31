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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

const stageIcons = [
  {name: 'update', lib: MaterialIcons},
  {name: 'rocket-outline', lib: Ionicons},
  {name: 'trending-up', lib: MaterialIcons},
  {name: 'checkmark-done', lib: Ionicons},
  {name: 'hourglass-empty', lib: MaterialIcons},
  {name: 'alarm-outline', lib: Ionicons},
];
const BASE_URL = 'http://116.58.53.114:9999/api/v1/models';

const SalesStages = () => {
  const [stages, setStages] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchStagesAndCounts = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.warn('Token not found in AsyncStorage');
          return;
        }

        // 1) fetch stages
        const stageRes = await axios.get(
          `${BASE_URL}/C_SalesStage?$select=name`,
          {headers: {Authorization: `Bearer ${token}`}},
        );
        const stageList = stageRes.data.records || [];

        // 2) for each stage fetch minimal opportunities to get count
        setLoadingCounts(true);
        const withCounts = await Promise.all(
          stageList.map(async stage => {
            try {
              // fetch minimal fields only to reduce payload (DocumentNo chosen)
              const oppRes = await axios.get(
                `http://116.58.53.114:9999/api/v1/models/C_Opportunity?$select=DocumentNo&$filter=C_SalesStage_ID eq ${stage.id}`,
                {headers: {Authorization: `Bearer ${token}`}},
              );

              const records = oppRes.data.records;
              const count = Array.isArray(records) ? records.length : 0;
              return {...stage, count};
            } catch (err) {
              console.warn(
                `Count fetch failed for stage ${stage.id}`,
                err.message,
              );
              return {...stage, count: 0};
            }
          }),
        );
        setStages(withCounts);
        setLoadingCounts(false);
      } catch (err) {
        console.error(
          'Error fetching stages:',
          err.response?.data || err.message,
        );
      }
    };

    fetchStagesAndCounts();
  }, []);

  // Fetch Opportunities on click
  // const handleStageClick = async stageId => {
  //   setSelectedStageId(stageId);
  //   try {
  //     const token = await AsyncStorage.getItem('token');
  //     if (!token) {
  //       console.warn('Token not found');
  //       setOpportunities([]);
  //       return;
  //     }
  //     const res = await axios.get(
  //       `http://116.58.53.114:9999/api/v1/models/C_Opportunity?$filter=C_SalesStage_ID eq ${stageId}`,
  //       {headers: {Authorization: `Bearer ${token}`}},
  //     );
  //     const recs = res.data.records;
  //     setOpportunities(Array.isArray(recs) ? recs : []);
  //   } catch (err) {
  //     console.error(
  //       'Error fetching opportunities:',
  //       err.response?.data || err.message,
  //     );
  //     setOpportunities([]);
  //   }
  // };
  const handleStageClick = async stageId => {
    // const userId = await AsyncStorage.getItem('userId');
    // const token = await AsyncStorage.getItem('token');
    setSelectedStageId(stageId);
    try {
      // const protocol = await AsyncStorage.getItem('protocol');
      // const host = await AsyncStorage.getItem('host');
      // const port = await AsyncStorage.getItem('port');
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('Token not found');
        return;
      }

      const res = await axios.get(
        `http://116.58.53.114:9999/api/v1/models/C_Opportunity?$filter=C_SalesStage_ID eq ${stageId}`,
        {headers: {Authorization: `Bearer ${token}`}},
      );

      const records = Array.isArray(res.data.records) ? res.data.records : [];

      navigation.navigate('SaleStageDetails', {
        stageId,
        opportunities: records,
      });
    } catch (err) {
      console.error('Error fetching opportunities:', err.message);
    }
  };

  const renderStageCard = ({item, index}) => {
    const Icon = stageIcons[index % stageIcons.length].lib;
    const iconName = stageIcons[index % stageIcons.length].name;
    const isActive = selectedStageId === item.id;

    return (
      <View style={styles.gridContainer}>
        <TouchableOpacity
          style={[styles.leadCard, isActive && styles.activeCard]}
          onPress={() => handleStageClick(item.id)}>
          <View style={styles.leadWrapperTop}>
            <View style={styles.leadIconWrapper}>
              <Icon name={iconName} size={16} color="#000" />
            </View>
            <Text style={styles.leadTitle}>{item.Name}</Text>
          </View>

          <View style={styles.leadWrapperEnd}>
            <Text style={styles.leadSub}>Number of opportunities</Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof item.count === 'number' ? item.count : 0}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOpportunity = ({item}) => (
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

  return (
    // <ScrollView style={styles.container}>
    //   <Text style={styles.heading}>Sales Stages</Text>

    //   {loadingCounts ? (
    //     <Text style={{margin: 8, color: '#ccc'}}>Loading states...</Text>
    //   ) : null}
    //    <View style={styles.cardList}>
    //     <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
    //       {stages.map((item, index) => {
    //         const Icon = stageIcons[index % stageIcons.length].lib;
    //         const iconName = stageIcons[index % stageIcons.length].name;
    //         const isActive = selectedStageId === item.id;

    //         return (
    //           <View style={styles.gridContainer} key={item.id}>
    //             <TouchableOpacity
    //               style={[styles.leadCard, isActive && styles.activeCard]}
    //               onPress={() => handleStageClick(item.id)}>
    //               <View style={styles.leadWrapperTop}>
    //                 <View style={styles.leadIconWrapper}>
    //                   <Icon name={iconName} size={16} color="#000" />
    //                 </View>
    //                 <Text style={styles.leadTitle}>{item.Name}</Text>
    //               </View>

    //               <View style={styles.leadWrapperEnd}>
    //                 <Text style={styles.leadSub}>Number of opportunities</Text>

    //                 <View style={styles.badge}>
    //                   <Text style={styles.badgeText}>
    //                     {typeof item.count === 'number' ? item.count : 0}
    //                   </Text>
    //                 </View>
    //               </View>
    //             </TouchableOpacity>
    //           </View>
    //         );
    //       })}
    //     </View>
    //   </View>

    //   {selectedStageId && (
    //     <>

    //       {opportunities.length > 0 ? (
    //         <FlatList
    //           data={opportunities}
    //           keyExtractor={item => item.id.toString()}
    //           renderItem={renderOpportunity}
    //           contentContainerStyle={styles.opportunityList}
    //         />
    //       ) : (
    //         <Text style={styles.noData}>No opportunities in this stage.</Text>
    //       )}
    //     </>
    //   )}
    // </ScrollView>
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Sales Stages</Text>

      {loadingCounts ? (
        <Text style={{margin: 8, color: '#ccc'}}>Loading stages...</Text>
      ) : stages.length === 0 ? (
        <Text style={styles.noData}>No sales stage found.</Text>
      ) : (
        <View style={styles.cardList}>
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {stages.map((item, index) => {
              const Icon = stageIcons[index % stageIcons.length].lib;
              const iconName = stageIcons[index % stageIcons.length].name;
              const isActive = selectedStageId === item.id;

              return (
                <View style={styles.gridContainer} key={item.id}>
                  <TouchableOpacity
                    style={[styles.leadCard, isActive && styles.activeCard]}
                    onPress={() => handleStageClick(item.id)}>
                    <View style={styles.leadWrapperTop}>
                      <View style={styles.leadIconWrapper}>
                        <Icon name={iconName} size={16} color="#000" />
                      </View>
                      <Text style={styles.leadTitle}>{item.Name}</Text>
                    </View>

                    <View style={styles.leadWrapperEnd}>
                      <Text style={styles.leadSub}>
                        Number of opportunities
                      </Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {typeof item.count === 'number' ? item.count : 0}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {selectedStageId && (
        <>
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
  cardList: {paddingVertical: 6},
  // gridContainer: {flex: 1, margin: 6},
  // leadCard: {
  //   backgroundColor: '#fff',
  //   width: '100%',
  //   borderRadius: 8,
  //   padding: 10,
  //   elevation: 3,
  //   height: 115,
  // },
  gridContainer: {
    width: '50%',
    maxWidth: '50%',
    flexBasis: '50%',
    padding: 6,
  },
  leadCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    elevation: 3,
    height: 115,
  },

  activeCard: {backgroundColor: '#e6e6e6'},
  leadWrapperTop: {flexDirection: 'row', alignItems: 'center', gap: 8},
  leadIconWrapper: {
    backgroundColor: '#fff',
    height: 32,
    width: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  leadTitle: {
    fontSize: 13,
    color: '#000',
    fontFamily: 'K2D-SemiBold',
    marginLeft: 8,
  },
  leadWrapperEnd: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  leadSub: {fontSize: 12, color: '#666'},
  badge: {
    backgroundColor: '#1f5dd4',
    borderRadius: 20,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {color: '#fff', fontSize: 12},
  opportunityCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  opportunityText: {fontSize: 14, marginBottom: 3, color: '#333'},
  noData: {textAlign: 'center', marginTop: 15, fontSize: 15, color: 'gray'},
});

export default SalesStages;
