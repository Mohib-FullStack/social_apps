import {
  Cake,
  Email,
  Transgender,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Link as MuiLink,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { motion } from 'framer-motion';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import InternationalPhoneInput from '../../components/PHONE/Phone';
import { useSocket } from '../../context/SocketContext';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { registerUser } from '../../features/user/userSlice';

const ALLOWED_FILE_TYPES = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/apng',
  'image/avif',
  'image/gif',
  'image/svg+xml',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};



const RegisterForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
    setError,
    clearErrors,
    trigger,
  } = useForm({ mode: 'onBlur' });

  const navigate = useNavigate();

  const { socketService, isConnected } = useSocket();
  const dispatch = useDispatch();
  const { error, status } = useSelector((state) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [connectionState, setConnectionState] = useState(
    isConnected ? 'connected' : 'disconnected'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: ALLOWED_FILE_TYPES.join(','),
    maxSize: MAX_FILE_SIZE,
    onDrop: (acceptedFiles) => handleFileUpload(acceptedFiles),
  });

  const validateField = useCallback(
    async (field, value) => {
      if (!value) return null;

      try {
        setIsValidating(true);
        const response = await socketService.validateField(field, value);

        if (response.valid) {
          clearErrors(field);
          return null;
        } else {
          setError(field, { type: 'manual', message: response.message });
          dispatch(
            showSnackbar({
              message: response.message,
              severity: 'error',
              autoHideDuration: 5000,
            })
          );
          return response.message;
        }
      } catch (error) {
        console.error(`Validation error for ${field}:`, error);
        return null;
      } finally {
        setIsValidating(false);
      }
    },
    [clearErrors, setError, dispatch, socketService]
  );

  const debouncedValidation = useCallback(
    debounce((field, value) => {
      validateField(field, value);
    }, 500),
    [validateField]
  );

  const handleEmailChange = (e, field) => {
    const value = e.target.value;
    field.onChange(e);

    if (errors.email) clearErrors('email');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setError('email', {
        type: 'manual',
        message: 'Please enter a valid email address',
      });
      return;
    }

    if (value && emailRegex.test(value)) {
      debouncedValidation('email', value);
    }
  };

  const handlePhoneChange = (value, field) => {
    field.onChange(value);

    if (errors.phone) clearErrors('phone');

    try {
      const phoneNumber = parsePhoneNumberFromString(value);
      if (value && (!phoneNumber || !phoneNumber.isValid())) {
        setError('phone', {
          type: 'manual',
          message: 'Please enter a valid international phone number',
        });
        return;
      }

      if (value && phoneNumber?.isValid()) {
        debouncedValidation('phone', value);
      }
    } catch (e) {
      setError('phone', {
        type: 'manual',
        message: 'Invalid phone number format',
      });
    }
  };

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        setConnectionState('connecting');
        await socketService.connect();
        setConnectionState('connected');
      } catch (error) {
        console.error('Socket connection error:', error);
        setConnectionState('error');
      }
    };

    initializeSocket();

    return () => {
      socketService.disconnect();
    };
  }, [socketService]);

  useEffect(() => {
    if (status === 'succeeded') {
      setIsSubmitting(false);
      setEmailSent(true);
      // Store the submitted email in localStorage
      const email = watch('email');
      setSubmittedEmail(email);
      localStorage.setItem('registrationEmail', email);

      dispatch(
        showSnackbar({
          message:
            'Verification email sent! Please check your inbox to complete registration.',
          severity: 'success',
          autoHideDuration: 10000,
        })
      );
      reset();
      setFiles([]);
    } else if (status === 'failed' && error) {
      setIsSubmitting(false);

      if (error.errors) {
        error.errors.forEach((err) => {
          const fieldMap = {
            email: 'email',
            phone: 'phone',
            firstname: 'firstName',
            lastname: 'lastName',
            password: 'password',
            gender: 'gender',
            birthdate: 'birthDate',
          };

          for (const [field, fieldName] of Object.entries(fieldMap)) {
            if (err.message.toLowerCase().includes(field)) {
              setError(fieldName, {
                type: 'manual',
                message: err.message,
              });
              break;
            }
          }
        });
      }

      if (!error.errors || error.errors.length === 0) {
        dispatch(
          showSnackbar({
            message:
              error.message ||
              'Registration failed. Please check your information and try again.',
            severity: 'error',
            autoHideDuration: 8000,
          })
        );
      }
    }
  }, [status, error, dispatch, reset, setError, watch]);

  const validatePhoneNumber = (value) => {
    if (!value) return 'Phone number is required';

    try {
      const phoneNumber = parsePhoneNumberFromString(value);
      if (!phoneNumber || !phoneNumber.isValid()) {
        return 'Please enter a valid international phone number (e.g., +33 7 49 40 22 80)';
      }
      return true;
    } catch (e) {
      return 'Invalid phone number format';
    }
  };

  const handleFileUpload = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('Invalid file type. Only image files are allowed.');
      setFiles([]);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        'File size too large. Please upload a file smaller than 10 MB.'
      );
      setFiles([]);
      return;
    }

    setFiles(acceptedFiles);
    setFileError('');
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    // Manually trigger all validations
    const results = await Promise.all([
      trigger('firstName'),
      trigger('lastName'),
      trigger('email'),
      trigger('phone'),
      trigger('gender'),
      trigger('birthDate'),
      trigger('password'),
      trigger('confirmPassword'),
    ]);

    // Check if any validation failed
    if (results.some((valid) => !valid)) {
      setIsSubmitting(false);
      dispatch(
        showSnackbar({
          message: 'Please fix the errors in the form',
          severity: 'error',
        })
      );
      return;
    }

    clearErrors();

    try {
      // Create FormData
      const formData = new FormData();

      // Append all regular fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'profileImage') {
          formData.append(key, value);
        }
      });

      // Format phone number before submission
      const phoneNumber = parsePhoneNumberFromString(data.phone);
      if (phoneNumber?.isValid()) {
        formData.set('phone', phoneNumber.number);
      }

      // Handle date formatting
      if (data.birthDate instanceof Date) {
        formData.set('birthDate', data.birthDate.toISOString().split('T')[0]);
      }

      // Append file only if it exists
      if (files.length > 0) {
        formData.append('profileImage', files[0]);
      }

      // Dispatch the action
      await dispatch(registerUser(formData));
    } catch (error) {
      console.error('Registration error:', error);
      setIsSubmitting(false);

      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => {
          const field = err.message.toLowerCase().includes('email')
            ? 'email'
            : err.message.toLowerCase().includes('phone')
            ? 'phone'
            : null;
          if (field) {
            setError(field, {
              type: 'manual',
              message: err.message,
            });
            dispatch(
              showSnackbar({
                message: err.message,
                severity: 'error',
                autoHideDuration: 8000,
              })
            );
          }
        });
      } else {
        dispatch(
          showSnackbar({
            message: 'Registration failed. Please try again.',
            severity: 'error',
            autoHideDuration: 8000,
          })
        );
      }
    }
  };

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const password = watch('password');

  if (emailSent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '800px', margin: 'auto', padding: '24px' }}
      >
        <Card
          sx={{
            padding: 4,
            boxShadow: 4,
            borderRadius: '20px',
            backgroundColor: 'background.paper',
            marginTop: 8,
            marginBottom: 5,
            textAlign: 'center',
          }}
        >
          <Email sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
  
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Verify Your Email
          </Typography>
  
          <Typography
            variant="body1"
            component="div"  // Changed from default 'p' to 'div'
            paragraph
            sx={{ mb: 3, fontSize: '1.1rem' }}
          >
            We've sent a verification link to: <br />
            <Box
              component="span"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                fontSize: '1.2rem',
                wordBreak: 'break-all',
              }}
            >
              {submittedEmail}
            </Box>
          </Typography>
  
          <Box
            sx={{
              backgroundColor: 'background.paper',
              p: 3,
              borderRadius: 2,
              borderLeft: '4px solid',
              borderColor: 'warning.main',
              textAlign: 'left',
              mb: 3,
            }}
          >
            <Typography variant="body2" component="div">  {/* Changed to div */}
              <strong>Important:</strong>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>
                  Check your inbox and spam folder for this exact email address
                </li>
                <li>Links expire in 15 minutes</li>
                <li>No resend option - register again if needed</li>
              </ul>
            </Typography>
          </Box>
  
          <Box component="div" sx={{ mb: 3 }}>  {/* Changed from Typography to Box */}
            <Typography variant="body2" component="div">  {/* Changed to div */}
              <strong>Wrong email address?</strong>
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              <Button
                variant="outlined"
                color="warning"
                component={Link}
                to="/register"
                onClick={(e) => {
                  e.preventDefault();
                  // Clear any pending state
                  setIsSubmitting(false);
                  setEmailSent(false);
                  // Then navigate
                  navigate('/register');
                }}
                sx={{ mr: 2 }}
              >
                Register with correct email
              </Button>
              <Button variant="text" component={Link} to="/contact-support">
                Need help?
              </Button>
            </Box>
          </Box>
        </Card>
      </motion.div>
    );
  }

  // if (emailSent) {
  //   return (
  //     <motion.div
  //       initial={{ opacity: 0 }}
  //       animate={{ opacity: 1 }}
  //       transition={{ duration: 0.5 }}
  //       style={{ maxWidth: '800px', margin: 'auto', padding: '24px' }}
  //     >
  //       <Card
  //         sx={{
  //           padding: 4,
  //           boxShadow: 4,
  //           borderRadius: '20px',
  //           backgroundColor: 'background.paper',
  //           marginTop: 8,
  //           marginBottom: 5,
  //           textAlign: 'center',
  //         }}
  //       >
  //         <Email sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />

  //         <Typography
  //           variant="h4"
  //           component="h1"
  //           gutterBottom
  //           sx={{ fontWeight: 'bold' }}
  //         >
  //           Verify Your Email
  //         </Typography>

  //         <Typography
  //           variant="body1"
  //           paragraph
  //           sx={{ mb: 3, fontSize: '1.1rem' }}
  //         >
  //           We've sent a verification link to: <br />
  //           <Box
  //             component="span"
  //             sx={{
  //               fontWeight: 'bold',
  //               color: 'primary.main',
  //               fontSize: '1.2rem',
  //               wordBreak: 'break-all',
  //             }}
  //           >
  //             {submittedEmail}
  //           </Box>
  //         </Typography>

  //         <Box
  //           sx={{
  //             backgroundColor: 'background.paper',
  //             p: 3,
  //             borderRadius: 2,
  //             borderLeft: '4px solid',
  //             borderColor: 'warning.main',
  //             textAlign: 'left',
  //             mb: 3,
  //           }}
  //         >
  //           <Typography variant="body2" component="div">
  //             <strong>Important:</strong>
  //             <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
  //               <li>
  //                 Check your inbox and spam folder for this exact email address
  //               </li>
  //               <li>Links expire in 15 minutes</li>
  //               <li>No resend option - register again if needed</li>
  //             </ul>
  //           </Typography>
  //         </Box>

  //         <Typography variant="body2" paragraph sx={{ mb: 3 }}>
  //           <strong>Wrong email address?</strong>
  //           <Box sx={{ mt: 1.5 }}>
  //             <Button
  //               variant="outlined"
  //               color="warning"
  //               component={Link}
  //               to="/register"
  //               sx={{ mr: 2 }}
  //             >
  //               Register with correct email
  //             </Button>
  //             <Button variant="text" component={Link} to="/contact-support">
  //               Need help?
  //             </Button>
  //           </Box>
  //         </Typography>
  //       </Card>
  //     </motion.div>
  //   );
  // }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '800px', margin: 'auto', padding: '24px' }}
    >
      <Card
        sx={{
          padding: 4,
          boxShadow: 4,
          borderRadius: '20px',
          backgroundColor: 'background.paper',
          marginTop: 8,
          marginBottom: 5,
        }}
      >
        <Typography
          component="h1"
          variant="h4"
          sx={{
            mt: 2,
            mb: 4,
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'primary.main',
          }}
        >
          Create Your Account
        </Typography>

        <Box
          sx={{
            textAlign: 'center',
            mb: 2,
            backgroundColor:
              connectionState === 'connected'
                ? 'success.light'
                : connectionState === 'connecting'
                ? 'warning.light'
                : 'error.light',
            p: 1,
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.primary">
            {connectionState === 'connected'
              ? '✓ Real-time validation active'
              : connectionState === 'connecting'
              ? '⌛ Connecting to validation service...'
              : '✗ Validation service offline'}
          </Typography>
          {connectionState === 'connecting' && (
            <CircularProgress size={14} color="inherit" sx={{ ml: 1 }} />
          )}
          {connectionState === 'disconnected' && (
            <Button
              variant="text"
              size="small"
              onClick={() => socketService.connect()}
              sx={{ ml: 1 }}
            >
              Retry Connection
            </Button>
          )}
        </Box>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                    maxLength: { value: 50, message: 'Maximum 50 characters' },
                    pattern: {
                      value: /^[a-zA-ZÀ-ÿ\s-']+$/,
                      message: 'Only letters and basic punctuation allowed',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      margin="normal"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Minimum 2 characters' },
                    maxLength: { value: 50, message: 'Maximum 50 characters' },
                    pattern: {
                      value: /^[a-zA-ZÀ-ÿ\s-']+$/,
                      message: 'Only letters and basic punctuation allowed',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      margin="normal"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Email"
                      fullWidth
                      margin="normal"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        endAdornment:
                          isValidating && field.value ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ) : null,
                      }}
                      onChange={(e) => handleEmailChange(e, field)}
                      onBlur={() => trigger('email')}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Phone number is required',
                    validate: validatePhoneNumber,
                  }}
                  render={({ field, fieldState }) => (
                    <Box>
                      <InternationalPhoneInput
                        value={field.value}
                        onChange={(value) => handlePhoneChange(value, field)}
                        error={!!fieldState.error}
                        disabled={isSubmitting}
                      />
                      {fieldState.error && (
                        <Typography
                          color="error"
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {fieldState.error.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  defaultValue=""
                  rules={{ required: 'Gender is required' }}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      margin="normal"
                      error={!!errors.gender}
                    >
                      <InputLabel>Gender</InputLabel>
                      <Select
                        {...field}
                        label="Gender"
                        startAdornment={
                          <InputAdornment position="start">
                            <Transgender />
                          </InputAdornment>
                        }
                      >
                        {GENDER_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.gender && (
                        <FormHelperText>{errors.gender.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="birthDate"
                  control={control}
                  defaultValue={null}
                  rules={{
                    required: 'Birth date is required',
                    validate: (value) => {
                      if (!value) return true;
                      const birthDate = new Date(value);
                      const today = new Date();
                      const minDate = new Date();
                      minDate.setFullYear(today.getFullYear() - 120);
                      const maxDate = new Date();
                      maxDate.setFullYear(today.getFullYear() - 13);

                      if (birthDate < minDate || birthDate > maxDate) {
                        return 'You must be at least 13 years old and not older than 120 years';
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Birth Date"
                      maxDate={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 13)
                        )
                      }
                      minDate={
                        new Date(
                          new Date().setFullYear(new Date().getFullYear() - 120)
                        )
                      }
                      openTo="year"
                      views={['year', 'month', 'day']}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          margin="normal"
                          error={!!errors.birthDate}
                          helperText={errors.birthDate?.message}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <Cake />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="password"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                    maxLength: {
                      value: 100,
                      message: 'Maximum 100 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                      message:
                        'Must include uppercase, lowercase, number, and special character',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      error={!!errors.password}
                      helperText={
                        errors.password?.message ||
                        'At least 8 characters with uppercase, lowercase, number, and special character'
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClickShowPassword}>
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: 'Confirm password is required',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowConfirmPassword}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: fileError ? 'error.main' : 'divider',
                    borderRadius: 1,
                    padding: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  {files.length === 0 ? (
                    <>
                      <Avatar
                        sx={{ width: 80, height: 80, margin: 'auto', mb: 2 }}
                      />
                      <Typography variant="body1" color="textSecondary">
                        Drag & drop a profile image here, or click to select
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        (Max size: 10MB, JPG/PNG/GIF)
                      </Typography>
                    </>
                  ) : (
                    <Avatar
                      src={URL.createObjectURL(files[0])}
                      alt="Profile preview"
                      sx={{ width: 100, height: 100, margin: 'auto' }}
                    />
                  )}
                </Box>
                {fileError && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {fileError}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 1 }}
                >
                  By creating an account, you agree to our
                  <MuiLink href="/terms" sx={{ ml: 0.5 }}>
                    Terms
                  </MuiLink>{' '}
                  and
                  <MuiLink href="/privacy" sx={{ ml: 0.5 }}>
                    Privacy Policy
                  </MuiLink>
                  .
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{ mt: 2, py: 1.5 }}
                  disabled={isSubmitting || !isValid}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress
                        size={24}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                      Creating Account...
                    </>
                  ) : (
                    'Continue to Verification'
                  )}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 1 }}>
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <MuiLink
                      component={Link}
                      to="/login"
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    >
                      Sign in here
                    </MuiLink>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;












