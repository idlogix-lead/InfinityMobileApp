import React from 'react';
import {View, TextInput, Text, Alert} from 'react-native';
import SearchableDropdown from './SearchableDropdown';

const ReferencesSection = ({
  task,
  editableTask,
  setEditableTask,
  openDropdown,
  setOpenDropdown,
  styles,
  users,
  projects,
  assets,
  campaigns,
  rma,
  bpartner,
  reqStatus,
  updateTask,
  refetchTask,
  autoSaveTask,
}) => {
  return (
    <View>
      {/* BUSINESS PARTNER */}

      <SearchableDropdown
        label="Business Partner"
        value={editableTask.BussinessPartnerName}
        placeholder="Select Business Partner"
        data={bpartner}
        searchValue={editableTask.BPSearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, BPSearch: text}))
        }
        dropdownKey="bp"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => item.identifier || item.Name || item.Value}
        styles={styles}
        onSelect={async item => {
          setEditableTask(prev => ({
            ...prev,
            BussinessPartner: item.id,
            BussinessPartnerName: item.identifier,
          }));

          setOpenDropdown(null);

          await updateTask({
            taskId: task.id,
            payload: {C_BPartner_ID: item.id},
          });

          refetchTask();
        }}
      />

      {/* USER */}

      <SearchableDropdown
        label="User Contact"
        value={editableTask.UserContact}
        placeholder="Select User"
        data={users}
        searchValue={editableTask.UserContactSearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, UserContactSearch: text}))
        }
        dropdownKey="user"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => item.Name}
        styles={styles}
        onSelect={async item => {
          setEditableTask(prev => ({
            ...prev,
            UserContact: item.Name,
            UserContactSearch: item.Name,
          }));

          setOpenDropdown(null);

          await updateTask({
            taskId: task.id,
            payload: {AD_User_ID: item.id},
          });

          refetchTask();
        }}
      />

      {/* PROJECT */}

      <SearchableDropdown
        label="Project"
        value={editableTask.Project}
        placeholder="Select Project"
        data={projects}
        searchValue={editableTask.ProjectSearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, ProjectSearch: text}))
        }
        dropdownKey="project"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => `${item.Value}_${item.Name}`}
        styles={styles}
        onSelect={async item => {
          const identifier = `${item.Value}_${item.Name}`;

          setEditableTask(prev => ({
            ...prev,
            Project: identifier,
            ProjectSearch: identifier,
          }));

          setOpenDropdown(null);

          await updateTask({
            taskId: task.id,
            payload: {C_Project_ID: item.id},
          });

          refetchTask();
        }}
      />

      {/* STATUS */}

      <SearchableDropdown
        label="Status"
        value={editableTask.Status}
        placeholder="Select Status"
        data={reqStatus}
        searchValue={editableTask.StatusSearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, StatusSearch: text}))
        }
        dropdownKey="status"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => `${item.SeqNo}_${item.Name}`}
        styles={styles}
        onSelect={async item => {
          const identifier = `${item.SeqNo}_${item.Name}`;

          setEditableTask(prev => ({
            ...prev,
            Status: identifier,
            StatusSearch: identifier,
          }));

          setOpenDropdown(null);

          try {
            await updateTask({
              taskId: task.id,
              payload: {R_Status_ID: item.id},
            });

            refetchTask();
          } catch {
            Alert.alert('Error', 'Failed to update Status');
          }
        }}
      />

      {/* ASSET */}

      <SearchableDropdown
        label="Asset"
        value={editableTask.Asset}
        placeholder="Select Asset"
        data={assets}
        searchValue={editableTask.AssetSearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, AssetSearch: text}))
        }
        dropdownKey="asset"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => `${item.Value}_${item.Name}`}
        styles={styles}
        onSelect={async item => {
          const identifier = `${item.Value}_${item.Name}`;

          setEditableTask(prev => ({
            ...prev,
            Asset: identifier,
            AssetSearch: identifier,
          }));

          setOpenDropdown(null);

          try {
            await updateTask({
              taskId: task.id,
              payload: {A_Asset_ID: item.id},
            });

            refetchTask();
          } catch {
            Alert.alert('Error', 'Failed to update Asset');
          }
        }}
      />

      {/* RMA */}

      <SearchableDropdown
        label="RMA"
        value={editableTask.RMA}
        placeholder="Select RMA"
        data={rma}
        searchValue={editableTask.RMASearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, RMASearch: text}))
        }
        dropdownKey="rma"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => `${item.id}_${item.DocumentNo}`}
        styles={styles}
        onSelect={async item => {
          const identifier = `${item.id}_${item.DocumentNo}`;

          setEditableTask(prev => ({
            ...prev,
            RMA: identifier,
            RMASearch: identifier,
          }));

          setOpenDropdown(null);

          try {
            await updateTask({
              taskId: task.id,
              payload: {M_RMA_ID: item.id},
            });

            refetchTask();
          } catch {
            Alert.alert('Error', 'Failed to update RMA');
          }
        }}
      />

      {/* CAMPAIGN */}

      <SearchableDropdown
        label="Campaign"
        value={editableTask.Campaign}
        placeholder="Select Campaign"
        data={campaigns}
        searchValue={editableTask.CampaignSearch}
        setSearchValue={text =>
          setEditableTask(prev => ({...prev, CampaignSearch: text}))
        }
        dropdownKey="campaign"
        openDropdown={openDropdown}
        setOpenDropdown={setOpenDropdown}
        renderLabel={item => `${item.Value}_${item.Name}`}
        styles={styles}
        onSelect={async item => {
          const identifier = `${item.Value}_${item.Name}`;

          setEditableTask(prev => ({
            ...prev,
            Campaign: identifier,
            CampaignSearch: identifier,
          }));

          setOpenDropdown(null);

          try {
            await updateTask({
              taskId: task.id,
              payload: {C_Campaign_ID: item.id},
            });

            refetchTask();
          } catch {
            Alert.alert('Error', 'Failed to update Campaign');
          }
        }}
      />

      {/* REQUEST AMOUNT */}

      <View style={styles.referenceContainer}>
        <Text style={styles.referenceLabel}>Request Amount</Text>

        <TextInput
          value={editableTask.RequestAmt?.toString() || ''}
          keyboardType="numeric"
          placeholder="Enter amount"
          style={styles.bpInput}
          onChangeText={text => {
            const numeric = text.replace(/[^0-9.]/g, '');
            setEditableTask(prev => ({
              ...prev,
              RequestAmt: numeric,
            }));
          }}
          onBlur={autoSaveTask}
        />
      </View>
    </View>
  );
};

export default ReferencesSection;
