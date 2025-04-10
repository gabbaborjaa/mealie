import { signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "../firebase-config";
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import '../Mealie.css';

function LoginModal() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in:", userCredential.user);
            handleClose();
        } catch (error){
            console.error("Login error:", error.message);
            alert("Login failed" + error.message);
        }
        // console.log("Email: ", email);
        // console.log("Password: ", password);

        handleClose();
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Login
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100 mt-3">
                            Login
                        </Button>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LoginModal;