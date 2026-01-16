// utils/validation.js
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    required: true,
    pattern: /^\+\d{8,15}$/,
    message: 'Please enter a valid phone number (e.g., +921234567890)',
  },
  date: {
    required: false,
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'Date must be in YYYY-MM-DD format',
  },
  required: {
    required: true,
    message: 'This field is required',
  },
};

export const validateField = (fieldName, value, rules) => {
  const rule = rules[fieldName] || validationRules.required;
  
  if (rule.required && (!value || value.trim() === '')) {
    return rule.message;
  }
  
  if (rule.pattern && value && !rule.pattern.test(value)) {
    return rule.message;
  }
  
  return null;
};

export const validateForm = (formData, fieldRules) => {
  const errors = {};
  
  Object.keys(fieldRules).forEach(fieldName => {
    const error = validateField(fieldName, formData[fieldName], fieldRules);
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};