import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../services/axiosInstance';

const Profile = () => {
  const { client } = useAuth();
  const [profileData, setProfileData] = useState({
    nationalCardCode: '',
    phoneNumber: '',
    birthday: '',
    additionalDetails: {
      newsletter: false,
      offers: false,
      updates: false,
    },
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
          `/api/client/profile/${client.clientId}`
        );
        setProfileData((prevData) => ({
          ...prevData,
          ...response.data,
          birthday: response.data.birthday
            ? new Date(response.data.birthday).toISOString().split('T')[0]
            : '',
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
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      additionalDetails: {
        ...prevData.additionalDetails,
        [name]: checked,
      },
    }));
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
      const response = await axiosInstance.post(
        `/api/client/profile/${client.clientId}`,
        profileData
      );
      setProfileData((prevData) => ({
        ...prevData,
        ...response.data,
        birthday: response.data.birthday
          ? new Date(response.data.birthday).toISOString().split('T')[0]
          : '',
      }));
      setIsModalOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
      console.log('Profile updated successfully:', response.data);
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
            <Typography variant="body1">
              {profileData.additionalDetails.newsletter && 'Subscribed to Newsletter. '}
              {profileData.additionalDetails.offers && 'Receives Special Offers. '}
              {profileData.additionalDetails.updates && 'Gets Product Updates. '}
            </Typography>
          </Grid>
          {/* Action Button */}
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button variant="contained" onClick={handleModalOpen}>
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Edit Profile Modal */}
      <Dialog open={isModalOpen} onClose={handleModalClose} fullWidth maxWidth="sm">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleFormSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* National Card Code */}
              <Grid item xs={12}>
                <TextField
                  label="National Card Code"
                  name="nationalCardCode"
                  value={profileData.nationalCardCode}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              {/* Phone Number */}
              <Grid item xs={12}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
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
                  value={profileData.birthday}
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
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={profileData.additionalDetails.newsletter}
                        onChange={handleCheckboxChange}
                        name="newsletter"
                      />
                    }
                    label="Subscribe to Newsletter"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={profileData.additionalDetails.offers}
                        onChange={handleCheckboxChange}
                        name="offers"
                      />
                    }
                    label="Receive Special Offers"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={profileData.additionalDetails.updates}
                        onChange={handleCheckboxChange}
                        name="updates"
                      />
                    }
                    label="Get Product Updates"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="primary">
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
