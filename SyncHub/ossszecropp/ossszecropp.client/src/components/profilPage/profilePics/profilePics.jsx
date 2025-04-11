// profilePics.jsx
import React from "react";
import { message } from "antd";
import ProfilePicModal from "./picUpload/ProfilePicModal";
import axiosInstance from '../../../utils/axiosInstance';

const ProfilePics = ({ visible, onClose, onSuccess }) => {
    const handleDeleteProfilePic = async () => {
        try {
            const response = await axiosInstance.delete('/api/Employees/delete-profile-photo');

            if (response.status === 200) {
                message.success('Profile picture deleted successfully');
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            }
        } catch (error) {
            console.error('Error deleting profile picture:', error);
            message.error('Failed to delete profile picture');
        }
    };

    return (
        <ProfilePicModal
            visible={visible}
            onClose={onClose}
            onSuccess={onSuccess}
            onDelete={handleDeleteProfilePic}
        />
    );
};

export default ProfilePics;
