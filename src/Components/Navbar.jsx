import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import { useState, useEffect } from 'react';
// import { onAuthStateChanged } from 'firebase/auth';
// import { auth } from '../firebase-config';
import { Button } from 'react-bootstrap';
import SignUpModal from './SignupModal';
import LoginModal from './LoginModal';
import LogoutButton from './Logout';
import '../Mealie.css';

function NavBar({ userName }) {
  return (
    <Navbar expand="lg" className="Navbar">
      <Container>
        <Navbar.Brand href="#home" className="mx-auto">Mealie</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"></Nav>
          <div className="navbar-buttons">
            {userName ? (
              <div className="nav-button-container">
                {/* Styled username button */}
                <Button variant="outline-primary" className="username-button">
                  Hello, {userName}!
                </Button>
                <LogoutButton />
              </div>
            ) : (
              <div className="nav-button-container">
                <LoginModal />
                <SignUpModal />
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;