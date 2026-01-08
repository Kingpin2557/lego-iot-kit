import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import {useState} from "react";
import SettingModal from "./components/SettingModal.tsx";

const Layout = () => {
    const [showSettings, setShowSettings] = useState(false);

    function handleSettings() {
        setShowSettings(true);
    }
    return (
        <>
            <Container>
                <nav className="navbar navbar-light bg-light">
                    <h1>IoT Kit</h1>
                    <button onClick={handleSettings}>
                        <i className={`bi bi-gear`}></i>
                    </button>
                </nav>
            </Container>

            <Container>
                <Outlet />
            </Container>

            <SettingModal
                show={showSettings}
                onHide={() => setShowSettings(false)}
            />
        </>
    );
};

export default Layout;