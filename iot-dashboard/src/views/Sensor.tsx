import { useLocation } from "react-router-dom";
import { uiLookup } from "../scripts/UiLookup.ts";
import { useEffect, useState } from "react";

type UserConfig = {
    name: string;
    type: string;
};

type DataValue = number | string | boolean;

type Sensor = {
    id: number;
    data: Record<string, DataValue>;
    userConfig: UserConfig | null;
};

type SensorData = {
    sensor: Sensor;
};

function Sensor() {
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const location = useLocation();

    async function getSensorById(id: number) {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_BASE_URL}/sensor/${id}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            setSensorData(data);
        } catch (error) {
            console.error("Failed to fetch sensor:", error);
        }
    }

    useEffect(() => {
        const id = location.state as number;
        if (!id) return;

        getSensorById(id);

        const interval = setInterval(() => {
            getSensorById(id);
        }, 200);
        return () => clearInterval(interval);
    }, [location.state]);

    if (!sensorData) return <p>Loading...</p>;

    const dataObject = sensorData.sensor.data;
    const config = sensorData.sensor.userConfig;
    console.log(config);

    return (
        <div>
            <h1>{config?.name}</h1>
            <div className="c-grid">
                {Object.entries(dataObject).map(([uiKey, value]) => {
                    const lookupKey = uiKey as keyof typeof uiLookup;
                    const Component = uiLookup[lookupKey];

                    if (!Component) return null;

                    if (lookupKey === "switch") {
                        return (
                            <Component
                                key={uiKey}
                                initialChecked={Boolean(value)} value={0}
                            />
                        );
                    }

                    if (lookupKey === "line") {
                        return (
                            <Component
                                key={uiKey}
                                value={Number(value)}
                            />
                        );
                    }

                    return null;
                })}
            </div>
        </div>
    );
}

export default Sensor;