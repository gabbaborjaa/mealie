import { useState } from "react";
import { Button, Modal, Form} from "react-bootstrap";
import { auth, db } from "../firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc    } from "firebase/firestore";
import '../Mealie.css';

function SignUpModal() {
    const [show, setShow] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleSignUp = async (e) => {
        e.preventDefault();

        // Validate name
        if (name.length < 3) {
            alert("Name must be at least 3 characters long.");
            return;
        }

        // Validate password
        const passwordRegex = /^(?=.*[0-9]).{6,}$/; // At least 6 characters and contains a number
        if (!passwordRegex.test(password)) {
            alert("Password must be at least 6 characters long and contain at least one number.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
            });

            console.log("User signed up:", userCredential.user);
            alert("User signed up successfully!");
            handleClose();
        } catch (error) {
            if (error.code === "auth/email-already-in-use"){
                alert("This email is already registered. Please use a different email.");
            }
            console.error(error.message);
            alert(error.message);
        }
    };

    return (
        <>
            <Button variant="secondary" onClick={handleShow}>
                Sign Up
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Create an Account</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSignUp}>
                        <Form.Group className="mb-3" controlId="formName">
                            <Form.Control
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Label>Email Address</Form.Label>
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
                        <Button variant="success" type="submit" className="w-100 mt-3">
                            Sign Up
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default SignUpModal;