import { Modal } from "react-bootstrap";
import * as React from "react";

interface CustomModalProps {
    show: boolean;
    onHide: () => void;
}

function SettingModal({ show, onHide }: CustomModalProps) {

    async function handleUpdateSensor(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);
        const name = formData.get("submitted-name");
        const password = formData.get("submitted-password");


        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/wifi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        ssid: name,
                        password: password
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            onHide();
        } catch (error) {
            console.error("Failed to update wifi settings:", error);
        }
    }
    return (
        <Modal
            show={show}
            onHide={onHide}
            dialogClassName="modal-90w"
            aria-labelledby="example-custom-modal-styling-title"
        >
            <Modal.Header closeButton>
                <Modal.Title id="example-custom-modal-styling-title">
                    Settings
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleUpdateSensor}>
                    <label>
                        Wifi name:
                        <input name="submitted-name" type="text" />
                    </label>

                    <label>
                        Wifi password:
                        <input name="submitted-password" type="password" />
                    </label>

                    <button type={"submit"}>
                        Update wifi settings
                    </button>
                </form>
            </Modal.Body>
            <Modal.Footer>
            </Modal.Footer>
        </Modal>
    );
}

export default SettingModal;