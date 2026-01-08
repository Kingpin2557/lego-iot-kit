import {Route, Routes} from "react-router-dom";
import Layout from "./Layout.tsx";
import Home from "./views/Home.tsx";
import Sensor from "./views/Sensor.tsx";

function App() {
    return (
        <Routes>
            <Route element={<Layout/>}>
                <Route path={"/"} element={<Home />} />
                <Route path={"/:name"} element={<Sensor />} />
            </Route>
        </Routes>
    )
}

export default App;