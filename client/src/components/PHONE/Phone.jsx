// components/PHONE/Phone.jsx
import { forwardRef } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const InternationalPhoneInput = forwardRef(
  ({ value, onChange, error, disabled, ...props }, ref) => {
    return (
      <div style={{ width: '100%' }}>
        <PhoneInput
          international
          defaultCountry="FR"
          value={value}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
          style={{
            border: error ? '1px solid #d32f2f' : '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            width: '100%',
            fontFamily: 'inherit',
          }}
          {...props}
        />
        {error && (
          <p style={{ 
            color: '#d32f2f', 
            fontSize: '0.75rem', 
            marginTop: '4px',
            marginLeft: '14px' // Matches MUI's helper text positioning
          }}>
            {error.message}
          </p>
        )}
      </div>
    );
  }
);

InternationalPhoneInput.displayName = 'InternationalPhoneInput';


export default InternationalPhoneInput;