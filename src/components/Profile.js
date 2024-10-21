import React, { useState, useEffect } from 'react';
import {
  Box,
  // Button,
  TextField,
  // Checkbox,
  // FormControlLabel,
  // FormGroup,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,Avatar, 
  Snackbar,
  Alert,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { IconButton, Button } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';
import BASE_URL from '../config';

const Profile = () => {
  const { client } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
};


  const [profileData, setProfileData] = useState({
    nationalCardCode: '',
    phoneNumber: '',
    birthday: '',
    additionalDetails: [],
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    // Fetch profile data from backend
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get(
          `${BASE_URL}/api/client/profile/${client.clientId}`
        );
        setProfileData((prevData) => ({
          ...prevData,
          ...response.data,
          birthday: response.data.birthday
            ? new Date(response.data.birthday).toISOString().split('T')[0]
            : '',
          additionalDetails: response.data.additionalDetails || [],
        }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
  
    if (client) {
      fetchProfile();
    }
  }, [client]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newValue = value === '' ? null : value;

    if (name.startsWith('additionalDetails')) {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      const field = e.target.getAttribute('data-field');
  
      setProfileData((prevData) => {
        const newDetails = [...prevData.additionalDetails];
        if (newDetails[index]) {
          newDetails[index][field] = value;
        } else {
          newDetails[index] = { [field]: value };
        }
        return { ...prevData, additionalDetails: newDetails };
      });
    } else {
      setProfileData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  
  


const handleAddDetail = () => {
  setProfileData((prevData) => ({
    ...prevData,
    additionalDetails: [...prevData.additionalDetails, { name: '', value: '' }],
  }));
};

const handleRemoveDetail = (index) => {
  setProfileData((prevData) => {
    const newDetails = [...prevData.additionalDetails];
    newDetails.splice(index, 1);
    return { ...prevData, additionalDetails: newDetails };
  });
};


  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const formData = new FormData();

        // Append form data
        for (const [key, value] of Object.entries(profileData)) {
            if (key === 'additionalDetails') {
                formData.append(key, JSON.stringify(value)); // Send additionalDetails as JSON string
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        }

        // Append the file if selected
        if (selectedFile) {
            formData.append('profileImage', selectedFile);
        }

        // Use axiosInstance to send the form data
        const response = await axiosInstance.post(
            `${BASE_URL}/api/client/profile/${client.clientId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        setProfileData((prevData) => ({
            ...prevData,
            ...response.data,
            birthday: response.data.birthday
                ? new Date(response.data.birthday).toISOString().split('T')[0]
                : '',
            additionalDetails: response.data.additionalDetails || [],
            profileImage: response.data.profileImage,
        }));
        setIsModalOpen(false);
        setSnackbar({
            open: true,
            message: 'Profile updated successfully!',
            severity: 'success',
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        setSnackbar({
            open: true,
            message: 'Error updating profile.',
            severity: 'error',
        });
    }
};


  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ maxWidth: 600, mx: 'auto', p: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
            {profileData.profileImage ? (
                <img
                    src={`${BASE_URL}/uploads/${profileData.profileImage}`}
                    alt="Profile"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
            ) : (
                <Avatar style={{ width: '100px', height: '100px' }}>
                    {client && client.clientname ? client.clientname.charAt(0).toUpperCase() : ''}
                </Avatar>
            )}
        </Grid>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Grid container spacing={2}>
          {/* National Card Code */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              National Card Code: {profileData.nationalCardCode || 'N/A'}
            </Typography>
          </Grid>
          {/* Phone Number */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Phone Number: {profileData.phoneNumber || 'N/A'}
            </Typography>
          </Grid>
          {/* Birthday */}
          <Grid item xs={12}>
            <Typography variant="subtitle1">
              Birthday: {profileData.birthday || 'N/A'}
            </Typography>
          </Grid>
         {/* Additional Details */}
          <Grid item xs={12}>
            <Typography variant="h6">Additional Details</Typography>
            {profileData.additionalDetails && profileData.additionalDetails.length > 0 ? (
              profileData.additionalDetails.map((detail, index) => (
                <Typography variant="body1" key={index}>
                  <strong>{detail.name}:</strong> {detail.value}
                </Typography>
              ))
            ) : (
              <Typography variant="body1">No additional details.</Typography>
            )}
          </Grid>

          {/* Action Button */}
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={handleModalOpen}>
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
    open={isModalOpen}
    onClose={handleModalClose}
    fullWidth
    maxWidth="sm"
  >
    <DialogTitle>Edit Profile</DialogTitle>
    <DialogContent>
      <Box component="form" onSubmit={handleFormSubmit}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Profile Picture Upload */}
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profileImage"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="profileImage">
              <IconButton
                color="primary"
                aria-label="upload picture"
                component="span"
              >
                {profileData.profileImage || selectedFile ? (
                  <Avatar
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : `${BASE_URL}/uploads/${profileData.profileImage}`
                    }
                    sx={{ width: 120, height: 120 }}
                  />
                ) : (
                  <Avatar sx={{ width: 120, height: 120 }}>
                    <PhotoCamera fontSize="large" />
                  </Avatar>
                )}
              </IconButton>
            </label>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Click the image to {selectedFile ? 'change' : 'upload'} your
              profile picture
            </Typography>
          </Grid>

          {/* National Card Code */}
          <Grid item xs={12}>
            <TextField
              label="National Card Code"
              name="nationalCardCode"
              value={profileData.nationalCardCode || ''}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          {/* Phone Number */}
          <Grid item xs={12}>
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={profileData.phoneNumber || ''}
              onChange={handleInputChange}
              fullWidth
            />
          </Grid>
          {/* Birthday */}
          <Grid item xs={12}>
            <TextField
              label="Birthday"
              name="birthday"
              type="date"
              value={profileData.birthday || ''}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          {/* Additional Details */}
          <Grid item xs={12}>
            <Typography variant="h6">Additional Details</Typography>
            {profileData.additionalDetails.map((detail, index) => (
              <Grid
                container
                spacing={1}
                key={index}
                alignItems="center"
                sx={{ mt: 1 }}
              >
                <Grid item xs={5}>
                  <TextField
                    label="Name"
                    name={`additionalDetails-name-${index}`}
                    value={detail.name || ''}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{
                      'data-index': index,
                      'data-field': 'name',
                    }}
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Value"
                    name={`additionalDetails-value-${index}`}
                    value={detail.value || ''}
                    onChange={handleInputChange}
                    fullWidth
                    inputProps={{
                      'data-index': index,
                      'data-field': 'value',
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleRemoveDetail(index)}
                    color="error"
                  >
                    <RemoveIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              variant="outlined"
              onClick={handleAddDetail}
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add Detail
            </Button>
          </Grid>
        </Grid>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleModalClose} color="secondary">
        Cancel
      </Button>
      <Button onClick={handleFormSubmit} variant="contained" color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
