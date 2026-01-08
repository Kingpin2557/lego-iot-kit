import { Switch } from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";

type ButtonProps = {
    initialChecked?: boolean;
};

function OnOffSwitch({ initialChecked }: ButtonProps) {
    const [checked, setChecked] = useState(initialChecked ?? false);

    // Sync with parent updates
    useEffect(() => {
        setChecked(initialChecked ?? false);
    }, [initialChecked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    return (
        <section className="c-section">
            <h2>Switch</h2>
            <Switch
                className="c-component"
                checked={checked}
                onChange={handleChange}
                slotProps={{ input: { "aria-label": "controlled" } }}
            />
        </section>
    );
}

export default OnOffSwitch;
