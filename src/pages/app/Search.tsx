import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import "./nav.scss";

const Search = () => {
  const allowedProps = { attribute: "form-control" };
  return (
    <>
      <div className="set2-container">
        <div className="search"></div>
        <div className="input-wrapper">
          <input
            className="search-input"
            type="text"
            placeholder="Search for anything"
            {...allowedProps}
            spellCheck="false"
          />
        </div>
        <button>
          <FontAwesomeIcon
            icon={faSearch}
            size="xl"
            style={{ marginRight: "15px" }}
          />
        </button>
      </div>
    </>
  );
};

export default Search;
