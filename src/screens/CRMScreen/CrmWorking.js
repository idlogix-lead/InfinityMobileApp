// screens/CRM/CrmWorking.js
import React from 'react';
import GenericLead from './GenericLead';

const CrmWorking = ({ route, navigation }) => {
  const { leads: workingLeads, activities } = route.params || {};
  
  return (
    <GenericLead
      navigation={navigation}
      route={route}
      screenTitle="Working Leads"
    />
  );
};

export default CrmWorking;