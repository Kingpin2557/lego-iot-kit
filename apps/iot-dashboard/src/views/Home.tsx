import 'bootstrap-icons/font/bootstrap-icons.css';
import '../App.css'
import Button from "../components/Button.tsx";
import SensorType from "../components/SensorType.tsx";
import {Col, Container, Row} from "react-bootstrap";
import {useEffect, useState} from "react";

type UserConfig = {
    name: string;
    type: string;
}

type Sensor = {
    id: number;
    data: Array<number>;
    userConfig: UserConfig | null;
}

type SensorContainer = {
    sensors: Sensor[];
}

async function fetchData(url: string): Promise<SensorContainer> {
    const res = await fetch(url);

    if (!res.ok) {
        throw new Error('Something went wrong!');
    }

    return res.json();
}

function Home() {
    const [sensorData, setSensorData] = useState<SensorContainer>({sensors: []});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadData = async () => {
        try {
            const data = await fetchData(`https://sensor-routes.vercel.app/sensors`);
            setSensorData(data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (isLoading) {
        return <div>Loading sensor data...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const unconfiguredSensors = sensorData.sensors.filter(sensor => {
        const config = sensor.userConfig;

        return !config || config.type === "" || config.name === "";
    });

    const groupedSensors = sensorData.sensors.reduce((acc, sensor) => {
        const type = sensor.userConfig?.type || 'Unconfigured';

        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(sensor);
        return acc;
    }, {} as Record<string, typeof sensorData.sensors>);



    return (
        <Container>
            <Row>
                <Col lg={6}>
                    {unconfiguredSensors.length > 0 && (
                        <SensorType title="Incoming Sensors">
                            {unconfiguredSensors.map((sensor) => (
                                <Button
                                    key={sensor.id}
                                    sensor={sensor}
                                    icon={"gear"}
                                    isNewSensor={true}
                                    onUpdate={loadData}
                                />
                            ))}
                        </SensorType>
                    )}
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    {Object.keys(groupedSensors).map((sensorType) => {
                        if (sensorType === 'Unconfigured') return null;

                        const sensorsInGroup = groupedSensors[sensorType];

                        return (
                            <SensorType key={sensorType} title={sensorType}>
                                {sensorsInGroup.map((sensor) => (
                                    <Button
                                        key={sensor.id}
                                        sensor={sensor}
                                        icon="check-circle-fill"
                                        isNewSensor={false}
                                        onUpdate={loadData}
                                    />
                                ))}
                            </SensorType>
                        );
                    })}
                </Col>
            </Row>
        </Container>
    );
}

export default Home;