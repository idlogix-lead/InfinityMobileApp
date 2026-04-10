import React, {useState} from 'react';
import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native';

const SearchableDropdown = ({
  label,
  value,
  placeholder,
  data = [],
  searchValue,
  setSearchValue,
  dropdownKey,
  openDropdown,
  setOpenDropdown,
  renderLabel,
  onSelect,
  styles,
}) => {
  const [filtered, setFiltered] = useState(data);

  const handleSearch = text => {
    setSearchValue(text);
    setOpenDropdown(dropdownKey);

    const result = !text
      ? data
      : data.filter(item =>
          (renderLabel(item) || '').toLowerCase().includes(text.toLowerCase()),
        );

    setFiltered(result);
  };

  return (
    <View style={styles.referenceContainer}>
      <Text style={styles.referenceLabel}>{label}</Text>

      <TextInput
        value={searchValue || ''}
        placeholder={value || placeholder}
        placeholderTextColor="#333"
        style={styles.bpInput}
        onFocus={() => {
          setOpenDropdown(dropdownKey);
          setFiltered(data || []);
        }}
        onChangeText={handleSearch}
      />

      {openDropdown === dropdownKey && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          style={styles.bpDropdown}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          renderItem={({item}) => {
            const label = renderLabel ? renderLabel(item) : '';
            return (
              <TouchableOpacity
                style={styles.bpDropdownItem}
                onPress={() => onSelect(item)}>
                <Text style={styles.bpDropdownItemText}>
                  {/* {renderLabel(item)} */}
                  {label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default SearchableDropdown;
