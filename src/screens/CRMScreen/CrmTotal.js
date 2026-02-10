// screens/CRM/CrmWorking.js
import React from 'react';
import GenericLead from './GenericLead';

const CrmTotal = ({ route, navigation }) => {
  
  return (
    <GenericLead
      navigation={navigation}
      route={route}
      screenTitle="All Leads"
    />
  );
};

export default CrmTotal;