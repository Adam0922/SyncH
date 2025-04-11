import React, { useState } from "react";
import { Upload, message, Button, Flex } from "antd";
import { InboxOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../utils/axiosInstance';

const { Dragger } = Upload;

const ProfilePicUploader = ({ onSuccess, onClose, onDelete }) => {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async () => {
        console.log('handleUpload called, fileList:', fileList);

        if (fileList.length === 0) {
            message.error('Please select an image to upload');
            return;
        }

        const file = fileList[0];
        console.log('File object:', file);

        if (!file) {
            console.error('File object is invalid');
            message.error('Invalid file object');
            return;
        }

        const fileToUpload = file instanceof File ? file : (file.originFileObj || null);

        if (!fileToUpload) {
            console.error('Cannot find valid file to upload');
            message.error('Invalid file object');
            return;
        }

        const formData = new FormData();
        formData.append('profilePhoto', fileToUpload);

        console.log('FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        setUploading(true);
        try {
            console.log('Sending request to:', '/api/Employees/upload-profile-photo');
            const response = await axiosInstance.post('/api/Employees/upload-profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Upload response:', response);
            setUploading(false);
            message.success('Profile picture uploaded successfully');

            setFileList([]);

            if (onSuccess) {
                onSuccess();
            }

            onClose();
        } catch (error) {
            setUploading(false);
            console.error('Error uploading profile picture:', error);
            console.error('Error details:', error.response ? error.response.data : 'No response data');
            message.error('Failed to upload profile picture');
        }
    };

    const props = {
        name: 'profilePhoto',
        multiple: false,
        action: null,
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            console.log('File selected:', file);

            const isAllowed = file.type === 'image/svg+xml' ||
                file.type === 'image/png' ||
                file.type === 'image/jpeg';

            console.log('File type check:', isAllowed);

            if (!isAllowed) {
                message.error(`${file.name} is not an allowed file type`);
                return Upload.LIST_IGNORE;
            }

            const isValidSize = new Promise((resolve, reject) => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    console.log('Image dimensions:', width, 'x', height);
                    URL.revokeObjectURL(img.src);
                    if (width <= 300 && height <= 300) {
                        console.log('Size validation passed');
                        setFileList([file]);
                        resolve(false);
                    } else {
                        console.log('Size validation failed');
                        message.error(`Image must be maximum 300x300 pixels`);
                        reject(false);
                    }
                };
            });

            return isValidSize;
        },
        fileList,
        customRequest: ({ file, onSuccess }) => {
            setTimeout(() => {
                onSuccess("ok");
            }, 0);
        },
    };

    return (
        <>
            <Dragger
                {...props}
                accept=".svg,.png,.jpg,.jpeg"
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                    Support for a single upload. Only SVG, PNG, JPG, JPEG files are allowed.
                </p>
                <p className="ant-upload-hint">
                    Image must be maximum 300x300 pixels.
                </p>
            </Dragger>

            <Flex justify="center" style={{ marginTop: "1rem" }}>
                <Button
                    type="primary"
                    onClick={() => {
                        console.log('Upload button clicked');
                        handleUpload();
                    }}
                    disabled={fileList.length === 0}
                    loading={uploading}
                    icon={<SaveOutlined />}
                    style={{ border: "#14213d solid 1px", boxShadow: "none", width: "20vh" }}
                >
                    {uploading ? 'Uploading' : 'Upload'}
                </Button>
            </Flex>
        </>
    );
};

export default ProfilePicUploader;
