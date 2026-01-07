// screens/CRM/CrmConverted.js
import React from 'react';
import GenericLead from './GenericLead';

const CrmConverted = ({ route, navigation }) => {
  return (
    <GenericLead
      navigation={navigation}
      route={route}
      screenTitle="Converted Leads"
    />
  );
};

export default CrmConverted;