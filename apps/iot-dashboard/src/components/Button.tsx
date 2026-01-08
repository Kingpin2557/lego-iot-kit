import { useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import * as React from "react";
import { uiLookup } from "../scripts/UiLookup.ts";

type UserConfig = {
    name: string;
    type: string;
};

// Defined the base primitive types to avoid 'any'
type DataValue = number | string | boolean;

type Sensor = {
    id: number;
    data: DataValue[] | Record<string, DataValue>;
    userConfig: UserConfig | null;
};

type ButtonProps = {
    sensor: Sensor;
    icon?: string; // Made optional with default in destructuring
    isNewSensor: boolean;
    onUpdate: () => void;
};

function Button({ sensor, icon = "gear", isNewSensor, onUpdate }: ButtonProps) {
    const [show, setShow] = useState(false);

    // Helper to ensure we are always mapping over an array
    // This solves the TS2349 error
    const dataArray: DataValue[] = Array.isArray(sensor.data)
        ? sensor.data
        : Object.values(sensor.data);

    const slugify = (text: string) => {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
    };

    const hasConfig = !!sensor?.userConfig?.name;
    const configSlug = hasConfig ? slugify(sensor.userConfig!.name) : "";

    function handleClick() {
        if (isNewSensor) setShow(true);
    }

    async function handleUpdateSensor(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const name = formData.get("submitted-name") as string;
        const type = formData.get("submitted-type") as string;

        const newData: Record<string, DataValue> = {};

        dataArray.forEach((value, i) => {
            const selectedUi = formData.get(`ui-mapping-${i}`) as string;
            if (selectedUi) {
                newData[selectedUi] = value;
            }
        });

        if (!sensor?.id) return;

        try {
            const response = await fetch(`https://sensor-routes.vercel.app/sensor/${sensor.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userConfig: { name, type },
                    data: newData
                }),
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);
            setShow(false);
            onUpdate();
        } catch (error) {
            console.error("Failed to update sensor:", error);
        }
    }

    const content = (
        <>
            {sensor?.userConfig?.name || sensor?.id}
            <i className={`bi bi-${icon}`}></i>
        </>
    );

    return (
        <>
            {hasConfig && !isNewSensor ? (
                <Link to={`/${configSlug}`} state={sensor.id}>{content}</Link>
            ) : (
                <button onClick={handleClick}>{content}</button>
            )}

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Sensor ID: {sensor?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleUpdateSensor}>
                        <Form.Group className="mb-3">
                            <Form.Label>Component name:</Form.Label>
                            <Form.Control name="submitted-name" placeholder="Enter component name" required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Component type:</Form.Label>
                            <Form.Select name="submitted-type" defaultValue="Sensor">
                                <option value="Sensor">Sensor</option>
                                <option value="Actuator">Actuator</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Assign UI Components to Data:</Form.Label>
                            {dataArray.map((value, i) => (
                                <div key={i} className="c-ui d-flex gap-2 mb-2 align-items-center">
                                    <span className="badge bg-secondary">Value: {String(value)}</span>
                                    <Form.Select name={`ui-mapping-${i}`} required>
                                        <option value="">Select UI...</option>
                                        {Object.keys(uiLookup).map((key) => (
                                            <option key={key} value={key}>
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                            ))}
                        </Form.Group>

                        <button type="submit" className="btn btn-primary">
                            Update settings
                        </button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default Button;