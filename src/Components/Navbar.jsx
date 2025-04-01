import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import LoginModal from './LoginModal';
import '../Mealie.css';

function NavBar({ setShowModal }) {
  return (
    <Navbar expand="lg" className="Navbar">
      <Container>
        <Navbar.Brand href="#home" className="mx-auto">Mealie</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto"> </Nav>
          <div className="navbar-buttons"> 
          <Button
            
            onClick={() => {}}
            className="button"
          >
            <LoginModal />
          </Button>
          <Button
            
            onClick={() => setShowModal(true)} // Open the Add Meal modal
            className="button"
          >
            Add Meal
          </Button>
          </div>
          
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;