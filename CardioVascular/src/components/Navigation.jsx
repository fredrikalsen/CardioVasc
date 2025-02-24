import { Link } from 'react-router-dom';
import '../styles/Navigation.css'; // Import CSS for styling

function Navigation() {
    return (
        <nav className="navigation">
            <ul className="nav-list">
                <li className="nav-item">
                    <Link to="/" className="nav-link">World Map</Link>
                </li>
                <li className="nav-item">
                    <Link to="/uk" className="nav-link">UK Map</Link>
                </li>
                <li className="nav-item">
                    <Link to="/usa" className="nav-link">USA Map</Link>
                </li>
                <li className="nav-item">
                    <Link to="/about" className="nav-link">About</Link>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;
