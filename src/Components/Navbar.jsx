import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config';
import SignUpModal from './SignupModal';
import LoginModal from './LoginModal';
import LogoutButton from './Logout';
import '../Mealie.css';

function NavBar({ setShowModal }) {
  const [user, setUser] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  return (
    <Navbar expand="lg" className="Navbar">
      <Container>
        <Navbar.Brand href="#home" className="mx-auto">Mealie</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"></Nav>
          <div className="navbar-buttons">
            {user ? (
              // Show Logout button when user is signed in
              <LogoutButton />
            ) : (
              // Show Login and Sign Up buttons when no user is signed in
              <>
                <LoginModal />
                <SignUpModal />
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;