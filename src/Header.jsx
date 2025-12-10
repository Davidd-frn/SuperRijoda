import { NavLink } from "react-router-dom";

function Header() {
  const navItems = [
    { to: "/description", label: "Description" },
    { to: "/sketch", label: "Sketch" },
    { to: "/mockup", label: "Mockup" },
    { to: "/flow", label: "Flow" },
    { to: "/logbook", label: "Logbook" },
    { to: "/game", label: "Game" },
  ];

  return (
    <header>
      <h1>HES-SO VS - 64-31 - Web Development</h1>
      <nav>
        <ul>
          <li className="hamburger">
            <img
              src="ressources/images/hamburger_icon.svg"
              alt="Menu"
              width="24"
              height="24"
            />
          </li>
          {navItems.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
