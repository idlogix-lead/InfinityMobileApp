import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {Picker} from '@react-native-picker/picker';

const BASE_URL = 'http://116.58.53.114:9999/api/v1/models';

const AddOppor = () => {
  // stage mode
  const [useExistingStage, setUseExistingStage] = useState(true);

  // stages
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(null);

  // new stage
  const [newStageName, setNewStageName] = useState('');
  const [probability, setProbability] = useState('');

  // opportunity fields
  const [amount, setAmount] = useState('');
  const [closeDate, setCloseDate] = useState('');

  const [loading, setLoading] = useState(false);

  // fetch existing stages
  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/C_SalesStage?$select=Name`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      setStages(res.data.records || []);
    } catch (err) {
      console.error('Stage fetch error', err.message);
    }
  };

  // create new sales stage
  const createSalesStage = async () => {
    const token = await AsyncStorage.getItem('token');

    const res = await axios.post(
      `${BASE_URL}/C_SalesStage`,
      {
        Name: newStageName,
        Probability: Number(probability),
        IsActive: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return res.data.id;
  };

  // final submit
  const handleCreateOpportunity = async () => {
    try {
      if (!amount || !closeDate) {
        Alert.alert('Error', 'Please fill all opportunity fields');
        return;
      }

      setLoading(true);

      let stageId = selectedStageId;

      // if creating new stage
      if (!useExistingStage) {
        if (!newStageName || !probability) {
          Alert.alert('Error', 'Please fill stage details');
          setLoading(false);
          return;
        }
        stageId = await createSalesStage();
      }

      if (!stageId) {
        Alert.alert('Error', 'Please select a sales stage');
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem('token');

      await axios.post(
        `${BASE_URL}/C_Opportunity`,
        {
          DocumentNo: `OPP-${Date.now()}`,
          C_SalesStage_ID: stageId,
          OpportunityAmt: Number(amount),
          ExpectedCloseDate: closeDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      Alert.alert('Success', 'Opportunity created successfully');

      // reset form
      setAmount('');
      setCloseDate('');
      setNewStageName('');
      setProbability('');
      setSelectedStageId(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      Alert.alert('Error', 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Create Opportunity</Text>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, useExistingStage && styles.activeToggle]}
          onPress={() => setUseExistingStage(true)}>
          <Text style={styles.toggleText}>Use Existing Stage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, !useExistingStage && styles.activeToggle]}
          onPress={() => setUseExistingStage(false)}>
          <Text style={styles.toggleText}>Create New Stage</Text>
        </TouchableOpacity>
      </View>

      {/* Existing Stage Picker */}
      {useExistingStage && (
        <View style={styles.block}>
          <Text style={styles.label}>Sales Stage</Text>
          <Picker
            selectedValue={selectedStageId}
            onValueChange={setSelectedStageId}>
            <Picker.Item label="Select stage" value={null} />
            {stages.map(stage => (
              <Picker.Item key={stage.id} label={stage.Name} value={stage.id} />
            ))}
          </Picker>
        </View>
      )}

      {/* New Stage Fields */}
      {!useExistingStage && (
        <View style={styles.block}>
          <Text style={styles.label}>New Stage Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g Advance"
            value={newStageName}
            onChangeText={setNewStageName}
          />

          <Text style={styles.label}>Probability (%)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g 70"
            keyboardType="numeric"
            value={probability}
            onChangeText={setProbability}
          />
        </View>
      )}

      {/* Opportunity Fields */}
      <View style={styles.block}>
        <Text style={styles.label}>Opportunity Amount</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter amount"
          value={amount}
          onChangeText={setAmount}
        />

        <Text style={styles.label}>Expected Close Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={closeDate}
          onChangeText={setCloseDate}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleCreateOpportunity}
        disabled={loading}>
        <Text style={styles.submitText}>
          {loading ? 'Creating...' : 'Create Opportunity'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddOppor;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#f5f5f5'},
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  toggleRow: {flexDirection: 'row', marginBottom: 16},
  toggleBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#ddd',
    alignItems: 'center',
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeToggle: {backgroundColor: '#1f5dd4'},
  toggleText: {color: '#fff', fontWeight: '600'},
  block: {marginBottom: 16},
  label: {fontSize: 13, color: '#444', marginBottom: 6},
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  submitBtn: {
    backgroundColor: '#1f5dd4',
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
