import { useLocation } from "react-router-dom";
import { uiLookup } from "../scripts/UiLookup.ts";
import { useEffect, useState } from "react";
// @ts-ignore
import Line from "../components/ui/Line.tsx";
// @ts-ignore
import Switch from "../components/ui/OnOffSwitch.tsx";

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

    // Functie definiëren om data op te halen (Lost TS2304 op)
    async function getSensorById(id: number) {
        try {
            const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${baseUrl}/sensor/${id}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            setSensorData(data); // Gebruik de setter (Lost TS6133 op)
        } catch (error) {
            console.error("Failed to fetch sensor:", error);
        }
    }

    useEffect(() => {
        // Haal het ID uit de state die we via de Link hebben meegegeven
        const id = (location.state as { sensorId?: number })?.sensorId;

        if (!id) {
            console.warn("Geen sensorId gevonden in location.state.");
            return;
        }

        getSensorById(id);

        const interval = setInterval(() => {
            getSensorById(id);
        }, 500);

        return () => clearInterval(interval);
    }, [location.state]);

    if (!sensorData) return <p>Loading...</p>;

    const dataObject = sensorData.sensor.data;
    const config = sensorData.sensor.userConfig;

    return (
        <div>
            <h1>{config?.name}</h1>
            <div className="c-grid">
                {Object.entries(dataObject).map(([uiKey, value]) => {
                    // Check of de key in de data een index is (bijv "0")
                    const isIndex = !isNaN(Number(uiKey));
                    // Fallback naar config type als de API alleen array-indexen stuurt
                    const lookupKey = isIndex
                        ? (config?.type === "Sensor" ? "line" : "switch")
                        : uiKey;

                    const Component = uiLookup[lookupKey as keyof typeof uiLookup];

                    if (!Component) return null;

                    if (lookupKey === "switch") {
                        return (
                            <Component
                                key={uiKey}
                                initialChecked={Boolean(value)}
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

                    return <Component key={uiKey} value={value} />;
                })}
            </div>
        </div>
    );
}

export default Sensor;