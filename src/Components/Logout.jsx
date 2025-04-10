import { signOut } from "firebase/auth";
import { auth } from "../firebase-config";
import { Button } from "react-bootstrap";

function LogoutButton() {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("User logged out");
            alert("User logged out");
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    return <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>;
}

export default LogoutButton;
