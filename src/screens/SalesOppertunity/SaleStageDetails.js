import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import {Menu, Divider, Provider} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SaleStageDetails = ({route, navigation, item}) => {
  const [visible, setVisible] = useState(false);
  const [editStatus, setEditStatus] = useState('status');
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const [leads, setLeads] = useState('');
  const interaction = moment('').format('DD MMM YYYY');
  const {opportunities} = route.params;
  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderOpportunity = ({item}) => {
    const cols = [
      {
        title: 'Created',
        align: 'flex-start',
        dotColor: 'rgba(234, 71, 71, 1)',
        content: (
          <View style={styles.statusRow}>
            <Text style={styles.value}>
              {item?.Created ? item.Created.split('T')[0] : 'N/A'}
            </Text>
          </View>
        ),
      },
      {
        title: 'Updated',
        align: 'center',
        dotColor: 'rgba(231, 205, 76, 1)',
        content: (
          <View style={styles.statusRow}>
            <Text style={styles.value}>
              {item?.Updated ? item.Updated.split('T')[0] : 'N/A'}
            </Text>
          </View>
        ),
      },
      {
        title: 'Ended',
        align: 'flex-end',
        dotColor: 'rgba(38, 189, 206, 1)',
        content: (
          <View style={styles.statusRow}>
            <Text style={styles.value}>
              {item?.ExpectedCloseDate
                ? item.ExpectedCloseDate.split('T')[0]
                : 'N/A'}
            </Text>
          </View>
        ),
      },
    ];
    return (
      <View style={styles.card}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View>
            <Text style={styles.cardLabel}>
              Client :{' '}
              <Text style={styles.cardValue}>
                {' '}
                {item.C_BPartner_ID?.identifier || 'N/A'}
              </Text>
            </Text>
            <Text style={styles.cardLabel}>
              Amount :{' '}
              <Text style={styles.cardValue}>
                {''}
                {item.OpportunityAmt ?? 'N/A'}
              </Text>
            </Text>
          </View>
          <View>
            <Text style={[styles.cardLabel, {fontSize: 12}]}>
              Weighted Amount :{' '}
              <Text style={styles.cardLabel}>
                {Number(item?.WeightedAmt) ?? 'N/A'}
              </Text>
            </Text>
          </View>
        </View>
        <Text style={styles.cardLabel}>
          Status :{' '}
          <Text style={styles.cardValue}>
            {' '}
            {item.IsActive ? 'true' : 'false' || 'N/A'}
          </Text>
        </Text>

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

        {/* <Text style={styles.descText}>
          
          {Description && Description.trim() !== ''
            ? Description
            : 'No description provided'}
        </Text>
      </View> */}
        {/* Bottom Button */}
      </View>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={handleBackPress} style={{marginRight: 5}}>
            <Ionicons name="chevron-back" size={25} color={'#000'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.heading}>Sale Opportunities</Text>

        <FlatList
          data={opportunities}
          renderItem={renderOpportunity}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{padding: 20, alignItems: 'center'}}>
              <Text style={{fontSize: 16, color: '#888'}}>
                No Opportunity for Stage
              </Text>
            </View>
          }
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(240, 241, 245, 1)',
    paddingHorizontal: 20,
    paddingTop: '10%',
  },
  heading: {
    fontSize: 20,
    fontFamily: 'K2D-Bold',
    marginVertical: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  cardLabel: {
    fontSize: 13,
    color: '#000',
    marginVertical: 2,
    fontFamily: 'K2D-Medium',
  },
  cardValue: {
    fontSize: 15,
    color: '#555',
    marginVertical: 2,
    fontFamily: 'K2D-Bold',
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
    marginBottom: '4%',
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
    fontSize: 13,
    color: 'rgba(139, 140, 144, 1)',
    fontFamily: 'K2D-Medium',
    marginBottom: '7%',
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

export default SaleStageDetails;
