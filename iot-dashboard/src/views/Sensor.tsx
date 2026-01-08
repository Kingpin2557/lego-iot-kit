import { useLocation } from "react-router-dom";
import { uiLookup } from "../scripts/UiLookup.ts";
import { useEffect, useState } from "react";
// @ts-ignore
import Line from "../components/ui/Line.tsx";
// @ts-ignore
import OnOffSwitch from "../components/ui/OnOffSwitch.tsx";

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

    const dataObject = sensorData.sensor.data; // Dit is dus bijv. [42]
    const config = sensorData.sensor.userConfig;

    // Haal de eerste waarde uit de array/object
    const sensorValue = Array.isArray(dataObject) ? dataObject[0] : Object.values(dataObject)[0];

    return (
        <div>
            <h1>{config?.name}</h1>
            <div className="c-grid">

                {/* OF als je de uiLookup tabel wilt blijven gebruiken: */}
                {Object.entries(dataObject).map(([key, value]) => {
                    // Forceer de lookup naar 'line' als het een sensor is,
                    // of gebruik een mapping-logica die jij hebt gedefinieerd
                    const Component = uiLookup["line"];

                    return (
                        <Component
                            key={key}
                            value={Number(value)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default Sensor;