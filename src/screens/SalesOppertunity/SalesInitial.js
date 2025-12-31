import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import SalesCalendar from '../../components/CRMSalesCalendar/SalesCalendar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ExpandableSearch from '../../components/CRMSearch/ExpandableSearch';

const SalesInitial = ({navigation, route}) => {
  const {initial} = route.params;
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(initial);
  }, [initial]);
  console.log('Salesleads', initial);

  const getStageProgress = stage => {
    if (!stage) return 0;

    const name = stage.toLowerCase();

    if (name.includes('initial')) return 33;
    if (name.includes('medium')) return 66;
    if (name.includes('done') || name.includes('final')) return 100;

    return 0;
  };
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleBackPress} style={{marginRight: 5}}>
            <Ionicons name="chevron-back" size={25} color={'#000'} />
          </TouchableOpacity>
        </View>
        <ExpandableSearch />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.cardOverlay}>
          {filteredData.map(item => (
            <View key={item.id} style={styles.card}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <View style={{flex: 1}}>
                  <Image
                    source={{
                      uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                    }}
                    style={styles.avatar}
                  />
                </View>
                <View style={{flex: 4}}>
                  <Text
                    style={{
                      color: '#000',
                      fontFamily: 'K2D-Bold',
                      fontSize: 13,
                    }}>
                    {item?.AD_User_ID?.identifier}
                  </Text>
                  <Text style={{color: '#555', fontFamily: 'K2D-Medium'}}>
                    {item?.AD_Client_ID?.identifier}
                  </Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <View style={{width: '48%', paddingHorizontal: '3%'}}>
                    <Text style={{color: '#555', fontFamily: 'K2D-Medium'}}>
                      <Text
                        style={{
                          color: '#333',
                          fontFamily: 'K2D-Regular',
                          fontSize: 13,
                        }}>
                        Status:
                      </Text>
                      {'  '}
                      {item?.IsActive ? 'Active' : 'Pending'}
                    </Text>

                    <Text
                      style={{
                        color: '#555',
                        fontFamily: 'K2D-Medium',
                        marginTop: 4,
                      }}>
                      <Text
                        style={{
                          color: '#333',
                          fontFamily: 'K2D-Regular',
                          fontSize: 13,
                        }}>
                        Amount:
                      </Text>
                      {'  '}
                      {item?.OpportunityAmt}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: '48%',
                      paddingVertical: '4%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <AnimatedCircularProgress
                      size={90}
                      width={10}
                      fill={getStageProgress(item?.C_SalesStage_ID?.identifier)}
                      tintColor="rgb(246, 151, 203)"
                      backgroundColor="rgb(245, 226, 237)"
                      rotation={0}
                      lineCap="round">
                      {() => (
                        <Text
                          style={{
                            fontSize: 10,
                            color: 'tomato',
                            fontFamily: 'K2D-Medium',
                            textAlign: 'center',
                          }}>
                          {item?.C_SalesStage_ID?.identifier}
                        </Text>
                      )}
                    </AnimatedCircularProgress>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  marginTop: '5%',
                  alignItems: 'center',
                  width: '100%',

                  paddingVertical: '2%',
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#ccc',
                }}>
                <Text
                  style={{
                    color: '#333',
                    fontFamily: 'K2D-Regular',
                    fontSize: 13,
                    paddingHorizontal: '3%',
                  }}>
                  Sales Representative :
                </Text>
                <Text
                  style={{
                    color: '#555',
                    fontFamily: 'K2D-SemiBold',
                    fontSize: 15,
                  }}>
                  {' '}
                  {item?.SalesRep_ID?.identifier}
                </Text>
              </View>
              <View style={{flexDirection: 'row', marginTop: '5%'}}>
                <SalesCalendar />
              </View>
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: 10,
                  paddingVertical: '3%',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '2%',
                  }}>
                  <View>
                    <Text
                      style={{
                        color: '#333',
                        fontFamily: 'K2D-Regular',
                        fontSize: 13,
                      }}>
                      Start{' '}
                    </Text>
                    <Text
                      style={{
                        color: '#333',
                        fontFamily: 'K2D-SemiBold',
                        fontSize: 15,
                      }}>
                      {item?.Created ? item.Created.split('T')[0] : 'N/A'}
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        color: '#333',
                        fontFamily: 'K2D-Regular',
                        fontSize: 13,
                      }}>
                      Deadline{' '}
                    </Text>
                    <Text
                      style={{
                        color: '#333',
                        fontFamily: 'K2D-SemiBold',
                        fontSize: 15,
                      }}>
                      {item?.ExpectedCloseDate
                        ? item.ExpectedCloseDate.split('T')[0]
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default SalesInitial;

const styles = StyleSheet.create({
  container: {
    // backgroundColor: '#2F4FE2'
    flex: 1,
    backgroundColor: 'rgba(240, 241, 245, 1)',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  header: {
    // padding: 20,
    // marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // sales card
  cardOverlay: {
    // position: 'absolute',
    // top: 0, left: 0, right: 0, bottom: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',

    gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 6,
    width: '100%',
    elevation: 1,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgb(252, 252, 249)',
    paddingHorizontal: 10,
    elevation: 2,
  },
});

