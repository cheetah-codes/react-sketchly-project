import { Link, useNavigate } from "react-router-dom";
// import Logo from "../../assets/lendsqr.png";
import { businesses, customers } from "../../utils";
import "./nav.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faSignOut } from "@fortawesome/free-solid-svg-icons";
const SideBar = () => {
  const settings = ["Preferences", "Fees and Pricing", "Audit Logs"];
  const navigate = useNavigate();
  return (
    <>
      <aside className="sidebar-container">
        {/* <div className="set1-container">
          {" "}
          <img
            src={Logo}
            alt="logo"
            onClick={() => navigate(0)}
            aria-placeholder="Search anything"
          />
        </div> */}
        {/* <div className="set2-container"> */}
        <div className="organizations">
          <p className="mg-0 nav-routes">
            Switch Organization
            <span>
              <FontAwesomeIcon
                icon={faCaretDown}
                size="xl"
                style={{ color: "#000" }}
              />
            </span>
          </p>
        </div>
        <div // onClick={() => navigate("/dashboard")}
        >
          <p className="nav-routes mg-0">Dashboard</p>
        </div>
        <div className="customers-content-container">
          <p className="sidebar-section-titles">CUSTOMERS</p>

          <ul>
            {" "}
            {customers.map((customer, idx) => {
              return (
                <li key={idx} className="nav-routes">
                  <Link to="">{customer}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="business-content-container">
          <p className="sidebar-section-titles">BUSSINESSES</p>
          <ul>
            {businesses.map((business, idx) => (
              <li className="nav-routes" key={idx}>
                <Link key={idx} to="">
                  {business}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="settings-content-container">
          <p className="sidebar-section-titles">SETTINGS</p>
          <ul>
            {settings.map((setting, idx) => (
              <li className="nav-routes" key={idx}>
                <Link to="">{setting}</Link>
              </li>
            ))}{" "}
          </ul>

          <footer>
            <div className="link-group">
              <p className="mg-0">
                Log Out
                <FontAwesomeIcon icon={faSignOut} />
              </p>
            </div>
            <p className="mg-0">v1.2.0</p>
          </footer>
        </div>
        {/* </div> */}
      </aside>
    </>
  );
};

export default SideBar;
