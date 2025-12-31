import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';

const SearchHeader = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#000" />
          <TextInput
            placeholder="Search"
            placeholderTextColor={'gray'}
            value={search}
            onChangeText={setSearch}
            // selectionColor={'gray'}
            style={styles.searchInput}
          />
          <View style={styles.micIcon}>
            <Ionicons name="mic-outline" size={18} color="#000" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default SearchHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    top: '3%',
    paddingVertical: '7%',
    paddingHorizontal: '3%',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  micIcon: {
    // flex:1,
    backgroundColor: 'rgba(204, 211, 211, 1)',
    height: 40,
    width: 40,
    marginRight: '-3.5%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    borderRadius: 3,
    paddingHorizontal: 10,
    marginLeft: 10,
    height: 40,
    shadowColor: 'rgba(0, 0, 0, 0.45)',
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 6,
    fontSize: 15,
    color: '#000',
    fontFamily: 'K2D-Regular',
  },
});
