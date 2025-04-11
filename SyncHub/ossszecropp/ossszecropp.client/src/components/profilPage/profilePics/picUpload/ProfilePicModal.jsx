// ProfilePicModal.jsx
import React from "react";
import { Typography, Row, Col, Button, Flex, Modal } from "antd";
import { RollbackOutlined, DeleteOutlined } from '@ant-design/icons';
import ProfilePicUploader from "./ProfilePicUploader";

const ProfilePicModal = ({ visible, onClose, onSuccess, onDelete }) => {
    return (
        <Modal
            title={<Typography.Title level={3}>Upload Profile Picture</Typography.Title>}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Flex gap='0.1vh' justify='space-between' vertical>
                <Row style={{ marginTop: "1vh" }}>
                    <Typography.Text>
                        Upload a profile picture to personalize your account. The image will be displayed on your profile.
                    </Typography.Text>
                </Row>

                <Row gutter={[24, 24]} style={{ marginTop: "2vh" }}>
                    <Col span={24}>
                        <ProfilePicUploader onSuccess={onSuccess} onClose={onClose} onDelete={onDelete} />
                    </Col>
                </Row>

                <Row gutter={24} style={{ marginTop: "3vh" }}>
                    <Col span={24}>
                        <Flex justify="space-between">
                            <Button
                                icon={<RollbackOutlined />}
                                onClick={onClose}
                                style={{ border: 'none', boxShadow: '0 0 0 rgba(255,255,255,255.0)' }}
                            >
                                Cancel
                            </Button>

                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={onDelete}
                                style={{ border: 'none', boxShadow: '0 0 0 rgba(255,255,255,255.0)' }}
                            >
                                Delete Photo
                            </Button>
                        </Flex>
                    </Col>
                </Row>
            </Flex>
        </Modal>
    );
};

export default ProfilePicModal;
