// screens/CRM/CrmNew.js
import React from 'react';
import GenericLead from './GenericLead';

const CrmNew = ({ route, navigation }) => {
  return (
    <GenericLead
      navigation={navigation}
      route={route}
      screenTitle="New Leads"
    />
  );
};

export default CrmNew;