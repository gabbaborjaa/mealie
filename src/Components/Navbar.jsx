import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginModal from './LoginModal';
import '../Mealie.css'


function NavBar() {
  return (
    <Navbar expand="lg" className="Navbar">
      <Container className="d-flex justify-content-center align-items-center">
        <Navbar.Brand href="#home">Mealie</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav>
            <Nav.Link>
              <LoginModal />
            </Nav.Link>
            
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;