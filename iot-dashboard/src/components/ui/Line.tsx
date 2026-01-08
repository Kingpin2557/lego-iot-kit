import { useEffect, useRef, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";

type DataPoint = {
    time: number;
    val: number;
};

type LineProps = {
    value: number;
    maxWindowSeconds?: number;
};

function Line({ value, maxWindowSeconds = 20 }: LineProps) {
    const [history, setHistory] = useState<DataPoint[]>([]);
    const startTimeRef = useRef<number>(performance.now());

    console.log("hello")
    useEffect(() => {
        const now = performance.now();
        const elapsed = (now - startTimeRef.current) / 1000;

        setHistory((prev) => {
            const next = [...prev, { time: elapsed, val: value }];

            // Keep only points within the last `maxWindowSeconds`
            const minTime = elapsed - maxWindowSeconds;
            return next.filter((p) => p.time >= minTime);
        });
    }, [value, maxWindowSeconds]);

    if (history.length === 2) return <p>Wachten op data... (Huidige waarde: {value})</p>;

    return (
        <section className="c-section">
            <h2>Live Distance</h2>

            <LineChart
                xAxis={[
                    {
                        data: history.map((p) => p.time),
                        scaleType: "linear",
                        label: "Time (s)",
                        valueFormatter: (v) => (v != null ? `${v.toFixed(1)}s` : ""),
                        min: history[0]?.time,
                        max: history[history.length - 1]?.time,
                    },
                ]}
                series={[
                    {
                        data: history.map((p) => p.val),
                        curve: "monotoneX", // smooth curve
                        area: false,
                        showMark: false,
                    },
                ]}
                height={200}
                skipAnimation
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
            />
        </section>
    );
}

export default Line;
