import {Children, type ReactNode} from "react";

type Section = {
    title: string,
    children: ReactNode
}

function SensorType({title, children}:Section) {

    if (Children.toArray(children).length === 0) return null

    return (
        <section>
            <h2>{title}</h2>
            <div className="c-type">
                {children}
            </div>
        </section>
    );
}

export default SensorType;