import React from "react";

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
    values?: { [key: string]: string }; // key = data key, value = display name
}

const GraphTooltip: React.FC<CustomTooltipProps> = ({ active, payload, values }) => {
    if (active && payload && payload.length && values) {
        const data = payload[0].payload;

        return (
            <div
                style={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                }}
            >
                {Object.keys(values).map((key) => (
                    <p key={key} style={{ margin: 0 }}>
                        <strong>{values[key]}:</strong> {data[key]}
                    </p>
                ))}
            </div>
        );
    }

    return null;
};

export default GraphTooltip;
